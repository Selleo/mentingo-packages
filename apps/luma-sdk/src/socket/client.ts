import { io } from "socket.io-client";
import {
  AudioChunkPayload,
  AudioReconnectPayload,
  AudioStopPayload,
  ClientSpeechBoundaryPayload,
  AudioBinaryChunk,
  LEARNER_TRANSCRIPT_STATUSES,
  LUMA_SOCKET_EMIT_EVENTS,
  LUMA_SOCKET_LISTEN_EVENTS,
  LUMA_SOCKET_MESSAGE_TYPES,
  LumaSocket,
  LumaSocketListenEvents,
  MentorTextDeltaPayload,
  MentorTextEndPayload,
  MentorTextErrorPayload,
  StartAudioPayload,
  AudioTriggerTTSPayload,
} from "./types";

export type LumaSocketClientOptions = {
  baseURL?: string;
  apiKey?: string;
  allowInsecureTls?: boolean;
  socketData?: {
    sessionId?: string;
    userId?: string;
    lessonId?: string;
  };
};

export const createLumaSocket = (opts: LumaSocketClientOptions): LumaSocket => {
  const socket = io(opts.baseURL, {
    transports: ["websocket", "polling"],
    autoConnect: false,
    secure: true,
    rejectUnauthorized: !opts.allowInsecureTls,
    auth: {
      apiKey: opts.apiKey,
      sessionId: opts.socketData?.sessionId,
      currentSocketUser: {
        userId: opts.socketData?.userId,
        lessonId: opts.socketData?.lessonId,
      },
    },
    path: "/api/ws/socket.io",
  }) as LumaSocket;

  socket.startAudio = (payload: StartAudioPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.START_AUDIO, payload);
    return socket;
  };

  socket.sendAudioChunk = (payload: AudioChunkPayload, chunk: AudioBinaryChunk) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.AUDIO_CHUNK, payload, chunk);
    return socket;
  };

  socket.reconnectAudio = (payload: AudioReconnectPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.AUDIO_RECONNECT, payload);
    return socket;
  };

  socket.stopAudio = (payload?: AudioStopPayload) => {
    socket.emit(
      LUMA_SOCKET_EMIT_EVENTS.AUDIO_STOP,
      payload ?? { type: LUMA_SOCKET_MESSAGE_TYPES.AUDIO_STOP },
    );
    return socket;
  };

  socket.sendClientSpeechStart = (payload: ClientSpeechBoundaryPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.CLIENT_SPEECH_START, payload);
    return socket;
  };

  socket.sendClientSpeechEnd = (payload: ClientSpeechBoundaryPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.CLIENT_SPEECH_END, payload);
    return socket;
  };

  socket.sendMentorTextDelta = (payload: MentorTextDeltaPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.MENTOR_TEXT_DELTA, payload);
    return socket;
  };

  socket.sendMentorTextEnd = (payload: MentorTextEndPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.MENTOR_TEXT_END, payload);
    return socket;
  };

  socket.sendMentorTextError = (payload: MentorTextErrorPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.MENTOR_TEXT_ERROR, payload);
    return socket;
  };

  socket.sendPing = (payload?: unknown) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.PING, payload);
    return socket;
  };

  socket.sendTTSTrigger = (payload: AudioTriggerTTSPayload) => {
    socket.emit(LUMA_SOCKET_EMIT_EVENTS.TRIGGER_TTS, payload);
    return socket;
  };

  socket.onServerConnected = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.SERVER_CONNECTED],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.SERVER_CONNECTED, handler);
    return socket;
  };

  socket.onAudioStarted = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STARTED],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STARTED, handler);
    return socket;
  };

  socket.onAudioChunked = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNKED],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNKED, handler);
    return socket;
  };

  socket.onAudioChunkError = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNK_ERROR],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_CHUNK_ERROR, handler);
    return socket;
  };

  socket.onAudioRecovered = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECOVERED],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECOVERED, handler);
    return socket;
  };

  socket.onAudioReconnectError = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECONNECT_ERROR],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_RECONNECT_ERROR, handler);
    return socket;
  };
  socket.onAudioStopped = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STOPPED],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_STOPPED, handler);
    return socket;
  };

  socket.onLearnerTranscription = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.LEARNER_TRANSCRIPTION],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.LEARNER_TRANSCRIPTION, handler);
    return socket;
  };

  socket.onMentorTranscription = (handler) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.LEARNER_TRANSCRIPTION, (payload) => {
      // Legacy consumers persist/send the text immediately and cannot consume
      // partial revisions without creating duplicate learner turns.
      if (payload.data.status === LEARNER_TRANSCRIPT_STATUSES.FINAL) handler(payload);
    });
    return socket;
  };

  socket.onAudioOutputChunk = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_CHUNK],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_CHUNK, handler);
    return socket;
  };

  socket.onAudioOutputAlignment = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ALIGNMENT],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ALIGNMENT, handler);
    return socket;
  };

  socket.onAudioOutputInterrupted = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_INTERRUPTED],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_INTERRUPTED, handler);
    return socket;
  };

  socket.onAudioOutputError = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ERROR],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_ERROR, handler);
    return socket;
  };

  socket.onAudioOutputComplete = (
    handler: LumaSocketListenEvents[typeof LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_COMPLETE],
  ) => {
    socket.on(LUMA_SOCKET_LISTEN_EVENTS.AUDIO_OUTPUT_COMPLETE, handler);
    return socket;
  };

  return socket;
};
