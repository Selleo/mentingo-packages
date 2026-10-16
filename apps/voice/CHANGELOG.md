# @mentingo/voice

## 0.3.0

### Minor Changes

- a5769d5: Support per-chunk PCM sample rates in mentor speech playback while preserving the 44.1 kHz default for existing clients.

## 0.2.0

### Minor Changes

- 72b1aae: Add `VoiceJudgeResultDialog` (AI Mentor review: pass/fail, score and threshold, per-criterion bars and feedback, blocking errors and an AI Mentor suggestion, with optional `subtitle`, `tip` and `actions`) and `VoiceJudgeEvaluationLoader` for AI judge results, and a `notice` slot on `VoiceMentorModeOverlay`.
