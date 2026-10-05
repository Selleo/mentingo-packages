# @mentingo/voice

Browser building blocks for the Mentingo voice mentor. Requires React 18 or newer and `motion` 12.
The package contains microphone capture with Silero VAD, streamed PCM playback for mentor speech,
turn state, and the React session UI. It does not connect to Mentingo or Luma; the application
owns the socket connection and forwards audio and events between the package and the server.

## Installation

Install from npmjs.com:

```sh
pnpm add @mentingo/voice motion
```

## Usage

```tsx
import {
  VOICE_CONNECTION_STATE,
  VoiceMentorModeOverlay,
  useMentorSpeech,
  useVoiceCapture,
  useVoiceModeState,
} from "@mentingo/voice";

const mode = useVoiceModeState();

const mentor = useMentorSpeech({
  onTurnStarted: mode.onAudioPlaybackStarted,
  onTurnCompleted: () => mode.onAudioOutputCompleted(true),
  onInterrupted: () => mode.onAudioInterrupted(true),
});

const capture = useVoiceCapture({
  onChunk: (chunk, meta) => {
    mentor.interrupt();
    mode.onUserSpeechChunkSent();
    socket.emit("audioChunk", meta, chunk);
  },
  onSpeechStart: (boundary) => socket.emit("clientSpeechStart", boundary),
  onSpeechEnd: (boundary) => socket.emit("clientSpeechEnd", boundary),
});

socket.on("audioSpeech", ({ turnId, seq, chunkBase64 }) =>
  mentor.pushAudio({ turnId, seq, audio: chunkBase64 }),
);
socket.on("audioOutputAlignment", mentor.pushAlignment);
socket.on("audioOutputCompleted", ({ turnId }) => mentor.completeTurn(turnId));
socket.on("audioInterrupted", ({ turnId }) => mentor.handleInterrupted(turnId));

async function startSession() {
  await mentor.start();
  await capture.start({ keepTurnOpen: true });
  mode.onMicCaptureStarted();
}

<VoiceMentorModeOverlay
  open={capture.isActive}
  state={mode.voiceModeState}
  voiceLevel={capture.level}
  mentorVoiceLevel={mentor.level}
  learnerTranscript={learnerTranscript}
  response={mentorResponse}
  mentorSpeech={mentor.presentation}
  mentorName="AI Mentor"
  learnerName={user.name}
  isMicMuted={capture.isMuted}
  connectionState={VOICE_CONNECTION_STATE.CONNECTED}
  onMicMutedChange={capture.setMuted}
  onRestart={startSession}
  onExit={capture.stop}
/>;
```

Event names in the example are illustrative; use the ones of your server.

Call `mentor.start()` from a user gesture so the browser allows audio playback. Capture emits
16 kHz mono PCM s16le chunks with increasing sequence numbers. With client endpointing (default),
Silero VAD runs in the browser and only speech is emitted, together with speech start and end
boundaries. With `endpointingMode: "provider"` audio is streamed continuously and the server
detects boundaries. `keepTurnOpen` keeps one learner turn open across pauses until `closeTurn()`
is called, typically when the final transcript arrives.

`mentor.pushAudio` accepts PCM s16le bytes or base64. Chunks from another turn or with an old
sequence number are dropped. A turn completes when the server reports completion and playback
has drained, or after 5 seconds without new audio. `mentor.interrupt()` stops playback when the
learner starts speaking.

The Silero model and onnxruntime wasm are loaded from jsDelivr when capture starts. Set
`vadAssetBasePath` and `onnxWasmBasePath` to serve them from your own host.

## Styling

Components use Tailwind utility classes and Mentingo CSS variables (`--primary-50` to
`--primary-950`, `--primary`, `--neutral-50` to `--neutral-950`, `--contrast`, `--background`,
`--accent`, `--destructive`, `--input`, `--ring`). Mentingo core defines these already.

Tailwind 3:

```ts
import voicePreset from "@mentingo/voice/tailwind-preset";

export default {
  presets: [voicePreset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@mentingo/voice/dist/**/*.js"],
};
```

Tailwind 4: add `@source "../node_modules/@mentingo/voice/dist";` and map the same colors in
`@theme`.

