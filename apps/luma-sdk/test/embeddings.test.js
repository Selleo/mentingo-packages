/** Verify embeddings stay on Luma's native authenticated contract, including old callers. */
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createServer } from "node:http";
import { test } from "node:test";
import { createLumaClient } from "../dist/index.js";

const withServer = async (reply, run) => {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    requests.push({
      path: request.url,
      method: request.method,
      key: request.headers["x-api-key"],
      body: JSON.parse(Buffer.concat(chunks).toString()),
    });
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(reply));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    await run(
      createLumaClient({ baseURL: `http://127.0.0.1:${address.port}`, apiKey: "synthetic-key" }),
      requests,
    );
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
};

test("native embeddings forwards raw text and dimensions and retains the resolved model", async () => {
  const reply = { embeddings: [[0.1, 0.2]], model: "local-embedding-model" };
  await withServer(reply, async (client, requests) => {
    assert.deepEqual(
      await client.ai.createEmbeddings({ texts: ["Zażółć policy"], dimensions: 2 }),
      reply,
    );
    assert.deepEqual(requests, [
      {
        path: "/api/public/v1/ai/embeddings",
        method: "POST",
        key: "synthetic-key",
        body: { texts: ["Zażółć policy"], dimensions: 2 },
      },
    ]);
  });
});

test("legacy texts-only calls and responses without model metadata remain supported", async () => {
  const reply = { embeddings: [[0.1]] };
  await withServer(reply, async (client, requests) => {
    assert.deepEqual(await client.ai.createEmbeddings({ texts: ["policy"] }), reply);
    assert.deepEqual(requests[0].body, { texts: ["policy"] });
  });
});
