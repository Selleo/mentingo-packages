/** Visual states understood by the aura/wave visualizers (compatible with LiveKit's AgentState). */
export type AgentVisualizerState =
  | "disconnected"
  | "connecting"
  | "initializing"
  | "pre-connect-buffering"
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "failed";
