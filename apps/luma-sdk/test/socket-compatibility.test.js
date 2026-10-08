import assert from "node:assert/strict";
import { test } from "node:test";
import { createLumaSocket, LUMA_SOCKET_LISTEN_EVENTS } from "../dist/index.js";

test("legacy transcription adapter forwards finals while modern listeners retain partials", () => {
  const socket = createLumaSocket({ baseURL: "http://localhost:1" });
  const legacy = [];
  const modern = [];
  try {
    assert.equal(
      socket.onMentorTranscription((event) => legacy.push(event)),
      socket,
    );
    socket.onLearnerTranscription((event) => modern.push(event));
    const partial = { data: { text: "Hello", status: "partial" } };
    const final = { data: { text: "Hello there", status: "final" } };
    for (const payload of [partial, final]) {
      for (const listener of socket.listeners(LUMA_SOCKET_LISTEN_EVENTS.LEARNER_TRANSCRIPTION)) {
        listener(payload);
      }
    }
    assert.deepEqual(legacy, [final]);
    assert.deepEqual(modern, [partial, final]);
    assert.equal(socket.connected, false);
  } finally {
    socket.removeAllListeners();
    socket.disconnect();
  }
});
