import assert from "node:assert/strict";
import { test } from "node:test";
import { CanceledError, isCancel, type AxiosAdapter } from "axios";
import {
  createGuideClient,
  MediaContentType,
  MediaFailureCode,
  OperationStatus,
  type MediaOperation,
  type PrepareMediaRequest,
  type UploadAuthorization,
} from "../src/index";

const API_KEY = "synthetic-test-publisher-key-1234567890";
const REVISION_ID = "12345678-1234-4234-8234-123456789abc";
const OPERATION_ID = "87654321-4321-4321-8321-cba987654321";
const PREPARE_INPUT: PrepareMediaRequest = {
  contentType: MediaContentType.VideoMp4,
  expectedSizeBytes: 4_096,
  expectedSha256: "a".repeat(64),
};

function operation(status: OperationStatus = OperationStatus.Queued): MediaOperation {
  return {
    id: OPERATION_ID,
    revisionId: REVISION_ID,
    revisionVersion: 2,
    status,
    attempts: 1,
    retryCount: 0,
    retryable: false,
    failureCode: null,
    createdAtMs: 1,
    updatedAtMs: 2,
  };
}

function authorization(): UploadAuthorization {
  return {
    endpoint: "https://video.bunnycdn.com/tusupload",
    expectedSizeBytes: PREPARE_INPUT.expectedSizeBytes,
    expectedSha256: PREPARE_INPUT.expectedSha256,
    expiresAt: 1_800_003_600,
    headers: {
      AuthorizationExpire: "1800003600",
      AuthorizationSignature: "b".repeat(64),
      LibraryId: "42",
      VideoId: "11111111-2222-4333-8444-555555555555",
    },
    metadata: { filetype: "video/mp4", title: "synthetic asset" },
  };
}

test("media methods delegate to generated routes with exact preconditions, credentials and cancellation settings", async () => {
  const signal = new AbortController().signal;
  const calls: string[] = [];
  const adapter: AxiosAdapter = async (config) => {
    calls.push(`${config.method} ${config.url}`);
    assert.equal(config.signal, signal);
    if (config.url === "/health/live") {
      assert.equal(config.headers.get("Authorization"), undefined);
      return { data: { status: "ok" }, status: 200, statusText: "OK", headers: {}, config };
    }
    assert.equal(config.headers.get("Authorization"), `Bearer ${API_KEY}`);
    if (config.url?.endsWith("/media")) {
      assert.equal(config.headers.get("Idempotency-Key"), "release-media-1");
      assert.equal(config.headers.get("If-Match"), '"1"');
      assert.deepEqual(JSON.parse(config.data as string), PREPARE_INPUT);
    } else {
      assert.equal(config.headers.get("Idempotency-Key"), undefined);
      assert.equal(config.headers.get("If-Match"), undefined);
      assert.equal(config.data, undefined);
    }
    return {
      data: config.url?.endsWith("/upload-authorizations") ? authorization() : operation(),
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  assert.deepEqual(
    await guide.publishing.prepareMedia(REVISION_ID, PREPARE_INPUT, {
      idempotencyKey: "release-media-1",
      expectedVersion: 1,
      signal,
    }),
    operation(),
  );
  assert.deepEqual(await guide.publishing.getOperation(OPERATION_ID, { signal }), operation());
  assert.deepEqual(await guide.publishing.retryOperation(OPERATION_ID, { signal }), operation());
  assert.deepEqual(
    await guide.publishing.createUploadAuthorization(REVISION_ID, { signal }),
    authorization(),
  );
  await guide.health.liveness({ signal });
  assert.deepEqual(calls, [
    `post /api/v1/admin/video-revisions/${REVISION_ID}/media`,
    `get /api/v1/admin/operations/${OPERATION_ID}`,
    `post /api/v1/admin/operations/${OPERATION_ID}/retry`,
    `post /api/v1/admin/video-revisions/${REVISION_ID}/upload-authorizations`,
    "get /health/live",
  ]);
});

test("all media methods require a publishing key before issuing requests", async () => {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ adapter });
  await assert.rejects(
    guide.publishing.prepareMedia(REVISION_ID, PREPARE_INPUT, {
      idempotencyKey: "prepare-1",
      expectedVersion: 1,
    }),
    /requires apiKey/,
  );
  await assert.rejects(guide.publishing.getOperation(OPERATION_ID), /requires apiKey/);
  await assert.rejects(guide.publishing.retryOperation(OPERATION_ID), /requires apiKey/);
  await assert.rejects(guide.publishing.createUploadAuthorization(REVISION_ID), /requires apiKey/);
  assert.equal(calls, 0);
});

test("invalid media IDs and preparation preconditions never issue requests", async () => {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  for (const expectedVersion of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(
      guide.publishing.prepareMedia(REVISION_ID, PREPARE_INPUT, {
        expectedVersion,
        idempotencyKey: "prepare-1",
      }),
      /positive safe integer/,
    );
  }
  for (const idempotencyKey of ["", "contains whitespace", "x".repeat(129)]) {
    await assert.rejects(
      guide.publishing.prepareMedia(REVISION_ID, PREPARE_INPUT, {
        expectedVersion: 1,
        idempotencyKey,
      }),
      /idempotencyKey is invalid/,
    );
  }
  for (const id of ["../health", "invalid?route=value", ""]) {
    await assert.rejects(
      guide.publishing.prepareMedia(id, PREPARE_INPUT, {
        expectedVersion: 1,
        idempotencyKey: "prepare-1",
      }),
      /revision ID must be a UUID/,
    );
    await assert.rejects(guide.publishing.getOperation(id), /operation ID must be a UUID/);
    await assert.rejects(guide.publishing.retryOperation(id), /operation ID must be a UUID/);
    await assert.rejects(
      guide.publishing.createUploadAuthorization(id),
      /revision ID must be a UUID/,
    );
  }
  assert.equal(calls, 0);
});

test("media cancellation is propagated for every method without retry or polling", async () => {
  let calls = 0;
  const signal = new AbortController().signal;
  const adapter: AxiosAdapter = async (config) => {
    assert.equal(config.signal, signal);
    calls += 1;
    throw new CanceledError("cancelled");
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  const assertCancelled = (error: unknown) => {
    assert.equal(isCancel(error), true);
    return true;
  };
  await assert.rejects(
    guide.publishing.prepareMedia(REVISION_ID, PREPARE_INPUT, {
      idempotencyKey: "prepare-1",
      expectedVersion: 1,
      signal,
    }),
    assertCancelled,
  );
  await assert.rejects(guide.publishing.getOperation(OPERATION_ID, { signal }), assertCancelled);
  await assert.rejects(guide.publishing.retryOperation(OPERATION_ID, { signal }), assertCancelled);
  await assert.rejects(
    guide.publishing.createUploadAuthorization(REVISION_ID, { signal }),
    assertCancelled,
  );
  assert.equal(calls, 4);
});

test("failed operation status is returned for explicit caller decisions without automatic retries", async () => {
  let calls = 0;
  const failed: MediaOperation = {
    ...operation(OperationStatus.Failed),
    failureCode: MediaFailureCode.AmbiguousCreation,
    retryable: true,
  };
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: failed, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  assert.deepEqual(await guide.publishing.getOperation(OPERATION_ID), failed);
  assert.equal(calls, 1);
});
