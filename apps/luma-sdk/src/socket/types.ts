import type { Socket } from "socket.io-client";

import type { LumaVoiceTimingPrecision } from "./constants";

export const LUMA_SOCKET_MESSAGE_TYPES = {
  AUDIO_START: "audio.start",
  AUDIO_CHUNK: "audio.chunk",
  AUDIO_RECONNECT: "audio.reconnect",
  AUDIO_RECOVERED: "audio.recovered",
  AUDIO_STOP: "audio.stop",
  CLIENT_SPEECH_START: "client.speech.start",
  CLIENT_SPEECH_END: "client.speech.end",
  MENTOR_TEXT_DELTA: "mentor.text.delta",
  MENTOR_TEXT_END: "mentor.text.end",
  MENTOR_TEXT_ERROR: "mentor.text.error",
} as const;

export const LUMA_AUDIO_ACTIONS = {
  VOICE_MENTOR: "VOICE_MENTOR",
} as const;

export const LUMA_AUDIO_FORMATS = {
  PCM_S16LE: "pcm_s16le",
} as const;

export const LUMA_SOCKET_LISTEN_EVENTS = {
  SERVER_CONNECTED: "server:connected",
  PONG: "pong",
  AUDIO_STARTED: "audio:start",
  AUDIO_CHUNKED: "audio:chunked",
  AUDIO_CHUNK_ERROR: "audio:chunk_error",
  AUDIO_RECOVERED: "audio:recovered",
  AUDIO_RECONNECT_ERROR: "audio:reconnect_error",
  AUDIO_STOPPED: "audio:stopped",
  LEARNER_TRANSCRIPTION: "learner:transcription",
  AUDIO_OUTPUT_ALIGNMENT: "audio:output:alignment",
  AUDIO_OUTPUT_CHUNK: "audio:output:chunk",
  AUDIO_OUTPUT_INTERRUPTED: "audio:output:interrupted",
  AUDIO_OUTPUT_ERROR: "audio:output:error",
  AUDIO_OUTPUT_COMPLETE: "audio:output:complete",
} as const;

export const LUMA_MENTOR_STREAM_EVENT_TYPES = {
  LEARNER_TRANSCRIPTION: "learner.transcription",
  AUDIO_OUTPUT_ALIGNMENT: "audio.output.alignment",
  AUDIO_OUTPUT_CHUNK: "audio.output.chunk",
  AUDIO_OUTPUT_INTERRUPTED: "audio.output.interrupted",
  AUDIO_OUTPUT_ERROR: "audio.output.error",
  AUDIO_OUTPUT_COMPLETE: "audio.output.complete",
} as const;

export const LUMA_SOCKET_EMIT_EVENTS = {
  START_AUDIO: "start_audio",
  AUDIO_CHUNK: "audio_chunk",
  AUDIO_RECONNECT: "audio_reconnect",
  AUDIO_STOP: "audio_stop",
  CLIENT_SPEECH_START: "client_speech_start",
  CLIENT_SPEECH_END: "client_speech_end",
  MENTOR_TEXT_DELTA: "mentor_text_delta",
  MENTOR_TEXT_END: "mentor_text_end",
  MENTOR_TEXT_ERROR: "mentor_text_error",
  PING: "ping",
  TRIGGER_TTS: "trigger_tts",
} as const;

export const TRANSCRIPTION_MODES = {
  PAUSE_BATCH: "pause_batch",
  REALTIME_STREAM: "realtime_stream",
} as const;

export const LUMA_CAPTURE_PROFILES = {
  CONTINUOUS_PCM: "continuous_pcm",
  VAD_SEGMENTED: "vad_segmented",
} as const;

export type LumaCaptureProfile = (typeof LUMA_CAPTURE_PROFILES)[keyof typeof LUMA_CAPTURE_PROFILES];

export type AudioBinaryChunk = ArrayBuffer | Uint8Array | Buffer;

