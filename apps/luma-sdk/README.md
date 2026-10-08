# Luma SDK

TypeScript SDK for the Luma platform used by Mentingo.

It provides two separate clients:

- HTTP client for durable course authoring, Mentor chat, assets, administration and configuration
- Socket client for realtime audio/voice mentor flows

## Installation

```bash
pnpm add @mentingo/luma-sdk
# or
npm install @mentingo/luma-sdk
# or
yarn add @mentingo/luma-sdk
```

## Quick Start (HTTP)

```ts
import { createLumaClient } from "@mentingo/luma-sdk";

const client = createLumaClient({
  baseURL: "https://your-luma-api.example.com",
  apiKey: process.env.LUMA_API_KEY,
});

const session = await client.authoring.createSession({
  commandId: crypto.randomUUID(),
  courseId: "00000000-0000-4000-8000-000000000001",
  actorId: "author-123",
  language: "en",
});

const snapshot = await client.authoring.getSession({ sessionId: session.sessionId });
console.log(snapshot.tasks);
```

Each client uses one `apiKey`. Supply an administration key for admin operations
or an organization feature key for AI and course operations. The API validates
the key's type and permissions; using a different SDK method does not grant
additional access. To perform both kinds of operations, create separate clients
with the appropriate keys.

The SDK sends that key as `X-Admin-API-Key` for `luma.admin` and as `X-API-Key`
for feature operations, matching the existing API contracts.

```ts
const luma = createLumaClient({
  baseURL: "https://your-luma-api.example.com",
  apiKey: process.env.LUMA_ADMIN_API_KEY,
});

const keys = await luma.admin.apiKeys.list({ organizationId: "org-123" });
const created = await luma.admin.apiKeys.create({
  organizationId: "org-123",
  name: "Course generation",
});

await luma.admin.apiKeys.update({
  organizationId: "org-123",
  apiKeyId: created.id,
  name: "Updated course generation",
});

const configuration = await luma.admin.apiKeys.getConfiguration({
  organizationId: "org-123",
  apiKeyId: created.id,
});
const assignments = await luma.admin.apiKeys.listAssignments({
  organizationId: "org-123",
  apiKeyId: created.id,
});
```

## Quick Start (Socket)

```ts
import {
  createLumaSocket,
  LUMA_AUDIO_ACTIONS,
  LUMA_AUDIO_FORMATS,
  LUMA_SOCKET_MESSAGE_TYPES,
} from "@mentingo/luma-sdk";

const socket = createLumaSocket({
  baseURL: "https://your-luma-api.example.com",
  apiKey: process.env.LUMA_API_KEY,
  socketData: {
    sessionId: "session-123",
    userId: "user-123",
    lessonId: "lesson-123",
  },
});

socket
  .onServerConnected((payload) => console.log("connected", payload))
  .onMentorTranscription((payload) => console.log("transcription", payload))
  .onAudioOutputChunk((payload) => console.log("audio chunk", payload));

socket.connect();

socket.startAudio({
  type: LUMA_SOCKET_MESSAGE_TYPES.AUDIO_START,
  audioAction: LUMA_AUDIO_ACTIONS.VOICE_MENTOR,
  meta: { sr: 16000, channels: 1, format: LUMA_AUDIO_FORMATS.PCM_S16LE },
});

socket.sendAudioChunk(
  {
    type: LUMA_SOCKET_MESSAGE_TYPES.AUDIO_CHUNK,
    meta: { seq: 1, sr: 16000, samples: 320, tsMs: Date.now() },
  },
  new Uint8Array([0, 1, 2]),
);

socket.stopAudio();
```

Recovery responses expose stable public constants for state handling:

```ts
import {
  AUDIO_PROVIDER_STATES,
  AUDIO_RECOVERY_STATES,
  type AudioRecoveryPayload,
} from "@mentingo/luma-sdk";

socket.onAudioRecovered((payload: AudioRecoveryPayload) => {
  if (payload.state === AUDIO_RECOVERY_STATES.MENTOR_ACTIVE) {
    // Keep the playback UI active after reconnecting.
  }

  if (payload.providerState === AUDIO_PROVIDER_STATES.RESTARTED) {
    // The transcription provider was recreated; replay unacknowledged chunks.
  }
});
```

## HTTP Client API

### `createLumaClient(opts)`

Options:

- `baseURL?: string` - Luma API base URL.
- `apiKey?: string` - single client credential; sent as `X-Admin-API-Key` for `client.admin` and `X-API-Key` for feature operations. The API enforces its type and permissions.
- `httpsAgent?: Agent` - custom Node.js HTTPS agent.
- `allowInsecureTls?: boolean` - if `true`, uses `rejectUnauthorized: false` (dev only).

Namespaces:

