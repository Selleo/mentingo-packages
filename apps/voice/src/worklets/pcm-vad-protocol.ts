/** Shared between the AudioWorklet module and the main thread; must not reference DOM or worklet globals. */
export const PCM_VAD_PROCESSOR_NAME = "pcm-vad-gate";

export type PcmVadGateOptions = {
  startFrames?: number;
  stopFrames?: number;
  minRms?: number;
  thresholdMultiplier?: number;
  minZcr?: number;
  maxZcr?: number;
  preRollFrames?: number;
};

export type PcmVadProcessorOptions = {
  targetSr?: number;
  chunkMs?: number;
  vad?: PcmVadGateOptions;
};

export type PcmVadProcessorMessage =
  { type: "level"; level: number } | { type: "chunk"; data: ArrayBuffer };