export type StartAudioPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_START"];
  audioAction: (typeof LUMA_AUDIO_ACTIONS)["VOICE_MENTOR"];
  language: string;
  preset?: string;
  customTTSReference?: string;
  meta: {
    sr: number;
    channels: number;
    format: (typeof LUMA_AUDIO_FORMATS)["PCM_S16LE"];
  };
  transcriptionMode: (typeof TRANSCRIPTION_MODES)[keyof typeof TRANSCRIPTION_MODES];
};

export type AudioChunkPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_CHUNK"];
  meta: {
    seq: number;
    sr: number;
    samples: number;
    tsMs: number;
  };
};

export type AudioReconnectPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_RECONNECT"];
  sessionRunId: string;
  lastSentAudioSeq: number;
  attempt: number;
};

export type AudioStopPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_STOP"];
};

export type ClientSpeechBoundaryPayload = {
  type:
    | (typeof LUMA_SOCKET_MESSAGE_TYPES)["CLIENT_SPEECH_START"]
    | (typeof LUMA_SOCKET_MESSAGE_TYPES)["CLIENT_SPEECH_END"];
  sessionRunId: string;
  boundarySeq: number;
  tsMs: number;
  lastAudioSeq: number;
};

export type MentorTextDeltaPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["MENTOR_TEXT_DELTA"];
  jobId: string;
  seq: number;
  text: string;
};

export type MentorTextEndPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["MENTOR_TEXT_END"];
  jobId: string;
  reason?: string;
};

export type MentorTextErrorPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["MENTOR_TEXT_ERROR"];
  jobId: string;
  code: string;
  message: string;
  retryable?: boolean;
};

export type AudioTriggerTTSPayload = {
  content: string;
};

export type ServerConnectedPayload = {
  sid: string;
  authenticated: boolean;
  sessionId: string;
};

export type TranscriptionSessionPlan = {
  effectiveTranscriptionMode: (typeof TRANSCRIPTION_MODES)[keyof typeof TRANSCRIPTION_MODES];
  captureProfile: LumaCaptureProfile;
  endpointOwner: string;
  interruptionMarker: string;
  supportsSpeechEvents: boolean;
  providerAdapter: string;
  boundarySource: string;
  supportsPartialTranscripts: boolean;
  supportsWordTimestamps: boolean;
  supportsSessionRecovery: boolean;
  [key: string]: unknown;
};

export type AudioStartedPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_START"];
  sessionId: string;
  sessionRunId: string;
  audioAction: (typeof LUMA_AUDIO_ACTIONS)["VOICE_MENTOR"];
  meta: StartAudioPayload["meta"];
  currentSocketUser: {
    userId: string;
    lessonId: string;
  };
  transcriptionSessionPlan: TranscriptionSessionPlan;
  lastAcceptedAudioSeq: number;
  nextAudioSeq: number;
};

export type AudioChunkedPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_CHUNK"];
  sessionId: string;
  sessionRunId: string;
  acceptedAudioSeq: number;
  lastAcceptedAudioSeq: number;
  nextAudioSeq: number;
  duplicate: boolean;
};

export const AUDIO_RECOVERY_STATES = {
  LISTENING: "listening",
  MENTOR_ACTIVE: "mentor_active",
  USER_SPEAKING: "user_speaking",
} as const;

export type AudioRecoveryState = (typeof AUDIO_RECOVERY_STATES)[keyof typeof AUDIO_RECOVERY_STATES];

export const AUDIO_PROVIDER_STATES = {
  CONNECTED: "connected",
  RESTARTED: "restarted",
  NOT_APPLICABLE: "not_applicable",
} as const;

export type AudioProviderState = (typeof AUDIO_PROVIDER_STATES)[keyof typeof AUDIO_PROVIDER_STATES];

export type AudioRecoveryPayload = {
  type: (typeof LUMA_SOCKET_MESSAGE_TYPES)["AUDIO_RECOVERED"];
  sessionId: string;
  sessionRunId: string;
  state: AudioRecoveryState;
  providerState: AudioProviderState;
  lastAcceptedAudioSeq: number;
  nextAudioSeq: number;
  clientLastSentAudioSeq: number;
  attempt: number;
  transcriptionSessionPlan: TranscriptionSessionPlan;
};

