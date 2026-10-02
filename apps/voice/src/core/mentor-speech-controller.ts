import { acceptMentorSpeechAlignment, resolveActiveWordIndex } from "./mentor-presentation";
import {
  createVoiceMentorTurnState,
  finalizeVoiceMentorTurnIfReady,
  onVoiceMentorAudioChunk,
  onVoiceMentorAudioCompleted,
  shouldHandleVoiceMentorInterrupted,
  VOICE_TURN_INACTIVITY_TIMEOUT_MS,
} from "./mentor-turn-state";
import { decodeBase64ToBytes } from "./pcm";
import { RealtimePCMPlayer } from "./pcm-player";

import type { MentorSpeechAlignment, MentorSpeechPresentation } from "./types";

export type MentorSpeechControllerOptions = {
  /** Sample rate of incoming mentor PCM. Defaults to 44.1 kHz. */
  sampleRate?: number;
  channels?: number;
  /** A turn without `completeTurn` is finalized after this much silence. Defaults to 5 s. */
  inactivityTimeoutMs?: number;
  onLevelChange?: (level: number) => void;
  onPresentationChange?: (presentation: MentorSpeechPresentation | null) => void;
  /** First accepted chunk of a new mentor turn. */
  onTurnStarted?: (turnId: string) => void;
  /** All audio of the turn has finished playing. */
  onTurnCompleted?: (turnId: string) => void;
  /** Playback was cut, either by the server or by learner barge-in. */
  onInterrupted?: () => void;
};

export type MentorAudioChunk = {
  turnId: string;
  seq: number;
  /** Raw PCM s16le bytes or a base64 string of them. */
  audio: ArrayBuffer | Uint8Array | string;
};

/**
 * Plays streamed mentor speech turn by turn: drops stale/out-of-order chunks, finalizes turns on
 * completion or inactivity, supports barge-in and tracks the currently spoken word.
 */
export class MentorSpeechController {
  private readonly player: RealtimePCMPlayer;
  private readonly inactivityTimeoutMs: number;
  private readonly options: MentorSpeechControllerOptions;
  private turnState = createVoiceMentorTurnState();
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private alignment: MentorSpeechAlignment | null = null;
  private presentation: MentorSpeechPresentation | null = null;

  constructor(options: MentorSpeechControllerOptions = {}) {
    this.options = options;
    this.inactivityTimeoutMs = options.inactivityTimeoutMs ?? VOICE_TURN_INACTIVITY_TIMEOUT_MS;
    this.player = new RealtimePCMPlayer({
      sampleRate: options.sampleRate ?? 44100,
      channels: options.channels ?? 1,
      onLevelChange: options.onLevelChange,
      onPlaybackProgress: (progress) => {
        const alignment = this.alignment;
        if (!alignment) {
          return;
        }

        const activeWordIndex = progress
          ? resolveActiveWordIndex(alignment, progress.turnId, progress.elapsedMs)
          : null;
        const current = this.presentation;
        if (
          current?.turnId === alignment.turnId &&
          current.sequence === alignment.sequence &&
          current.activeWordIndex === activeWordIndex
        ) {
          return;
        }

        this.setPresentation({ ...alignment, activeWordIndex });
      },
    });
    this.player.setOnIdle(() => this.finalizeTurnIfReady());
  }

  get activeTurnId() {
    return this.turnState.activeTurnId;
  }

  get currentPresentation() {
    return this.presentation;
  }

  /** Creates/resumes the AudioContext. Call from a user gesture to satisfy autoplay policies. */
  async start() {
    this.clearInactivityTimer();
    this.turnState = createVoiceMentorTurnState();
    this.alignment = null;
    this.setPresentation(null);
    await this.player.start();
  }

  /** Enqueues a mentor audio chunk. Returns false when the chunk was dropped. */
  async pushAudio({ turnId, seq, audio }: MentorAudioChunk): Promise<boolean> {
    if (typeof seq !== "number" || !turnId) {
      return false;
    }

    const isNewTurn = !this.turnState.activeTurnId;
    const decision = onVoiceMentorAudioChunk(this.turnState, {
      turnId,
      seq,
      nowMs: Date.now(),
    });
    if (!decision.accept) {
      return false;
    }

    if (decision.hardCut) {
      this.player.reset();
    }

    this.turnState = decision.nextState;
    const bytes = typeof audio === "string" ? decodeBase64ToBytes(audio) : audio;
    if (bytes.byteLength === 0) {
      return false;
    }

    if (isNewTurn) {
      this.options.onTurnStarted?.(turnId);
    }

    await this.player.enqueue(bytes, turnId);
    this.restartInactivityTimer();
    return true;
  }

  /** Word timings for the mentor turn; drives `activeWordIndex` during playback. */
  pushAlignment(incoming: MentorSpeechAlignment) {
    const alignment = acceptMentorSpeechAlignment(this.alignment, incoming);
    this.alignment = alignment;
    const current = this.presentation;
    this.setPresentation({
      ...alignment,
      activeWordIndex: current?.turnId === alignment.turnId ? current.activeWordIndex : null,
    });
  }

  /** The server finished sending audio for the turn; it finalizes once playback drains. */
  completeTurn(turnId?: string) {
    this.turnState = onVoiceMentorAudioCompleted(this.turnState, turnId);
    this.finalizeTurnIfReady();
  }

  /** The server interrupted the turn. Ignored when it targets a different turn. */
  handleInterrupted(turnId?: string) {
    if (!shouldHandleVoiceMentorInterrupted(this.turnState, turnId)) {
      return;
    }

    this.cutPlayback();
  }

  /** Learner barge-in: stops current mentor speech if any. Returns true when something was cut. */
  interrupt(): boolean {
    if (!this.turnState.activeTurnId) {
      return false;
    }

    this.cutPlayback();
    return true;
  }

  /** Silences playback and forgets turn and alignment state without notifying listeners. */
  reset() {
    this.player.reset();
    this.clearInactivityTimer();
    this.turnState = createVoiceMentorTurnState();
    this.alignment = null;
    this.setPresentation(null);
  }

  async destroy() {
    this.reset();
    await this.player.destroy().catch(() => undefined);
  }

  private cutPlayback() {
    this.player.reset();
    this.clearInactivityTimer();
    this.turnState = createVoiceMentorTurnState();
    this.options.onInterrupted?.();
  }

  private finalizeTurnIfReady() {
    const next = finalizeVoiceMentorTurnIfReady(this.turnState, {
      nowMs: Date.now(),
      timeoutMs: this.inactivityTimeoutMs,
      isPlayerIdle: this.player.isIdle(),
    });

    this.turnState = next.nextState;
    if (!next.finalizedTurnId) {
      return;
    }

    this.clearInactivityTimer();
    this.options.onTurnCompleted?.(next.finalizedTurnId);
  }

  private restartInactivityTimer() {
    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => this.finalizeTurnIfReady(), this.inactivityTimeoutMs);
  }

  private clearInactivityTimer() {
    if (!this.inactivityTimer) {
      return;
    }

    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = null;
  }

  private setPresentation(presentation: MentorSpeechPresentation | null) {
    if (presentation === this.presentation) {
      return;
    }

    this.presentation = presentation;
    this.options.onPresentationChange?.(presentation);
  }
}
