import { beforeEach, describe, expect, it, vi } from "vitest";

import { VoiceCapture } from "./voice-capture";

import type { PcmChunkMeta, SpeechBoundary } from "./types";

type VadCallbacks = {
  preSpeechPadMs: number;
  redemptionMs: number;
  negativeSpeechThreshold: number;
  onFrameProcessed: (probabilities: { isSpeech: number }, frame: Float32Array) => void;
  onSpeechRealStart: () => void;
  onSpeechEnd: () => void;
  onVADMisfire: () => void;
};

const vadHarness = vi.hoisted(() => ({
  callbacks: [] as VadCallbacks[],
  destroyed: 0,
}));

vi.mock("@ricky0123/vad-web", () => ({
  MicVAD: {
    new: vi.fn(async (callbacks: VadCallbacks) => {
      vadHarness.callbacks.push(callbacks);
      return {
        start: vi.fn(async () => undefined),
        pause: vi.fn(async () => undefined),
        destroy: vi.fn(async () => {
          vadHarness.destroyed += 1;
        }),
      };
    }),
  },
}));

const createHarness = async ({ keepTurnOpen = false, firstChunkSeq = 1 } = {}) => {
  const chunks: PcmChunkMeta[] = [];
  const events: Array<{ type: "start" | "end"; boundary: SpeechBoundary }> = [];
  const capture = new VoiceCapture({
    onChunk: (_chunk, meta) => chunks.push(meta),
    onSpeechStart: (boundary) => events.push({ type: "start", boundary }),
    onSpeechEnd: (boundary) => events.push({ type: "end", boundary }),
  });
  await capture.start({ keepTurnOpen, firstChunkSeq });

  const callbacks = vadHarness.callbacks.at(-1);
  if (!callbacks) {
    throw new Error("VAD_CALLBACKS_NOT_CAPTURED");
  }

  const ends = () => events.filter(({ type }) => type === "end");
  const starts = () => events.filter(({ type }) => type === "start");

  return { callbacks, capture, chunks, events, ends, starts };
};

const energeticFrame = () => new Float32Array(512).fill(0.03);
const silentFrame = () => new Float32Array(512).fill(0.001);

const emitSilenceWindow = (callbacks: VadCallbacks) => {
  for (let index = 0; index < 6; index += 1) {
    callbacks.onFrameProcessed({ isSpeech: 0 }, silentFrame());
  }
};

describe("VoiceCapture client VAD", () => {
  beforeEach(() => {
    vadHarness.callbacks.length = 0;
    vadHarness.destroyed = 0;
  });

  it("forwards energetic filler once, drops low-energy frames, and emits one end boundary", async () => {
    const { callbacks, chunks, ends } = await createHarness();

    callbacks.onSpeechRealStart();
    callbacks.onSpeechEnd();
    callbacks.onFrameProcessed({ isSpeech: 0 }, energeticFrame());
    emitSilenceWindow(callbacks);
    callbacks.onSpeechEnd();

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ samples: 512, seq: 1 });
    expect(ends()).toHaveLength(1);
    expect(ends()[0]?.boundary.lastChunkSeq).toBe(1);
  });

  it("turns an active-segment misfire into a deferred exact-once end", async () => {
    const { callbacks, ends } = await createHarness();

    callbacks.onSpeechRealStart();
    callbacks.onVADMisfire();
    emitSilenceWindow(callbacks);
    callbacks.onVADMisfire();

    expect(ends()).toHaveLength(1);
  });

  it("numbers chunks from firstChunkSeq and boundaries from 1", async () => {
    const { callbacks, chunks, events } = await createHarness({ firstChunkSeq: 10 });

    callbacks.onSpeechRealStart();
    callbacks.onFrameProcessed({ isSpeech: 1 }, energeticFrame());
    callbacks.onSpeechEnd();
    emitSilenceWindow(callbacks);

    expect(chunks[0]?.seq).toBe(10);
    expect(events.map(({ boundary }) => boundary.boundarySeq)).toEqual([1, 2]);
    expect(events[0]?.boundary.lastChunkSeq).toBe(-1);
  });

  it("ignores VAD callbacks after stop", async () => {
    const { callbacks, capture, chunks, events } = await createHarness();

    await capture.stop();
    callbacks.onSpeechRealStart();
    callbacks.onFrameProcessed({ isSpeech: 1 }, energeticFrame());
    callbacks.onSpeechEnd();

    expect(chunks).toHaveLength(0);
    expect(events).toHaveLength(0);
    expect(vadHarness.destroyed).toBe(1);
  });

  it("recreates MicVAD for a new session", async () => {
    const { capture } = await createHarness();

    await capture.stop();
    await capture.start();

    expect(vadHarness.callbacks).toHaveLength(2);
  });

  it("rejects a second start while the current session is active", async () => {
    const { capture } = await createHarness();

    await expect(capture.start()).rejects.toThrow("VOICE_CAPTURE_ALREADY_ACTIVE");
  });

  it("uses VAD as boundaries while forwarding every real frame in an open learner turn", async () => {
    const { callbacks, capture, chunks, ends, starts } = await createHarness({
      keepTurnOpen: true,
    });

    expect(callbacks.redemptionMs).toBe(600);
    expect(callbacks.negativeSpeechThreshold).toBe(0.18);
    expect(callbacks.preSpeechPadMs).toBe(500);

    callbacks.onFrameProcessed({ isSpeech: 0 }, silentFrame());
    callbacks.onSpeechRealStart();
    callbacks.onSpeechEnd();
    callbacks.onFrameProcessed({ isSpeech: 0 }, silentFrame());
    callbacks.onSpeechRealStart();

    expect(chunks).toHaveLength(2);
    expect(starts()).toHaveLength(2);
    expect(ends()).toHaveLength(1);

    capture.closeTurn();
    callbacks.onFrameProcessed({ isSpeech: 0 }, silentFrame());
    expect(chunks).toHaveLength(2);
  });

  it("retains VAD redemption for finite dictation segments", async () => {
    const { callbacks } = await createHarness();

    expect(callbacks.redemptionMs).toBe(700);
    expect(callbacks.negativeSpeechThreshold).toBe(0.24);
  });

  it("drops audio and reports zero level while muted", async () => {
    const levels: number[] = [];
    const chunks: PcmChunkMeta[] = [];
    const capture = new VoiceCapture({
      onChunk: (_chunk, meta) => chunks.push(meta),
      onLevelChange: (level) => levels.push(level),
    });
    await capture.start();
    const callbacks = vadHarness.callbacks.at(-1)!;

    await capture.setMuted(true);
    callbacks.onSpeechRealStart();
    callbacks.onFrameProcessed({ isSpeech: 1 }, energeticFrame());

    expect(chunks).toHaveLength(0);
    expect(levels.every((level) => level === 0)).toBe(true);
  });
});