export type AudioProtocolErrorPayload = {
  type: string;
  sessionId: string;
  sessionRunId?: string;
  attempt?: number;
  code: string;
  meta?: AudioChunkPayload["meta"];
};

export type MentorStreamEventEnvelope<TType extends string, TData> = {
  type: TType;
  sessionId: string;
  jobId: string;
  tsMs: number;
  data: TData;
};

export const LEARNER_TRANSCRIPT_STATUSES = {
  PARTIAL: "partial",
  FINAL: "final",
} as const;

export type LearnerTranscriptStatus =
  (typeof LEARNER_TRANSCRIPT_STATUSES)[keyof typeof LEARNER_TRANSCRIPT_STATUSES];

export type LearnerTranscriptionData = {
  text: string;
  turnId: string;
  segmentId: string;
  revision: number;
  status: LearnerTranscriptStatus;
  timing?: LearnerTranscriptionTimingData | null;
};

export type LearnerTranscriptionTimingData = {
  elapsedMs: number;
  speechMs: number;
  pauseCount: number;
  longestPauseMs: number;
  averagePauseMs?: number | null;
  segmentCount: number;
  wordCount: number;
  wordsPerMinute?: number | null;
  timingPrecision: LumaVoiceTimingPrecision;
};

export type AudioOutputChunkData = {
  seq: number;
  codec: string;
  chunkBase64: string;
  sampleRate?: number | null;
};

export type SpeechAlignmentWord = {
  text: string;
  startMs: number;
  endMs: number;
};

export type AudioOutputAlignmentData = {
  sequence: number;
  words: SpeechAlignmentWord[];
};

export type AudioOutputInterruptedData = {
  reason: string;
  interruptedTurnId: string | null;
};

export type AudioOutputErrorData = {
  code: string;
  message: string;
  retryable: boolean;
};

export type AudioOutputCompleteData = {
  totalChunks: number;
};

export type LearnerTranscriptionPayload = MentorStreamEventEnvelope<
  (typeof LUMA_MENTOR_STREAM_EVENT_TYPES)["LEARNER_TRANSCRIPTION"],
  LearnerTranscriptionData
>;

/** @deprecated Use LearnerTranscriptionPayload with explicit partial/final handling. */
export type MentorTranscriptionPayload = LearnerTranscriptionPayload;

export type AudioOutputChunkPayload = MentorStreamEventEnvelope<
  (typeof LUMA_MENTOR_STREAM_EVENT_TYPES)["AUDIO_OUTPUT_CHUNK"],
  AudioOutputChunkData
>;

export type AudioOutputAlignmentPayload = MentorStreamEventEnvelope<
  (typeof LUMA_MENTOR_STREAM_EVENT_TYPES)["AUDIO_OUTPUT_ALIGNMENT"],
  AudioOutputAlignmentData
>;

export type AudioOutputInterruptedPayload = MentorStreamEventEnvelope<
  (typeof LUMA_MENTOR_STREAM_EVENT_TYPES)["AUDIO_OUTPUT_INTERRUPTED"],
  AudioOutputInterruptedData
>;

export type AudioOutputErrorPayload = MentorStreamEventEnvelope<
  (typeof LUMA_MENTOR_STREAM_EVENT_TYPES)["AUDIO_OUTPUT_ERROR"],
  AudioOutputErrorData
>;

export type AudioOutputCompletePayload = MentorStreamEventEnvelope<
  (typeof LUMA_MENTOR_STREAM_EVENT_TYPES)["AUDIO_OUTPUT_COMPLETE"],
  AudioOutputCompleteData
>;

