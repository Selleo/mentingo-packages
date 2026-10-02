import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MentorSpeechController } from "./mentor-speech-controller";

type FakeSource = { onended: (() => void) | null; start: () => void; stop: () => void };

const sources: FakeSource[] = [];

class FakeAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createGain() {
    return { gain: { value: 1 }, connect: () => undefined };
  }
  createAnalyser() {
    return { fftSize: 256, connect: () => undefined, getFloatTimeDomainData: () => undefined };
  }
  createBuffer(_channels: number, length: number, sampleRate: number) {
    return { duration: length / sampleRate, getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    const source: FakeSource & { buffer: unknown; connect: () => void } = {
      buffer: null,
      onended: null,
      connect: () => undefined,
      start: () => undefined,
      stop() {
        this.onended?.();
      },
    };
    sources.push(source);
    return source;
  }
  async resume() {}
  async close() {
    this.state = "closed";
  }
}

const pcm = () => new Uint8Array([0, 1, 0, 2]);

describe("MentorSpeechController", () => {
  beforeEach(() => {
    sources.length = 0;
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("drops stale sequence numbers and chunks from other turns", async () => {
    const controller = new MentorSpeechController();
    await controller.start();

    expect(await controller.pushAudio({ turnId: "t1", seq: 1, audio: pcm() })).toBe(true);
    expect(await controller.pushAudio({ turnId: "t1", seq: 1, audio: pcm() })).toBe(false);
    expect(await controller.pushAudio({ turnId: "t2", seq: 2, audio: pcm() })).toBe(false);
    expect(await controller.pushAudio({ turnId: "t1", seq: 2, audio: "AAEAAg==" })).toBe(true);
  });

  it("completes a turn once the server finished and playback drained", async () => {
    const onTurnStarted = vi.fn();
    const onTurnCompleted = vi.fn();
    const controller = new MentorSpeechController({ onTurnStarted, onTurnCompleted });
    await controller.start();

    await controller.pushAudio({ turnId: "t1", seq: 1, audio: pcm() });
    controller.completeTurn("t1");
    expect(onTurnCompleted).not.toHaveBeenCalled();

    sources[0]?.onended?.();
    expect(onTurnStarted).toHaveBeenCalledWith("t1");
    expect(onTurnCompleted).toHaveBeenCalledWith("t1");
    expect(controller.activeTurnId).toBeNull();
  });

  it("cuts playback on learner barge-in only while the mentor speaks", async () => {
    const onInterrupted = vi.fn();
    const controller = new MentorSpeechController({ onInterrupted });
    await controller.start();

    expect(controller.interrupt()).toBe(false);
    await controller.pushAudio({ turnId: "t1", seq: 1, audio: pcm() });
    expect(controller.interrupt()).toBe(true);
    expect(onInterrupted).toHaveBeenCalledTimes(1);
  });

  it("ignores server interruptions for another turn", async () => {
    const onInterrupted = vi.fn();
    const controller = new MentorSpeechController({ onInterrupted });
    await controller.start();
    await controller.pushAudio({ turnId: "t1", seq: 1, audio: pcm() });

    controller.handleInterrupted("t0");
    expect(onInterrupted).not.toHaveBeenCalled();
    controller.handleInterrupted("t1");
    expect(onInterrupted).toHaveBeenCalledTimes(1);
  });

  it("publishes alignment as a presentation with no active word yet", async () => {
    const onPresentationChange = vi.fn();
    const controller = new MentorSpeechController({ onPresentationChange });

    controller.pushAlignment({
      turnId: "t1",
      sequence: 1,
      words: [{ text: "Hi", startMs: 0, endMs: 100 }],
    });

    expect(onPresentationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ turnId: "t1", activeWordIndex: null }),
    );
  });
});
