/**
 * Bounded SSE decoding for Node async iterables and browser readable streams.
 * Frames are validated before delivery; reconnection and durable cursor ownership
 * stay with the subscriber. Reader resources are released on early termination.
 */
import type { AuthoringEvent } from "./authoring.types";
import {
  AuthoringSubscriptionError,
  type AuthoringSubscriptionErrorCode,
  type SubscribeAuthoringEventsOptions,
} from "./authoring.types";

type StreamLike = {
  [Symbol.asyncIterator]?: () => AsyncIterator<unknown>;
  getReader?: () => {
    read: () => Promise<{ done: boolean; value?: unknown }>;
    cancel?: () => Promise<void>;
    releaseLock: () => void;
  };
};

const MAX_FRAME_CHARACTERS = 1_048_576;

type SseFrame = {
  event: string;
  id?: string;
  data: string;
};

/** Decode UTF-8 incrementally, rejecting unsupported transport chunk types. */
const toText = (chunk: unknown, decoder: TextDecoder): string => {
  if (typeof chunk === "string") return chunk;
  if (chunk instanceof Uint8Array) return decoder.decode(chunk, { stream: true });
  throw new Error("Unsupported authoring event stream chunk");
};

/** Adapt supported response bodies to chunks and close the reader when consumption ends. */
async function* streamChunks(body: unknown): AsyncGenerator<unknown> {
  if (typeof body === "string" || body instanceof Uint8Array) {
    yield body;
    return;
  }
  if (typeof body !== "object" || body === null) {
    throw new Error("Authoring event stream body is unavailable");
  }
  const stream = body as StreamLike;
  const iteratorFactory = stream[Symbol.asyncIterator];
  if (iteratorFactory) {
    const iterator = iteratorFactory.call(stream);
    let completed = false;
    try {
      while (true) {
        const item = await iterator.next();
        if (item.done) {
          completed = true;
          return;
        }
        yield item.value;
      }
    } finally {
      if (!completed) await iterator.return?.();
    }
  }
  if (stream.getReader) {
    const reader = stream.getReader();
    try {
      while (true) {
        const item = await reader.read();
        if (item.done) return;
        yield item.value;
      }
    } finally {
      await reader.cancel?.();
      reader.releaseLock();
    }
  }
  throw new Error("Authoring event stream is not readable");
}

/** Parse SSE data and metadata lines, ignoring comments and empty heartbeat frames. */
const parseFrame = (raw: string): SseFrame | null => {
  let event = "message";
  let id: string | undefined;
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    let value = separator === -1 ? "" : line.slice(separator + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    if (field === "id") id = value;
    if (field === "data") data.push(value);
  }
  if (data.length === 0) return null;
  return { event, id, data: data.join("\n") };
};

/** Check the envelope fields required for safe session-bound event delivery. */
const isAuthoringEvent = (value: unknown): value is AuthoringEvent => {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Partial<AuthoringEvent>;
  return (
    event.schemaVersion === 1 &&
    typeof event.eventId === "string" &&
    typeof event.sessionId === "string" &&
    Number.isSafeInteger(event.sequence) &&
    Number(event.sequence) > 0 &&
    typeof event.occurredAt === "string" &&
    typeof event.type === "string" &&
    typeof event.payload === "object" &&
    event.payload !== null
  );
};

/** Decode the two terminal server error codes; reject malformed or unknown codes. */
const terminalError = (data: string): AuthoringSubscriptionError => {
  const value: unknown = JSON.parse(data);
  if (typeof value !== "object" || value === null || !("code" in value)) {
    throw new Error("Invalid authoring.error event payload");
  }
  const code = value.code;
  if (code !== "history_expired" && code !== "permission_revoked") {
    throw new Error(`Unknown authoring.error code: ${String(code)}`);
  }
  return new AuthoringSubscriptionError(code as AuthoringSubscriptionErrorCode);
};

/** Validate session and cursor metadata before awaiting the consumer callback.
 * Terminal server errors notify the optional error callback and then reject. */
const deliverFrame = async (
  frame: SseFrame,
  options: SubscribeAuthoringEventsOptions,
): Promise<void> => {
  if (frame.event === "authoring.error") {
    const error = terminalError(frame.data);
    await options.onError?.(error);
    throw error;
  }
  if (frame.event !== "authoring.event") return;
  const value: unknown = JSON.parse(frame.data);
  if (!isAuthoringEvent(value)) throw new Error("Invalid authoring.event payload");
  if (value.sessionId !== options.sessionId) {
    throw new Error("Authoring event session does not match subscription");
  }
  if (frame.id !== undefined && frame.id !== String(value.sequence)) {
    throw new Error("Authoring event id does not match sequence");
  }
  await options.onEvent(value);
};

/** Decode and deliver complete frames with a one-megacharacter frame bound.
 * Malformed JSON, oversized or truncated frames, and callback failures reject
 * this connection; the caller decides how to recover from its saved cursor. */
export const consumeAuthoringEventStream = async (
  body: unknown,
  options: SubscribeAuthoringEventsOptions,
): Promise<void> => {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of streamChunks(body)) {
    buffer += toText(chunk, decoder);
    buffer = buffer.replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      if (boundary > MAX_FRAME_CHARACTERS) {
        throw new Error("Authoring event stream frame exceeds size limit");
      }
      const frame = parseFrame(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      if (frame) await deliverFrame(frame, options);
      boundary = buffer.indexOf("\n\n");
    }
    if (buffer.length > MAX_FRAME_CHARACTERS) {
      throw new Error("Authoring event stream frame exceeds size limit");
    }
  }
  buffer += decoder.decode();
  if (buffer.replace(/\r\n/g, "\n").trim()) {
    throw new Error("Authoring event stream ended with a truncated frame");
  }
};
