import {
  PCM_VAD_PROCESSOR_NAME,
  type PcmVadProcessorMessage,
  type PcmVadProcessorOptions,
} from "../worklets/pcm-vad-protocol";

export {
  PCM_VAD_PROCESSOR_NAME,
  type PcmVadGateOptions,
  type PcmVadProcessorMessage,
  type PcmVadProcessorOptions,
} from "../worklets/pcm-vad-protocol";

/**
 * Loads the `pcm-vad-gate` AudioWorklet and returns a node that posts {@link PcmVadProcessorMessage}s.
 * `moduleUrl` must point at the shipped `@mentingo/voice/worklets/pcm-vad-processor.js`, e.g.
 * `new URL("@mentingo/voice/worklets/pcm-vad-processor.js", import.meta.url)` in Vite.
 */
export async function createPcmVadWorkletNode(
  context: AudioContext,
  moduleUrl: string | URL,
  options: PcmVadProcessorOptions & {
    onMessage?: (message: PcmVadProcessorMessage) => void;
  } = {},
): Promise<AudioWorkletNode> {
  const { onMessage, ...processorOptions } = options;
  await context.audioWorklet.addModule(moduleUrl);

  const node = new AudioWorkletNode(context, PCM_VAD_PROCESSOR_NAME, {
    numberOfInputs: 1,
    numberOfOutputs: 0,
    channelCount: 1,
    processorOptions,
  });
  if (onMessage) {
    node.port.onmessage = (event: MessageEvent<PcmVadProcessorMessage>) => onMessage(event.data);
  }

  return node;
}
