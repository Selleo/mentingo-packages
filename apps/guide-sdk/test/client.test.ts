import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { AxiosError, AxiosHeaders, CanceledError, isCancel, type AxiosAdapter } from "axios";
import {
  createGuideClient,
  GuideApiError,
  ErrorCode,
  RevisionState,
  type CreateRevisionRequest,
  type Revision,
} from "../src/index";

test("facade delegates to generated routes and propagates deadline/cancellation settings", async () => {
  const signal = new AbortController().signal;
  const calls: string[] = [];
  const adapter: AxiosAdapter = async (config) => {
    assert.equal(config.baseURL, "http://127.0.0.1:3110");
    assert.equal(config.timeout, 500);
    assert.equal(config.signal, signal);
    assert.equal(config.headers.get("Authorization"), undefined);
    assert.ok(config.url);
    calls.push(config.url);
    return { data: { status: "ok" }, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ baseURL: "http://127.0.0.1:3110/", timeoutMs: 500, adapter });
  assert.deepEqual(await guide.health.liveness({ signal }), { status: "ok" });
  assert.deepEqual(await guide.health.readiness({ signal }), { status: "ok" });
  assert.deepEqual(calls, ["/health/live", "/health/ready"]);
});

test("safe errors expose status and retry information without Axios credentials", async () => {
  const adapter: AxiosAdapter = async (config) => {
    throw new AxiosError("sensitive transport details", "ERR_BAD_RESPONSE", config, undefined, {
      data: { status: "unavailable" },
      status: 503,
      statusText: "Unavailable",
      config,
      headers: AxiosHeaders.from({ "x-request-id": "request-1", "retry-after": "3" }),
    });
  };
  await assert.rejects(createGuideClient({ adapter }).health.readiness(), (error: unknown) => {
    assert.ok(error instanceof GuideApiError);
    assert.equal(error.status, 503);
    assert.equal(error.requestId, "request-1");
    assert.equal(error.retryAfter, "3");
    assert.equal("config" in error, false);
    assert.equal(error.message.includes("sensitive"), false);
    return true;
  });
});

test("configuration refuses credential-bearing/non-origin/insecure URLs and invalid deadlines", () => {
  for (const baseURL of [
    "http://example.com",
    "https://user:secret@example.com",
    "https://example.com/api",
    "https://example.com/?token=secret",
    "https://example.com/#fragment",
  ]) {
    assert.throws(() => createGuideClient({ baseURL }));
  }
  for (const timeoutMs of [0, -1, Infinity, NaN]) {
    assert.throws(() => createGuideClient({ timeoutMs }));
  }
});

test("cancellation remains recognizable to Axios callers", async () => {
  const adapter: AxiosAdapter = async () => {
    throw new CanceledError("cancelled");
  };
  await assert.rejects(createGuideClient({ adapter }).health.liveness(), (error: unknown) => {
    assert.equal(isCancel(error), true);
    return true;
  });
});

const PUBLISHER_KEY = "synthetic-test-publisher-key-1234567890";
const REVISION_ID = "12345678-1234-4234-8234-123456789abc";
const TUTORIAL_KEY = "course-authoring.edit-curriculum";

function draftInput(): CreateRevisionRequest {
  return JSON.parse(
    readFileSync(new URL("./fixtures/draft.json", import.meta.url), "utf8"),
  ) as CreateRevisionRequest;
}

function draftRevision(): Revision {
  return {
    id: REVISION_ID,
    tutorialKey: TUTORIAL_KEY,
    state: RevisionState.Draft,
    version: 1,
    metadata: draftInput().metadata,
    expectedPublishedRevisionId: null,
    createdAtMs: 1,
    updatedAtMs: 1,
  };
}

test("publishing delegates to generated operations with isolated credentials and precondition headers", async () => {
  const signal = new AbortController().signal;
  const calls: string[] = [];
  const input = draftInput();
  const adapter: AxiosAdapter = async (config) => {
    assert.equal(config.signal, signal);
    calls.push(`${config.method} ${config.url}`);
    if (config.url === "/health/live") {
      assert.equal(config.headers.get("Authorization"), undefined);
      return { data: { status: "ok" }, status: 200, statusText: "OK", headers: {}, config };
    }
    assert.equal(config.headers.get("Authorization"), `Bearer ${PUBLISHER_KEY}`);
    if (config.method === "post") {
      assert.equal(config.headers.get("Idempotency-Key"), "release-1");
      assert.equal(config.headers.get("If-Match"), undefined);
      assert.deepEqual(JSON.parse(config.data as string), input);
    }
    if (config.method === "patch") {
      assert.equal(config.headers.get("If-Match"), '"1"');
      assert.equal(config.headers.get("Idempotency-Key"), undefined);
      assert.deepEqual(JSON.parse(config.data as string), input.metadata);
    }
    return { data: draftRevision(), status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ apiKey: PUBLISHER_KEY, adapter });
  assert.deepEqual(
    await guide.publishing.createRevision(TUTORIAL_KEY, input, {
      idempotencyKey: "release-1",
      signal,
    }),
    draftRevision(),
  );
  assert.deepEqual(await guide.publishing.getRevision(REVISION_ID, { signal }), draftRevision());
  assert.deepEqual(
    await guide.publishing.updateRevision(REVISION_ID, input.metadata, {
      expectedVersion: 1,
      signal,
    }),
    draftRevision(),
  );
  await guide.health.liveness({ signal });
  assert.deepEqual(calls, [
    `post /api/v1/admin/tutorials/${TUTORIAL_KEY}/revisions`,
    `get /api/v1/admin/video-revisions/${REVISION_ID}`,
    `patch /api/v1/admin/video-revisions/${REVISION_ID}`,
    "get /health/live",
  ]);
});