- `client.mentor.streamChat(opts)` - stream mentor chat through the public custom-runtime endpoint. Pass `voiceSessionId` for voice mentor sessions so Luma can forward mentor text directly to the voice session.
- `client.mentor.chat(opts)` - alias for `client.mentor.streamChat(opts)`.
- `client.mentor.generateChat(opts)` - generate a non-stream mentor chat response.
- `client.mentor.judge(opts)`
- `client.ai.createEmbeddings(opts)`
- `client.ai.generateJudgeConfiguration(opts)`
- `client.ai.validateJudgeConfiguration(opts)`
- `client.ai.generateTranslations(opts)`
- `client.ai.transcribeDictation(opts)`
- `client.configuration.get()`
- `client.admin.apiKeys.list(opts)`
- `client.admin.apiKeys.create(opts)`
- `client.admin.apiKeys.get(opts)`
- `client.admin.apiKeys.update(opts)`
- `client.admin.apiKeys.revoke(opts)`
- `client.admin.apiKeys.getConfiguration(opts)`
- `client.admin.apiKeys.listAssignments(opts)`
- `client.admin.apiKeys.updateAssignment(opts)`
- `client.admin.modelProfiles.list(opts)`

The HTTP client intentionally exposes public API operations through namespaces
instead of flat top-level methods.

## Runtime Configuration

Use `client.configuration.get()` to inspect which public AI capabilities are enabled
for the API key. The SDK exports `AiCapability`, `AiCapabilityMode`,
`AiCapabilityProvider`, `AiRuntimeConfiguration`, and convenience constants such as
`LUMA_AI_CAPABILITIES` and `LUMA_AI_CAPABILITY_MODES`.

Custom model names should use the backend `provider:model` format, for example
`openai:gpt-4.1-mini` or `ollama:llama3.1`.

For voice mentor flows, use `client.mentor.streamChat({ ..., voiceSessionId })` so streamed mentor text can be forwarded to the active socket session without a separate polling or relay step. Use `client.mentor.generateChat(opts)` only for normal one-shot text responses.

## Durable Course Authoring

Use `client.authoring` to create/list sessions, read snapshots and events, subscribe to SSE,
submit commands, upload source documents, answer authorized context requests, prepare frozen
exports, and record application receipts. Course changes remain reviewable proposals; the SDK
never applies them to the consuming application's database.

Snapshot tasks expose optional `failure` metadata with a stable code and recovery action.
Clients should use `retry_failed_parts`, `answer_question`, `retry_provider`, or `service_fix`
to present the appropriate next step rather than retrying every failure automatically.

Download generated visuals through `client.authoring.downloadAsset({ sessionId, assetId, revision })`.
The download is authenticated and revision-bound; import the bytes into the consuming application's
storage and render its native image node. Do not persist temporary download URLs.

## Socket Client API

### `createLumaSocket(opts)`

Options:

- `baseURL?: string`
- `apiKey?: string`
- `allowInsecureTls?: boolean`
- `socketData?: { sessionId?: string; userId?: string; lessonId?: string }`

Emit helpers:

- `startAudio(payload)` -> emits `start_audio`
- `sendAudioChunk(payload, chunk)` -> emits `audio_chunk`
- `sendClientSpeechStart(payload)` -> emits `client_speech_start`
- `sendClientSpeechEnd(payload)` -> emits `client_speech_end`
- `stopAudio(payload?)` -> emits `audio_stop`
- `sendMentorTextDelta(payload)` -> emits `mentor_text_delta`
- `sendMentorTextEnd(payload)` -> emits `mentor_text_end`
- `sendMentorTextError(payload)` -> emits `mentor_text_error`
- `sendPing(payload?)` -> emits `ping`

Listener helpers:

- `onServerConnected(handler)` -> listens `server:connected`
- `onAudioStarted(handler)` -> listens `audio:started`
- `onAudioChunked(handler)` -> listens `audio:chunked`
- `onAudioRecovered(handler)` -> listens `audio:recovered`
- `onAudioStopped(handler)` -> listens `audio:stopped`
- `onMentorTranscription(handler)` -> listens `mentor:transcription`
- `onAudioOutputChunk(handler)` -> listens `audio:output:chunk`
- `onAudioOutputInterrupted(handler)` -> listens `audio:output:interrupted`
- `onAudioOutputError(handler)` -> listens `audio:output:error`
- `onAudioOutputComplete(handler)` -> listens `audio:output:complete`

## Public Exports

- HTTP: `createLumaClient`, `LumaClient`, `LumaClientOptions`, namespaced HTTP clients
- Socket: `createLumaSocket`, `LumaSocket`, socket payload/event types from `src/socket/types.ts`
- Shared API/domain types from `src/types.ts`

## Development

```bash
pnpm install
pnpm --filter @mentingo/luma-sdk typecheck
pnpm --filter @mentingo/luma-sdk test
pnpm --filter @mentingo/luma-sdk build
pnpm --filter @mentingo/luma-sdk lint
```

### Regenerate API client from OpenAPI schema

```bash
pnpm generate:client
```

Uses `src/api/api-schema-public.json` to regenerate `src/api/generated-api.ts`.

## Notes

- Built with `tsup` and ships ESM + CJS.
- HTTP auth uses the `X-API-Key` header.
- Keep API keys out of source control.
