# @mentingo/voice

Transport-agnostic building blocks for Mentingo's voice mentor: microphone capture with Silero VAD,
streamed PCM playback with turn handling and word highlighting, and the React session UI.

The package does **not** talk to any API. You wire its callbacks to whatever transport you use
(Socket.IO, WebSocket, WebRTC, a mock for a landing page demo, …).

## Install

```bash
pnpm add @mentingo/voice motion react react-dom
```

## Styling

Components are written with Tailwind utility classes and Mentingo CSS variables, like Mentingo core.

```ts
// tailwind.config.ts
import voicePreset from "@mentingo/voice/tailwind-preset";

export default {
  presets: [voicePreset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@mentingo/voice/dist/**/*.js"],
};
```

```ts
import "@mentingo/voice/tokens.css"; // optional: default Mentingo colors (skip if you define --primary-* etc.)
import "@mentingo/voice/styles.css"; // required: transcript animation keyframes
```

Variables used: `--primary-50…950`, `--primary`, `--primary-foreground`, `--neutral-50…950`,
`--contrast`, `--background`, `--foreground`, `--accent`, `--accent-foreground`, `--destructive`,
`--input`, `--ring`.

## What's inside

| Layer            | Exports                                                                                                                                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine (`/core`) | `VoiceCapture`, `MentorSpeechController`, `RealtimePCMPlayer`, VAD end deferral, turn state, alignment helpers, PCM utils, `createPcmVadWorkletNode`, constants (`VOICE_MODE_STATE`, `VOICE_CONNECTION_STATE`, …)                                               |
| React hooks      | `useVoiceCapture`, `useMentorSpeech`, `useVoiceModeState`                                                                                                                                                                                                       |
| Session blocks   | `VoiceMentorModeOverlay` (full screen) or compose your own from `VoiceSessionStateTitle`, `VoiceSessionVisualizer`, `VoiceConversationTranscript`, `VoiceSessionControls`, `VoiceSessionMobileControls`, `VoiceSessionTaskPanel`, `VoiceSessionConnectionAlert` |
| Visualizers      | `AgentAudioVisualizerAura`, `AgentAudioVisualizerWave`, `ReactShaderToy`, `VoiceLevelBars`                                                                                                                                                                      |
| Worklet          | `@mentingo/voice/worklets/pcm-vad-processor.js`: lightweight energy-based speech gate (alternative to Silero)                                                                                                                                                   |

`@mentingo/voice/core` has no React dependency.

## Building a voice session

```tsx
import {
  VOICE_CONNECTION_STATE,
  VoiceMentorModeOverlay,
  useMentorSpeech,
  useVoiceCapture,
  useVoiceModeState,
  type LearnerTranscriptRevision,
} from "@mentingo/voice";

function VoiceSession({ transport }: { transport: MyTransport }) {
  const mode = useVoiceModeState();
  const [transcript, setTranscript] = useState<LearnerTranscriptRevision | null>(null);
  const [response, setResponse] = useState("");

  const mentor = useMentorSpeech({
    onTurnStarted: mode.onAudioPlaybackStarted,
    onTurnCompleted: () => mode.onAudioOutputCompleted(capture.isActive),
    onInterrupted: () => mode.onAudioInterrupted(capture.isActive),
  });

  const capture = useVoiceCapture({
    onChunk: (pcm, meta) => {
      mentor.interrupt(); // learner barge-in
      mode.onUserSpeechChunkSent();
      transport.sendAudio(pcm, meta);
    },
    onSpeechStart: (boundary) => transport.sendSpeechStart(boundary),
    onSpeechEnd: (boundary) => transport.sendSpeechEnd(boundary),
  });

  useEffect(
    () =>
      transport.subscribe({
        mentorAudio: (chunk) => mentor.pushAudio(chunk), // { turnId, seq, audio: base64 | bytes }
        mentorAlignment: mentor.pushAlignment,
        mentorAudioCompleted: mentor.completeTurn,
        mentorInterrupted: mentor.handleInterrupted,
        mentorText: setResponse,
        learnerTranscript: (revision) => {
          setTranscript(revision);
          mode.onLearnerTranscriptionReceived();
          if (revision.status === "final") capture.closeTurn();
        },
      }),
    [transport],
  );

  const start = async () => {
    await mentor.start(); // inside the click handler: unlocks audio playback
    await capture.start({ keepTurnOpen: true });
    mode.onMicCaptureStarted();
  };

  return (
    <VoiceMentorModeOverlay
      open={capture.isActive}
      state={mode.voiceModeState}
      voiceLevel={capture.level}
      mentorVoiceLevel={mentor.level}
      learnerTranscript={transcript}
      response={response}
      mentorSpeech={mentor.presentation}
      mentorName="Mentor"
      learnerName="You"
      isMicMuted={capture.isMuted}
      connectionState={VOICE_CONNECTION_STATE.CONNECTED}
      onMicMutedChange={capture.setMuted}
      onRestart={start}
      onExit={async () => {
        await capture.stop();
        mentor.reset();
        mode.onMicCaptureStopped();
      }}
    />
  );
}
```

### Endpointing modes

- `client` (default): Silero VAD runs in the browser. Only speech is emitted, with
  `onSpeechStart`/`onSpeechEnd` boundaries and pre-speech padding. `keepTurnOpen` keeps one learner
  turn across pauses until `closeTurn()`.
- `provider`: continuous 16 kHz PCM is emitted and the speech provider detects boundaries.

Silero model and onnxruntime wasm load from jsDelivr by default. Self-host them with
`vadAssetBasePath` / `onnxWasmBasePath`.

### Localization and testing

Every visible string comes from `labels` (`VoiceSessionLabelsInput`). English defaults are in
`DEFAULT_VOICE_SESSION_LABELS`. `data-testid`s are exported as `VOICE_SESSION_TEST_IDS`.

## Development

```bash
pnpm --filter @mentingo/voice test
pnpm --filter @mentingo/voice typecheck
pnpm --filter @mentingo/voice build
```

The aura/wave visualizers and `ReactShaderToy` are adapted from LiveKit's
[agents-ui](https://github.com/livekit/components-js) (Apache-2.0), with the LiveKit track
dependency removed. They are driven by a plain `volume` prop.