test("publishing without a key fails locally for every method", async () => {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ adapter });
  await assert.rejects(
    guide.publishing.createRevision(TUTORIAL_KEY, draftInput(), { idempotencyKey: "one" }),
    /requires apiKey/,
  );
  await assert.rejects(guide.publishing.getRevision(REVISION_ID), /requires apiKey/);
  await assert.rejects(
    guide.publishing.updateRevision(REVISION_ID, draftInput().metadata, { expectedVersion: 1 }),
    /requires apiKey/,
  );
  assert.equal(calls, 0);
});

test("invalid publishing preconditions and path identifiers never issue HTTP requests", async () => {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ apiKey: PUBLISHER_KEY, adapter });
  for (const expectedVersion of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity, NaN]) {
    await assert.rejects(
      guide.publishing.updateRevision(REVISION_ID, draftInput().metadata, { expectedVersion }),
      /positive safe integer/,
    );
  }
  for (const idempotencyKey of ["", "contains space", "x".repeat(129)]) {
    await assert.rejects(
      guide.publishing.createRevision(TUTORIAL_KEY, draftInput(), { idempotencyKey }),
      /idempotencyKey is invalid/,
    );
  }
  for (const key of ["../health", "topic?query=value", "topic#fragment"]) {
    await assert.rejects(
      guide.publishing.createRevision(key, draftInput(), { idempotencyKey: "one" }),
      /tutorial key is invalid/,
    );
  }
  await assert.rejects(guide.publishing.getRevision("../health"), /must be a UUID/);
  assert.equal(calls, 0);
  for (const apiKey of ["", "short", "x".repeat(257), "x".repeat(32) + "\n"]) {
    assert.throws(() => createGuideClient({ apiKey }), /apiKey must contain/);
  }
});

test("structured publishing errors expose generated codes and safe server details", async () => {
  const adapter: AxiosAdapter = async (config) => {
    throw new AxiosError("private transport diagnostics", "ERR_BAD_RESPONSE", config, undefined, {
      data: {
        code: ErrorCode.StaleRevision,
        message: "Draft version changed",
        requestId: "body-id",
        retryable: false,
      },
      status: 409,
      statusText: "Conflict",
      config,
      headers: AxiosHeaders.from({ "x-request-id": "header-id", "retry-after": "2" }),
    });
  };
  await assert.rejects(
    createGuideClient({ apiKey: PUBLISHER_KEY, adapter }).publishing.getRevision(REVISION_ID),
    (error: unknown) => {
      assert.ok(error instanceof GuideApiError);
      assert.equal(error.message, "Draft version changed");
      assert.equal(error.code, ErrorCode.StaleRevision);
      assert.equal(error.status, 409);
      assert.equal(error.requestId, "header-id");
      assert.equal(error.retryAfter, "2");
      assert.equal(error.retryable, false);
      assert.equal("config" in error, false);
      assert.equal(JSON.stringify(error).includes(PUBLISHER_KEY), false);
      return true;
    },
  );
});

test("unrecognized error payloads do not expose arbitrary response or transport diagnostics", async () => {
  const adapter: AxiosAdapter = async (config) => {
    throw new AxiosError("private transport diagnostics", "ERR_BAD_RESPONSE", config, undefined, {
      data: { code: "unrecognized", message: "private provider key", retryable: true },
      status: 503,
      statusText: "Unavailable",
      config,
      headers: {},
    });
  };
  await assert.rejects(
    createGuideClient({ apiKey: PUBLISHER_KEY, adapter }).publishing.getRevision(REVISION_ID),
    (error: unknown) => {
      assert.ok(error instanceof GuideApiError);
      assert.equal(error.message, "Helpdesk request failed");
      assert.equal(error.code, undefined);
      assert.equal(error.retryable, false);
      return true;
    },
  );
});

test("publishing cancellation stays recognizable and is not retried", async () => {
  let calls = 0;
  const adapter: AxiosAdapter = async () => {
    calls += 1;
    throw new CanceledError("cancelled");
  };
  await assert.rejects(
    createGuideClient({ apiKey: PUBLISHER_KEY, adapter }).publishing.getRevision(REVISION_ID),
    (error: unknown) => {
      assert.equal(isCancel(error), true);
      return true;
    },
  );
  assert.equal(calls, 1);
});

test("JSON control requests cap buffered bodies and refuse redirects", async () => {
  const adapter: AxiosAdapter = async (config) => {
    assert.equal(config.maxContentLength, 8 * 1024 * 1024);
    assert.equal(config.maxBodyLength, 2 * 1024 * 1024);
    assert.equal(config.maxRedirects, 0);
    return { data: { status: "ok" }, status: 200, statusText: "OK", headers: {}, config };
  };
  await createGuideClient({ adapter }).health.liveness();
});

test("oversized response and request transport failures redact credentials and body details", async () => {
  for (const detail of [
    "maxContentLength size of 8388608 exceeded",
    "Request body larger than maxBodyLength limit",
  ]) {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError(`${detail}: synthetic-private-body`, "ERR_BAD_RESPONSE", config);
    };
    const guide = createGuideClient({ apiKey: PUBLISHER_KEY, adapter });
    await assert.rejects(guide.publishing.getRevision(REVISION_ID), (error: unknown) => {
      assert.ok(error instanceof GuideApiError);
      assert.equal(error.message, "Helpdesk request failed");
      assert.equal(error.status, undefined);
      assert.equal("config" in error, false);
      assert.equal("cause" in error, false);
      assert.equal(JSON.stringify(error).includes(PUBLISHER_KEY), false);
      assert.equal(JSON.stringify(error).includes("synthetic-private-body"), false);
      return true;
    });
  }
});