Import `@mentingo/voice/styles.css` for the transcript animation. `@mentingo/voice/tokens.css`
provides the default Mentingo palette for apps that do not define the variables. Visualizers read
`--primary` from the element they render in, so a theme can be scoped to a wrapper element.

## API

### `VoiceCapture` / `useVoiceCapture(options)`

Options:

- `sampleRate?: number` - output sample rate, default `16000`.
- `chunkMs?: number` - chunk duration, default `32`.
- `vad?: Partial<SileroVadOptions>` - Silero thresholds and timings.
- `vadAssetBasePath?: string`, `onnxWasmBasePath?: string` - model and wasm locations.
- `audioConstraints?: MediaTrackConstraints`
- `onChunk(chunk, meta)`, `onSpeechStart(boundary)`, `onSpeechEnd(boundary)`, `onLevelChange(level)`

Methods: `start({ endpointingMode?, keepTurnOpen?, firstChunkSeq? })`, `stop()`,
`setMuted(muted)`, `closeTurn()`. The hook also returns `isActive`, `isStarting`, `isMuted` and
`level`.

### `MentorSpeechController` / `useMentorSpeech(options)`

Options:

- `sampleRate?: number` - mentor audio sample rate, default `44100`.
- `channels?: number` - default `1`.
- `inactivityTimeoutMs?: number` - default `5000`.
- `onTurnStarted(turnId)`, `onTurnCompleted(turnId)`, `onInterrupted()`, `onLevelChange(level)`,
  `onPresentationChange(presentation)`

Methods: `start()`, `pushAudio({ turnId, seq, audio })`, `pushAlignment(alignment)`,
`completeTurn(turnId?)`, `handleInterrupted(turnId?)`, `interrupt()`, `reset()`. The hook also
returns `level` and `presentation` (word timings with the active word index).

### `useVoiceModeState()`

Returns `voiceModeState` (`idle`, `listening`, `thinking`, `speaking`) and the event handlers
`onMicCaptureStarted`, `onMicCaptureStopped`, `onUserSpeechChunkSent`,
`onLearnerTranscriptionReceived`, `onAudioPlaybackStarted`, `onAudioOutputCompleted` and
`onAudioInterrupted`.

### Components

- `VoiceMentorModeOverlay` - full-screen session. The Check button renders with `onJudge`, the task
  panel with `taskContent`.
- `VoiceSessionStateTitle`, `VoiceSessionVisualizer`, `VoiceConversationTranscript`,
  `VoiceSessionControls`, `VoiceSessionMobileControls`, `VoiceSessionTaskPanel`,
  `VoiceSessionConnectionAlert` - the blocks the overlay is built from.
- `AgentAudioVisualizerAura`, `AgentAudioVisualizerWave`, `VoiceLevelBars` - visualizers.

All visible text comes from the `labels` prop; English defaults are exported as
`DEFAULT_VOICE_SESSION_LABELS`. Test ids are exported as `VOICE_SESSION_TEST_IDS`.

## Public Exports

- `@mentingo/voice` - everything below plus React hooks and components.
- `@mentingo/voice/core` - capture, playback, turn state and helpers without React.
- `@mentingo/voice/tailwind-preset` - Tailwind 3 preset.
- `@mentingo/voice/styles.css`, `@mentingo/voice/tokens.css`
- `@mentingo/voice/worklets/pcm-vad-processor.js` - energy-based AudioWorklet speech gate, loaded
  with `createPcmVadWorkletNode`.

## Development

From the repository root:

```sh
pnpm install
pnpm --filter @mentingo/voice typecheck
pnpm --filter @mentingo/voice test
pnpm --filter @mentingo/voice build
```

## Release preparation

From this package directory:

```sh
pnpm pack --pack-destination /tmp/mentingo-voice-release
```

The `prepack` hook checks types, runs the tests and builds before packing or publishing. The
tarball includes only `dist`, this README, the MIT license and package metadata.

Publishing targets npmjs.com with public access. The publisher needs permission for the
`@mentingo` npm scope. From this directory, after reviewing the tarball:

```sh
pnpm publish --access public
```

Published versions cannot be reused; increment the version for subsequent releases.

## License

MIT. See [LICENSE](./LICENSE). The aura and wave visualizers are adapted from LiveKit
[agents-ui](https://github.com/livekit/components-js) (Apache-2.0).