export type LumaSocketListenEvents = {
  [LUMA_SOCKET_LISTEN_EVENTS.SERVER_CONNECTED]: (payload: ServerConnectedPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.PONG]: (payload: unknown) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STARTED]: (payload: AudioStartedPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNKED]: (payload: AudioChunkedPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNK_ERROR]: (payload: AudioProtocolErrorPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECOVERED]: (payload: AudioRecoveryPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECONNECT_ERROR]: (payload: AudioProtocolErrorPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STOPPED]: (payload: unknown) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.LEARNER_TRANSCRIPTION]: (payload: LearnerTranscriptionPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ALIGNMENT]: (
    payload: AudioOutputAlignmentPayload,
  ) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_CHUNK]: (payload: AudioOutputChunkPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_INTERRUPTED]: (
    payload: AudioOutputInterruptedPayload,
  ) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ERROR]: (payload: AudioOutputErrorPayload) => void;
  [LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_COMPLETE]: (payload: AudioOutputCompletePayload) => void;
};

export type LumaSocketEmitEvents = {
  [LUMA_SOCKET_EMIT_EVENTS.START_AUDIO]: (payload: StartAudioPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.AUDIO_CHUNK]: (
    payload: AudioChunkPayload,
    chunk: AudioBinaryChunk,
  ) => void;
  [LUMA_SOCKET_EMIT_EVENTS.AUDIO_RECONNECT]: (payload: AudioReconnectPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.AUDIO_STOP]: (payload: AudioStopPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.CLIENT_SPEECH_START]: (payload: ClientSpeechBoundaryPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.CLIENT_SPEECH_END]: (payload: ClientSpeechBoundaryPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.MENTOR_TEXT_DELTA]: (payload: MentorTextDeltaPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.MENTOR_TEXT_END]: (payload: MentorTextEndPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.MENTOR_TEXT_ERROR]: (payload: MentorTextErrorPayload) => void;
  [LUMA_SOCKET_EMIT_EVENTS.PING]: (payload?: unknown) => void;
  [LUMA_SOCKET_EMIT_EVENTS.TRIGGER_TTS]: (payload?: AudioTriggerTTSPayload) => void;
};

type LumaSocketBase = Socket<LumaSocketListenEvents, LumaSocketEmitEvents>;

export interface LumaSocket extends LumaSocketBase {
  startAudio(payload: StartAudioPayload): this;

  sendAudioChunk(payload: AudioChunkPayload, chunk: AudioBinaryChunk): this;

  stopAudio(payload?: AudioStopPayload): this;

  sendClientSpeechStart(payload: ClientSpeechBoundaryPayload): this;

  sendClientSpeechEnd(payload: ClientSpeechBoundaryPayload): this;

  sendMentorTextDelta(payload: MentorTextDeltaPayload): this;

  sendMentorTextEnd(payload: MentorTextEndPayload): this;

  sendMentorTextError(payload: MentorTextErrorPayload): this;

  sendPing(payload?: unknown): this;

  sendTTSTrigger(payload: AudioTriggerTTSPayload): this;

  onServerConnected(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.SERVER_CONNECTED],
  ): this;

  onAudioStarted(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STARTED],
  ): this;

  onAudioChunked(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNKED],
  ): this;

  reconnectAudio(payload: AudioReconnectPayload): this;

  onAudioChunkError(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNK_ERROR],
  ): this;

  onAudioRecovered(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECOVERED],
  ): this;

  onAudioReconnectError(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECONNECT_ERROR],
  ): this;

  onAudioStopped(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STOPPED],
  ): this;

  onLearnerTranscription(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.LEARNER_TRANSCRIPTION],
  ): this;

  /** @deprecated Final-only compatibility adapter; use onLearnerTranscription for all revisions. */
  onMentorTranscription(handler: (payload: MentorTranscriptionPayload) => void): this;

  onAudioOutputChunk(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_CHUNK],
  ): this;

  onAudioOutputAlignment(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ALIGNMENT],
  ): this;

  onAudioOutputInterrupted(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_INTERRUPTED],
  ): this;

  onAudioOutputError(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ERROR],
  ): this;
  onAudioOutputComplete(
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_COMPLETE],
  ): this;
}
