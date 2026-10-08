import assert from "node:assert/strict";
import { Buffer, File } from "node:buffer";
import { createServer } from "node:http";
import { test } from "node:test";

import {
  AuthoringSubscriptionError,
  consumeAuthoringEventStream,
  createLumaClient,
  TaskKind,
} from "../dist/index.js";

const SESSION_ID = "00000000-0000-4000-8000-000000000001";
const COURSE_ID = "00000000-0000-4000-8000-000000000002";
const COMMAND_ID = "00000000-0000-4000-8000-000000000003";
const EXPORT_ID = "00000000-0000-4000-8000-000000000004";
const APPLICATION_ID = "00000000-0000-4000-8000-000000000005";
const CONTEXT_REQUEST_ID = "00000000-0000-4000-8000-000000000010";
const HASH = "a".repeat(64);

test("authoring task kinds include the assembled course review stage", () => {
  assert.equal(TaskKind.CourseReview, "course_review");
});

const snapshot = {
  schemaVersion: 1,
  reasoningControlAvailable: true,
  sessionId: SESSION_ID,
  courseId: COURSE_ID,
  language: "en",
  status: "active",
  snapshotSequence: 7,
  workspaceRevision: 3,
  tasks: [],
  records: [],
  turns: [
    {
      requestId: COMMAND_ID,
      messageId: "message-1",
      status: "completed",
      taskIds: [],
      updatedSequence: 7,
      parts: [
        {
          requestId: COMMAND_ID,
          messageId: "message-1",
          partId: "part-tool-1",
          partKind: "tool",
          status: "completed",
          firstSequence: 4,
          updatedSequence: 5,
          tool: {
            toolCallId: "tool-call-1",
            toolName: "research",
            display: "Searched course sources",
            status: "completed",
            result: { sourceCount: 2, findingCount: 1 },
          },
        },
      ],
    },
  ],
};

const frozenExport = {
  schemaVersion: 1,
  exportId: EXPORT_ID,
  sessionId: SESSION_ID,
  courseId: COURSE_ID,
  language: "en",
  exportHash: HASH,
  proposalIds: ["00000000-0000-4000-8000-000000000006"],
  operations: [],
  assets: [],
  createdAt: "2026-09-16T12:00:00Z",
};

