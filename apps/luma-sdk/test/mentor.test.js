/** Prove native chat forwards tools/history/events while preserving legacy text transport. */
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createServer } from "node:http";
import { test } from "node:test";
import { createLumaClient } from "../dist/index.js";

const textRequest = { messages: [{ role: "user", content: "Zażółć — answer locally." }] };
const toolCall = { id: "call-course", name: "read_course", arguments: { courseId: "course-1" } };
const toolRequest = {
  messages: [
    { role: "user", content: "Read this course." },
    { role: "assistant", content: "", toolCalls: [toolCall] },
    { role: "tool", content: '{"title":"Course"}', toolCallId: toolCall.id },
  ],
  tools: [
    {
      name: "read_course",
      description: "Read an authorized course",
      inputSchema: { type: "object" },
    },
  ],
  toolChoice: "required",
  maxOutputTokens: 2500,
  stopSequences: ["<stop>"],
  temperature: 0.2,
  topP: 0.9,
  streamFormat: "events",
};

const withServer = async (respond, run) => {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    requests.push({
      path: request.url,
      key: request.headers["x-api-key"],
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    });
    respond(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    await run(
      createLumaClient({ baseURL: `http://127.0.0.1:${address.port}`, apiKey: "native-test-key" }),
      requests,
    );
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
};

const jsonReply = (reply) => (response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(reply));
};

const readStream = async (response) => {
  const chunks = [];
  for await (const chunk of response.data) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
};

test("native generation preserves tool calls, history, controls and the model result", async () => {
  const reply = {
    message: "",
    toolCalls: [toolCall],
    finishReason: "tool-calls",
    usage: { inputTokens: 12, outputTokens: 7 },
  };
  await withServer(jsonReply(reply), async (client, requests) => {
    assert.deepEqual(await client.mentor.generateChat(toolRequest), reply);
    assert.deepEqual(requests, [
      { path: "/api/public/v1/ai/mentor/chat/generate", key: "native-test-key", body: toolRequest },
    ]);
  });
});

test("legacy native generation keeps the texts-only response unchanged", async () => {
  const reply = { message: "Native text answer." };
  await withServer(jsonReply(reply), async (client, requests) => {
    assert.deepEqual(await client.mentor.generateChat(textRequest), reply);
    assert.deepEqual(requests[0].body, textRequest);
  });
});

test("native event streaming keeps NDJSON text/tool/finish events on the existing chat path", async () => {
  const events = [
    { type: "text-delta", text: "Checking…" },
    { type: "tool-call", ...toolCall },
    { type: "finish", finishReason: "tool-calls", usage: { inputTokens: 12, outputTokens: 7 } },
  ]
    .map((event) => JSON.stringify(event) + "\n")
    .join("");
  await withServer(
    (response) => {
      response.writeHead(200, { "content-type": "application/x-ndjson" });
      response.write(events.slice(0, 17));
      response.end(events.slice(17));
    },
    async (client, requests) => {
      const response = await client.mentor.streamChat(toolRequest);
      assert.equal(await readStream(response), events);
      assert.deepEqual(requests, [
        { path: "/api/public/v1/ai/mentor/chat", key: "native-test-key", body: toolRequest },
      ]);
    },
  );
});

test("legacy native chat alias keeps plain text streaming", async () => {
  await withServer(
    (response) => {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.write("Native ");
      response.end("text answer.");
    },
    async (client, requests) => {
      assert.equal(await readStream(await client.mentor.chat(textRequest)), "Native text answer.");
      assert.deepEqual(requests[0].body, textRequest);
    },
  );
});

test("native generation cancellation prevents an already-aborted request", async () => {
  await withServer(jsonReply({ message: "Unexpected" }), async (client, requests) => {
    const controller = new globalThis.AbortController();
    controller.abort();
    await assert.rejects(
      client.mentor.generateChat(textRequest, { signal: controller.signal }),
      (error) => error.code === "ERR_CANCELED",
    );
    assert.deepEqual(requests, []);
  });
});

test("native stream cancellation stops an opened event response", async () => {
  await withServer(
    (response) => {
      response.writeHead(200, { "content-type": "application/x-ndjson" });
      response.write(JSON.stringify({ type: "text-delta", text: "First chunk" }) + "\n");
    },
    async (client) => {
      const controller = new globalThis.AbortController();
      const response = await client.mentor.streamChat(toolRequest, { signal: controller.signal });
      const iterator = response.data[Symbol.asyncIterator]();
      assert.equal((await iterator.next()).done, false);
      controller.abort();
      await assert.rejects(iterator.next(), (error) => error.code === "ERR_CANCELED");
    },
  );
});