const startRecorder = async (respond) => {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const rawBytes = Buffer.concat(chunks);
    const rawBody = rawBytes.toString();
    const contentType = request.headers["content-type"] ?? "";
    requests.push({
      method: request.method,
      path: request.url,
      headers: request.headers,
      body: rawBody
        ? contentType.startsWith("application/json")
          ? JSON.parse(rawBody)
          : rawBody
        : undefined,
    });
    const result = respond(requests.at(-1));
    response.writeHead(
      result.status ?? 200,
      result.headers ?? { "content-type": "application/json" },
    );
    response.end(
      typeof result.body === "string" || Buffer.isBuffer(result.body)
        ? result.body
        : JSON.stringify(result.body),
    );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Recorder address unavailable");
  return {
    requests,
    baseURL: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};

const withRecorder = async (respond, callback) => {
  const recorder = await startRecorder(respond);
  try {
    await callback(recorder);
  } finally {
    await recorder.close();
  }
};

const createClient = (baseURL) => createLumaClient({ baseURL, apiKey: "organization-secret" });

test("authoring asset download enforces the caller's byte limit", async () => {
  await withRecorder(
    () => ({ body: Buffer.alloc(1024), headers: { "content-type": "application/octet-stream" } }),
    async ({ baseURL, requests }) => {
      await assert.rejects(
        createClient(baseURL).authoring.downloadAsset({
          sessionId: SESSION_ID,
          assetId: EXPORT_ID,
          maxBytes: 16,
        }),
        /maxContentLength|maxBytes/,
      );
      assert.equal(requests.length, 1);
    },
  );
});

test("authoring session methods retain course binding and exact transport", async () => {
  await withRecorder(
    (request) => {
      if (request.method === "POST") return { body: snapshot };
      if (request.path.startsWith("/api/public/v1/authoring/sessions?")) {
        return {
          body: {
            sessions: [
              {
                sessionId: SESSION_ID,
                courseId: COURSE_ID,
                language: "en",
                status: "active",
                title: "Create a compliance course",
                createdAt: "2026-09-22T08:00:00Z",
                lastActivityAt: "2026-09-22T08:01:00Z",
              },
            ],
            total: 1,
            page: 1,
            perPage: 20,
            hasMore: false,
          },
        };
      }
      return { body: snapshot };
    },
    async ({ baseURL, requests }) => {
      const client = createClient(baseURL);
      const created = await client.authoring.createSession({
        commandId: COMMAND_ID,
        courseId: COURSE_ID,
        actorId: "author-1",
        language: "en",
      });
      const sessions = await client.authoring.listSessions({ courseId: COURSE_ID });
      const fetched = await client.authoring.getSession({ sessionId: SESSION_ID });

      assert.equal(created.courseId, COURSE_ID);
      assert.equal(created.reasoningControlAvailable, true);
      assert.equal(sessions.sessions[0]?.title, "Create a compliance course");
      assert.equal(fetched.courseId, COURSE_ID);
      assert.equal(fetched.turns?.[0]?.parts[0]?.tool?.result?.sourceCount, 2);
      assert.equal(fetched.turns?.[0]?.parts[0]?.updatedSequence, 5);
      assert.equal(requests[0].path, "/api/public/v1/authoring/sessions");
      assert.equal(requests[1].path, `/api/public/v1/authoring/sessions?course_id=${COURSE_ID}`);
      assert.equal(requests[2].path, `/api/public/v1/authoring/sessions/${SESSION_ID}`);
      assert.equal(requests[0].headers["x-api-key"], "organization-secret");
    },
  );
});

test("authoring event cursor is forwarded without mutation", async () => {
  await withRecorder(
    () => ({ body: { events: [], nextSequence: 124, hasMore: false } }),
    async ({ baseURL, requests }) => {
      const page = await createClient(baseURL).authoring.getEvents({
        sessionId: SESSION_ID,
        afterSequence: 123,
        limit: 25,
      });
      assert.equal(page.nextSequence, 124);
      assert.equal(
        requests[0].path,
        `/api/public/v1/authoring/sessions/${SESSION_ID}/events?afterSequence=123&limit=25`,
      );
    },
  );
});

test("authoring context fulfillment sends one authenticated fenced callback", async () => {
  const response = {
    schemaVersion: 1,
    contextRequestId: CONTEXT_REQUEST_ID,
    sessionId: SESSION_ID,
    requestId: COMMAND_ID,
    taskId: EXPORT_ID,
    taskFence: 2,
    courseId: COURSE_ID,
    language: "en",
    courseBaselineHash: HASH,
    chapters: [
      {
        id: EXPORT_ID,
        title: "Chapter 1",
        displayOrder: 0,
        baselineHash: HASH,
        deletionBaselineHash: HASH,
        lessons: [
          {
            id: APPLICATION_ID,
            title: "Lesson 1",
            lessonType: "content",
            assessmentAttemptCount: 0,
            displayOrder: 0,
            baselineHash: HASH,
            description: "<p>Current lesson</p>",
            blocks: [],
          },
        ],
      },
    ],
    responseHash: HASH,
  };
  await withRecorder(
    () => ({
      body: {
        contextRequestId: CONTEXT_REQUEST_ID,
        taskId: EXPORT_ID,
        resumed: true,
        dispatchId: APPLICATION_ID,
      },
    }),
    async ({ baseURL, requests }) => {
      const receipt = await createClient(baseURL).authoring.fulfillContext({
        sessionId: SESSION_ID,
        contextRequestId: CONTEXT_REQUEST_ID,
        response,
      });
      assert.equal(receipt.dispatchId, APPLICATION_ID);
      assert.equal(requests.length, 1);
      assert.equal(requests[0].method, "POST");
      assert.equal(
        requests[0].path,
        `/api/public/v1/authoring/sessions/${SESSION_ID}/context-requests/${CONTEXT_REQUEST_ID}/fulfillment`,
      );
      assert.equal(requests[0].headers["x-api-key"], "organization-secret");
      assert.deepEqual(requests[0].body, response);
    },
  );
});

test("authoring context failure sends one bounded authenticated callback", async () => {
  const failure = {
    schemaVersion: 1,
    contextRequestId: CONTEXT_REQUEST_ID,
    sessionId: SESSION_ID,
    requestId: COMMAND_ID,
    taskId: EXPORT_ID,
    taskFence: 2,
    reasonCode: "permission_revoked",
    failureHash: HASH,
  };
  await withRecorder(
    () => ({
      body: {
        contextRequestId: CONTEXT_REQUEST_ID,
        taskId: EXPORT_ID,
        status: "failed",
        failureHash: HASH,
      },
    }),
    async ({ baseURL, requests }) => {
      const receipt = await createClient(baseURL).authoring.failContext({
        sessionId: SESSION_ID,
        contextRequestId: CONTEXT_REQUEST_ID,
        failure,
      });
      assert.equal(receipt.status, "failed");
      assert.equal(requests.length, 1);
      assert.equal(requests[0].method, "POST");
      assert.equal(
        requests[0].path,
        `/api/public/v1/authoring/sessions/${SESSION_ID}/context-requests/${CONTEXT_REQUEST_ID}/failure`,
      );
      assert.equal(requests[0].headers["x-api-key"], "organization-secret");
      assert.deepEqual(requests[0].body, failure);
    },
  );
});

test("authoring SSE forwards auth/cursor and parses ordered events and terminal errors", async () => {
  const events = [];
  const terminalErrors = [];
  await withRecorder(
    () => ({
      headers: { "content-type": "text/event-stream" },
      body:
        ": heartbeat\n\n" +
        `id: 124\nevent: authoring.event\ndata: ${JSON.stringify({
          schemaVersion: 1,
          eventId: "00000000-0000-4000-8000-000000000124",
          sessionId: SESSION_ID,
          sequence: 124,
          occurredAt: "2026-09-16T12:00:00Z",
          type: "task.updated",
          payload: { status: "running" },
        })}\n\n` +
        'event: authoring.error\ndata: {"code":"history_expired"}\n\n',
    }),
    async ({ baseURL, requests }) => {
      await assert.rejects(
        createClient(baseURL).authoring.subscribeEvents({
          sessionId: SESSION_ID,
          afterSequence: 123,
          onEvent: (event) => events.push(event.sequence),
          onError: (error) => terminalErrors.push(error.code),
        }),
        (error) => error instanceof AuthoringSubscriptionError && error.code === "history_expired",
      );
      assert.deepEqual(events, [124]);
      assert.deepEqual(terminalErrors, ["history_expired"]);
      assert.equal(
        requests[0].path,
        `/api/public/v1/authoring/sessions/${SESSION_ID}/events/stream?afterSequence=123`,
      );
      assert.equal(requests[0].headers.accept, "text/event-stream");
      assert.equal(requests[0].headers["x-api-key"], "organization-secret");
    },
  );
});

test("authoring SSE forwards AbortSignal without reconnecting", async () => {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request.url);
    response.writeHead(200, { "content-type": "text/event-stream" });
    response.write(
      `id: 1\nevent: authoring.event\ndata: ${JSON.stringify({
        schemaVersion: 1,
        eventId: "00000000-0000-4000-8000-000000000001",
        sessionId: SESSION_ID,
        sequence: 1,
        occurredAt: "2026-09-16T12:00:00Z",
        type: "session.created",
        payload: {},
      })}\n\n`,
    );
    request.on("close", () => response.end());
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("SSE server address unavailable");
  const controller = new globalThis.AbortController();
  try {
    await assert.rejects(
      createClient(`http://127.0.0.1:${address.port}`).authoring.subscribeEvents({
        sessionId: SESSION_ID,
        signal: controller.signal,
        onEvent: () => controller.abort(),
      }),
      (error) => error.code === "ERR_CANCELED",
    );
    assert.equal(requests.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("authoring SSE rejects wrong schema version and session", async () => {
  const event = {
    schemaVersion: 2,
    eventId: "00000000-0000-4000-8000-000000000010",
    sessionId: SESSION_ID,
    sequence: 10,
    occurredAt: "2026-09-16T12:00:00Z",
    type: "task.updated",
    payload: {},
  };
  const options = { sessionId: SESSION_ID, onEvent: () => undefined };
  await assert.rejects(
    consumeAuthoringEventStream(
      `id: 10\nevent: authoring.event\ndata: ${JSON.stringify(event)}\n\n`,
      options,
    ),
    /Invalid authoring.event payload/,
  );
  event.schemaVersion = 1;
  event.sessionId = "00000000-0000-4000-8000-000000000099";
  await assert.rejects(
    consumeAuthoringEventStream(
      `id: 10\nevent: authoring.event\ndata: ${JSON.stringify(event)}\n\n`,
      options,
    ),
    /session does not match/,
  );
});

test("authoring SSE preserves partial UTF-8 chunks", async () => {
  const event = {
    schemaVersion: 1,
    eventId: "00000000-0000-4000-8000-000000000011",
    sessionId: SESSION_ID,
    sequence: 11,
    occurredAt: "2026-09-16T12:00:00Z",
    type: "task.updated",
    payload: { label: "Zażółć 🚀" },
  };
  const bytes = new globalThis.TextEncoder().encode(
    `id: 11\nevent: authoring.event\ndata: ${JSON.stringify(event)}\n\n`,
  );
  const rocketStart = bytes.findIndex((value) => value === 0xf0);
  const stream = (async function* () {
    yield bytes.slice(0, rocketStart + 2);
    yield bytes.slice(rocketStart + 2);
  })();
  const labels = [];
  await consumeAuthoringEventStream(stream, {
    sessionId: SESSION_ID,
    onEvent: (value) => labels.push(value.payload.label),
  });
  assert.deepEqual(labels, ["Zażółć 🚀"]);
});

test("authoring SSE closes the underlying iterator after a terminal error", async () => {
  let returned = false;
  const iterator = {
    delivered: false,
    async next() {
      if (this.delivered) return new Promise(() => undefined);
      this.delivered = true;
      return {
        done: false,
        value: 'event: authoring.error\ndata: {"code":"permission_revoked"}\n\n',
      };
    },
    async return() {
      returned = true;
      return { done: true };
    },
  };
  const body = { [Symbol.asyncIterator]: () => iterator };
  await assert.rejects(
    consumeAuthoringEventStream(body, { sessionId: SESSION_ID, onEvent: () => undefined }),
    (error) => error instanceof AuthoringSubscriptionError && error.code === "permission_revoked",
  );
  assert.equal(returned, true);
});

test("authoring SSE rejects truncated and oversized frames", async () => {
  const options = { sessionId: SESSION_ID, onEvent: () => undefined };
  await assert.rejects(
    consumeAuthoringEventStream('event: authoring.event\ndata: {"incomplete":true}', options),
    /truncated frame/,
  );
  await assert.rejects(
    consumeAuthoringEventStream(`data: ${"x".repeat(1_048_577)}`, options),
    /exceeds size limit/,
  );
});

test("authoring command preserves commandId and request body", async () => {
  const receipt = {
    commandId: COMMAND_ID,
    hash: HASH,
    acceptedSequence: 8,
    workspaceRevision: 4,
  };
  await withRecorder(
    () => ({ body: receipt }),
    async ({ baseURL, requests }) => {
      const command = { commandId: COMMAND_ID, actorId: "author-1", action: "session.pause" };
      const result = await createClient(baseURL).authoring.sendCommand({
        sessionId: SESSION_ID,
        command,
      });
      assert.equal(result.commandId, COMMAND_ID);
      assert.deepEqual(requests[0].body, command);
      assert.equal(requests[0].path, `/api/public/v1/authoring/sessions/${SESSION_ID}/commands`);
    },
  );
});

test("authoring source refresh forwards selected task IDs unchanged", async () => {
  const command = {
    commandId: COMMAND_ID,
    actorId: "author-1",
    action: "source.refresh",
    targetId: SESSION_ID,
    replacementSourceVersionId: EXPORT_ID,
    selectedTaskIds: [CONTEXT_REQUEST_ID],
  };
  await withRecorder(
    () => ({ body: { commandId: COMMAND_ID, acceptedSequence: 8, workspaceRevision: 4 } }),
    async ({ baseURL, requests }) => {
      await createClient(baseURL).authoring.sendCommand({ sessionId: SESSION_ID, command });
      assert.deepEqual(requests[0].body, command);
    },
  );
});

test("authoring regeneration forwards targeted feedback unchanged", async () => {
  const command = {
    commandId: COMMAND_ID,
    actorId: "author-1",
    action: "proposal.regenerate",
    targetId: SESSION_ID,
    expectedRevision: 2,
    feedback: "Add a concrete example without changing the quiz.",
  };
  await withRecorder(
    () => ({ body: { commandId: COMMAND_ID, acceptedSequence: 8, workspaceRevision: 4 } }),
    async ({ baseURL, requests }) => {
      await createClient(baseURL).authoring.sendCommand({ sessionId: SESSION_ID, command });
      assert.deepEqual(requests[0].body, command);
    },
  );
});

test("authoring regeneration batch forwards every feedback item unchanged", async () => {
  const command = {
    commandId: COMMAND_ID,
    actorId: "author-1",
    action: "proposal.regenerate.batch",
    regenerations: [
      { targetId: SESSION_ID, expectedRevision: 2, feedback: "Add a worked example." },
      { targetId: COURSE_ID, expectedRevision: 1, feedback: "Keep the quiz." },
    ],
  };
  await withRecorder(
    () => ({ body: { commandId: COMMAND_ID, acceptedSequence: 8, workspaceRevision: 4 } }),
    async ({ baseURL, requests }) => {
      await createClient(baseURL).authoring.sendCommand({ sessionId: SESSION_ID, command });
      assert.deepEqual(requests[0].body, command);
    },
  );
});

test("authoring request preserves reasoning effort separately from research depth", async () => {
  const command = {
    commandId: COMMAND_ID,
    actorId: "author-1",
    action: "request.create",
    request: {
      instruction: "Draft one lesson",
      targets: [],
      reasoningEffort: "high",
      sourcePolicy: { researchDepth: "standard", generalKnowledgeEnabled: true },
    },
  };
  await withRecorder(
    () => ({ body: { commandId: COMMAND_ID, acceptedSequence: 8, workspaceRevision: 4 } }),
    async ({ baseURL, requests }) => {
      await createClient(baseURL).authoring.sendCommand({ sessionId: SESSION_ID, command });
      assert.deepEqual(requests[0].body, command);
    },
  );
});

test("authoring command preserves an atomic proposal review and request fence", async () => {
  const proposalId = "00000000-0000-4000-8000-000000000006";
  const requestId = "00000000-0000-4000-8000-000000000007";
  const command = {
    commandId: COMMAND_ID,
    actorId: "author-1",
    action: "proposal.review",
    requestId,
    reviews: [
      {
        proposalId,
        expectedRevision: 2,
        accepted: true,
        acceptQualityConcerns: true,
      },
    ],
  };
  await withRecorder(
    () => ({ body: { commandId: COMMAND_ID, acceptedSequence: 8, workspaceRevision: 4 } }),
    async ({ baseURL, requests }) => {
      await createClient(baseURL).authoring.sendCommand({ sessionId: SESSION_ID, command });
      assert.deepEqual(requests[0].body, command);
    },
  );
});

test("authoring export methods use frozen export endpoints", async () => {
  await withRecorder(
    () => ({ body: frozenExport }),
    async ({ baseURL, requests }) => {
      const client = createClient(baseURL);
      const prepared = await client.authoring.prepareExport({
        sessionId: SESSION_ID,
        request: {
          commandId: COMMAND_ID,
          actorId: "author-1",
          proposalIds: frozenExport.proposalIds,
        },
      });
      const fetched = await client.authoring.getExport({
        sessionId: SESSION_ID,
        exportId: EXPORT_ID,
      });

      assert.equal(prepared.exportHash, HASH);
      assert.equal(fetched.exportId, EXPORT_ID);
      assert.equal(requests[0].path, `/api/public/v1/authoring/sessions/${SESSION_ID}/exports`);
      assert.equal(
        requests[1].path,
        `/api/public/v1/authoring/sessions/${SESSION_ID}/exports/${EXPORT_ID}`,
      );
    },
  );
});

test("authoring receipt is returned and sent unchanged", async () => {
  const receipt = {
    courseId: COURSE_ID,
    sessionId: SESSION_ID,
    applicationId: APPLICATION_ID,
    exportId: EXPORT_ID,
    exportHash: HASH,
    status: "applied",
    idMappings: { temporary: "canonical" },
  };
  await withRecorder(
    () => ({ body: receipt }),
    async ({ baseURL, requests }) => {
      const result = await createClient(baseURL).authoring.recordReceipt({
        sessionId: SESSION_ID,
        receipt,
      });
      assert.deepEqual(result, receipt);
      assert.deepEqual(requests[0].body, receipt);
      assert.equal(requests[0].path, `/api/public/v1/authoring/sessions/${SESSION_ID}/receipts`);
    },
  );
});

test("authoring source upload preserves command identity and multipart file", async () => {
  const uploadReceipt = {
    sourceVersionId: "00000000-0000-4000-8000-000000000007",
    taskId: "00000000-0000-4000-8000-000000000008",
    status: "queued",
    checksum: HASH,
  };
  await withRecorder(
    () => ({ body: uploadReceipt }),
    async ({ baseURL, requests }) => {
      const result = await createClient(baseURL).authoring.uploadSource({
        sessionId: SESSION_ID,
        commandId: COMMAND_ID,
        file: new File(["course source"], "source.txt", { type: "text/plain" }),
      });
      assert.equal(result.checksum, HASH);
      assert.match(requests[0].headers["content-type"], /^multipart\/form-data; boundary=/);
      assert.match(requests[0].body, new RegExp(COMMAND_ID));
      assert.match(requests[0].body, /filename="source.txt"/);
      assert.equal(requests[0].path, `/api/public/v1/authoring/sessions/${SESSION_ID}/sources`);
    },
  );
});

test("authoring asset download is authenticated and revision-bound", async () => {
  const assetId = "00000000-0000-4000-8000-000000000009";
  const bytes = Buffer.from([1, 2, 3, 4]);
  await withRecorder(
    () => ({ body: bytes, headers: { "content-type": "image/png" } }),
    async ({ baseURL, requests }) => {
      const result = await createClient(baseURL).authoring.downloadAsset({
        sessionId: SESSION_ID,
        assetId,
        revision: 2,
      });
      assert.deepEqual([...result.bytes], [...bytes]);
      assert.equal(result.mimeType, "image/png");
      assert.equal(
        requests[0].path,
        `/api/public/v1/authoring/sessions/${SESSION_ID}/assets/${assetId}?revision=2`,
      );
      assert.equal(requests[0].headers["x-api-key"], "organization-secret");
    },
  );
});

test("authoring errors propagate once without automatic command retry", async () => {
  await withRecorder(
    () => ({ status: 409, body: { detail: "command_id_payload_mismatch" } }),
    async ({ baseURL, requests }) => {
      await assert.rejects(
        createClient(baseURL).authoring.sendCommand({
          sessionId: SESSION_ID,
          command: { commandId: COMMAND_ID, actorId: "author-1", action: "session.resume" },
        }),
        (error) => error.response?.status === 409,
      );
      assert.equal(requests.length, 1);
    },
  );
});

test("authoring snapshot retains safe task failure and recovery progress", async () => {
  const failure = {
    code: "detailed_plan_invalid",
    category: "generation",
    stage: "generate",
    recoveryAction: "retry_failed_parts",
    retryable: true,
    affectedChapterIds: [COURSE_ID],
    affectedLessonIds: [EXPORT_ID],
    correlationId: null,
    detailKey: null,
    generationRevision: 2,
  };
  const workProgress = {
    stage: "recovering",
    chapters: [
      {
        chapterId: COURSE_ID,
        title: "Practice",
        lessonCount: 1,
        status: "failed",
        failureCode: failure.code,
      },
    ],
    failedLessonIds: [EXPORT_ID],
    repairAttempt: 1,
    repairLimit: 2,
  };
  await withRecorder(
    () => ({
      body: {
        tasks: [
          { taskId: COMMAND_ID, requestId: COMMAND_ID, status: "failed", failure, workProgress },
          { taskId: EXPORT_ID, requestId: COMMAND_ID, status: "queued", failure: null },
        ],
      },
    }),
    async ({ baseURL }) => {
      const snapshot = await createClient(baseURL).authoring.getSession({ sessionId: SESSION_ID });
      assert.deepEqual(snapshot.tasks[0].failure, failure);
      assert.deepEqual(snapshot.tasks[0].workProgress, workProgress);
      assert.equal(snapshot.tasks[1].failure, null);
    },
  );
});
