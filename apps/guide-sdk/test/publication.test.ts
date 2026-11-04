import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { CanceledError, isCancel, type AxiosAdapter } from "axios";
import {
  createGuideClient,
  FinalizationFailure,
  OperationStatus,
  RevisionState,
  SearchMode,
  SearchQueryMode,
  type TutorialDomain,
  type GuideDomain,
  type FinalizationOperation,
  type CreateRevisionRequest,
  type Revision,
  type PublicTutorial,
  type SearchRequest,
  type SearchResponse,
} from "../src/index";

const API_KEY = "synthetic-test-publisher-key-1234567890";
const REVISION_ID = "12345678-1234-4234-8234-123456789abc";
const OPERATION_ID = "87654321-4321-4321-8321-cba987654321";
const TUTORIAL_KEY = "course-authoring.edit-curriculum";
const QUERY: SearchRequest = {
  query: "add a lesson",
  appVersion: "1.2.0",
  language: "pl",
  features: ["course-editor"],
};

function finalization(status: OperationStatus = OperationStatus.Queued): FinalizationOperation {
  return {
    id: OPERATION_ID,
    revisionId: REVISION_ID,
    revisionVersion: 3,
    status,
    attempts: 1,
    failureCode: null,
    retryable: false,
    createdAtMs: 1,
    updatedAtMs: 2,
  };
}
function publishedRevision(): Revision {
  const input = JSON.parse(
    readFileSync(new URL("./fixtures/draft.json", import.meta.url), "utf8"),
  ) as CreateRevisionRequest;
  return {
    id: REVISION_ID,
    tutorialKey: TUTORIAL_KEY,
    state: RevisionState.Published,
    version: 4,
    metadata: input.metadata,
    expectedPublishedRevisionId: null,
    createdAtMs: 1,
    updatedAtMs: 2,
  };
}
function tutorial(): PublicTutorial {
  return {
    key: TUTORIAL_KEY,
    revisionId: REVISION_ID,
    domain: "course-authoring",
    title: "Add a lesson",
    description: "Create lessons in your course",
    language: "en",
    languageFallback: true,
    durationMs: 60_000,
    videoUrl: "https://synthetic.b-cdn.net/video/playlist.m3u8",
    posterUrl: "https://synthetic.b-cdn.net/video/thumbnail.jpg",
    chapters: [
      {
        id: "add-lesson",
        title: "Add a lesson",
        description: "Choose a chapter",
        startMs: 0,
        endMs: 60_000,
      },
    ],
    pageKeys: ["admin.course.curriculum"],
  };
}
function searchResponse(): SearchResponse {
  return {
    mode: SearchMode.KeywordFallback,
    results: [
      {
        tutorial: tutorial(),
        chapterId: "add-lesson",
        excerpt: "Create a lesson",
        startMs: 0,
        endMs: 60_000,
        rankScore: 0.01,
      },
    ],
  };
}

test("finalization and publication use generated secured routes with exact ETags and idempotency", async () => {
  const signal = new AbortController().signal;
  const calls: string[] = [];
  const adapter: AxiosAdapter = async (config) => {
    calls.push(`${config.method} ${config.url}`);
    assert.equal(config.signal, signal);
    assert.equal(config.headers.get("Authorization"), `Bearer ${API_KEY}`);
    assert.equal(config.data, undefined);
    if (config.url?.endsWith("/finalize")) {
      assert.equal(config.headers.get("If-Match"), '"2"');
      assert.equal(config.headers.get("Idempotency-Key"), "finalize-1");
    } else if (config.url?.endsWith("/publish")) {
      assert.equal(config.headers.get("If-Match"), '"3"');
      assert.equal(config.headers.get("Idempotency-Key"), undefined);
    } else {
      assert.equal(config.headers.get("If-Match"), undefined);
      assert.equal(config.headers.get("Idempotency-Key"), undefined);
    }
    return {
      data: config.url?.endsWith("/publish") ? publishedRevision() : finalization(),
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  assert.deepEqual(
    await guide.publishing.finalizeRevision(REVISION_ID, {
      expectedVersion: 2,
      idempotencyKey: "finalize-1",
      signal,
    }),
    finalization(),
  );
  assert.deepEqual(
    await guide.publishing.getFinalizationOperation(OPERATION_ID, { signal }),
    finalization(),
  );
  assert.deepEqual(
    await guide.publishing.retryFinalizationOperation(OPERATION_ID, { signal }),
    finalization(),
  );
  assert.deepEqual(
    await guide.publishing.publishRevision(REVISION_ID, { expectedVersion: 3, signal }),
    publishedRevision(),
  );
  assert.deepEqual(calls, [
    `post /api/v1/admin/video-revisions/${REVISION_ID}/finalize`,
    `get /api/v1/admin/finalization-operations/${OPERATION_ID}`,
    `post /api/v1/admin/finalization-operations/${OPERATION_ID}/retry`,
    `post /api/v1/admin/video-revisions/${REVISION_ID}/publish`,
  ]);
});

test("public search and tutorials never send credentials, even when the factory has a publishing key", async () => {
  for (const apiKey of [undefined, API_KEY]) {
    const signal = new AbortController().signal;
    const calls: string[] = [];
    const adapter: AxiosAdapter = async (config) => {
      assert.equal(config.signal, signal);
      if (config.url?.includes("/admin/")) {
        assert.equal(config.headers.get("Authorization"), `Bearer ${API_KEY}`);
        calls.push(`${config.method} ${config.url}`);
        return { data: finalization(), status: 200, statusText: "OK", headers: {}, config };
      }
      assert.equal(config.headers.get("Authorization"), undefined);
      assert.equal(config.headers.get("If-Match"), undefined);
      assert.equal(config.headers.get("Idempotency-Key"), undefined);
      calls.push(`${config.method} ${config.url}`);
      let data: SearchResponse | PublicTutorial | GuideDomain[] = [
        { key: "course-authoring", label: "Course authoring" },
      ];
      if (config.url === "/api/v1/search") {
        assert.deepEqual(JSON.parse(config.data as string), QUERY);
        data = searchResponse();
      } else if (config.url?.startsWith("/api/v1/tutorials/")) {
        assert.deepEqual(config.params, {
          appVersion: "1.2.0",
          language: "pl",
          features: "course-editor,assistant",
        });
        data = tutorial();
      }
      if (config.url === "/api/v1/domains") assert.deepEqual(config.params, { language: "pl" });
      return { data, status: 200, statusText: "OK", headers: {}, config };
    };
    const guide = createGuideClient({ apiKey, adapter });
    if (apiKey) await guide.publishing.getFinalizationOperation(OPERATION_ID, { signal });
    assert.deepEqual(await guide.search.query(QUERY, { signal }), searchResponse());
    assert.deepEqual(
      await guide.tutorials.get(
        TUTORIAL_KEY,
        {
          appVersion: "1.2.0",
          language: "pl",
          features: "course-editor,assistant",
        },
        { signal },
      ),
      tutorial(),
    );
    assert.deepEqual(await guide.tutorials.domains({ language: "pl" }, { signal }), [
      { key: "course-authoring", label: "Course authoring" },
    ]);
    assert.deepEqual(calls, [
      ...(apiKey ? [`get /api/v1/admin/finalization-operations/${OPERATION_ID}`] : []),
      "post /api/v1/search",
      `get /api/v1/tutorials/${TUTORIAL_KEY}`,
      "get /api/v1/domains",
    ]);
  }
});

test("private finalization methods require a key and validate preconditions before making requests", async () => {
  let calls = 0;
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  const publicGuide = createGuideClient({ adapter });
  await assert.rejects(
    publicGuide.publishing.finalizeRevision(REVISION_ID, {
      expectedVersion: 2,
      idempotencyKey: "one",
    }),
    /requires apiKey/,
  );
  await assert.rejects(
    publicGuide.publishing.getFinalizationOperation(OPERATION_ID),
    /requires apiKey/,
  );
  await assert.rejects(
    publicGuide.publishing.retryFinalizationOperation(OPERATION_ID),
    /requires apiKey/,
  );
  await assert.rejects(
    publicGuide.publishing.publishRevision(REVISION_ID, { expectedVersion: 3 }),
    /requires apiKey/,
  );
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  for (const expectedVersion of [0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(
      guide.publishing.finalizeRevision(REVISION_ID, { expectedVersion, idempotencyKey: "one" }),
      /positive safe integer/,
    );
    await assert.rejects(
      guide.publishing.publishRevision(REVISION_ID, { expectedVersion }),
      /positive safe integer/,
    );
  }
  await assert.rejects(
    guide.publishing.finalizeRevision(REVISION_ID, {
      expectedVersion: 2,
      idempotencyKey: "contains space",
    }),
    /idempotencyKey is invalid/,
  );
  await assert.rejects(
    guide.publishing.finalizeRevision("../health", { expectedVersion: 2, idempotencyKey: "one" }),
    /must be a UUID/,
  );
  await assert.rejects(guide.publishing.getFinalizationOperation("../health"), /must be a UUID/);
  await assert.rejects(guide.publishing.retryFinalizationOperation("../health"), /must be a UUID/);
  await assert.rejects(
    guide.publishing.publishRevision("../health", { expectedVersion: 3 }),
    /must be a UUID/,
  );
  await assert.rejects(
    guide.tutorials.get("../health", { appVersion: "1.2.0", language: "en" }),
    /tutorial key is invalid/,
  );
  assert.equal(calls, 0);
});

test("new publication and public operations preserve cancellation without retries", async () => {
  let calls = 0;
  const signal = new AbortController().signal;
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    assert.equal(config.signal, signal);
    throw new CanceledError("cancelled");
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  const cancelled = (error: unknown) => {
    assert.equal(isCancel(error), true);
    return true;
  };
  await assert.rejects(
    guide.publishing.finalizeRevision(REVISION_ID, {
      expectedVersion: 2,
      idempotencyKey: "one",
      signal,
    }),
    cancelled,
  );
  await assert.rejects(
    guide.publishing.publishRevision(REVISION_ID, { expectedVersion: 3, signal }),
    cancelled,
  );
  await assert.rejects(guide.search.query(QUERY, { signal }), cancelled);
  await assert.rejects(
    guide.tutorials.get(TUTORIAL_KEY, { appVersion: "1.2.0", language: "pl" }, { signal }),
    cancelled,
  );
  assert.equal(calls, 4);
});

test("failed finalization is returned for explicit caller retry/publication decisions", async () => {
  let calls = 0;
  const failed: FinalizationOperation = {
    ...finalization(OperationStatus.Failed),
    failureCode: FinalizationFailure.EmbeddingRejected,
  };
  const adapter: AxiosAdapter = async (config) => {
    calls += 1;
    return { data: failed, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  assert.deepEqual(await guide.publishing.getFinalizationOperation(OPERATION_ID), failed);
  assert.equal(calls, 1);
});

test("public search forwards the explicit keyword or hybrid strategy unchanged", async () => {
  const calls: SearchRequest[] = [];
  const adapter: AxiosAdapter = async (config) => {
    assert.equal(config.headers.get("Authorization"), undefined);
    const input = JSON.parse(config.data as string) as SearchRequest;
    calls.push(input);
    const mode = input.mode === SearchQueryMode.Keyword ? SearchMode.Keyword : SearchMode.Hybrid;
    return { data: { mode, results: [] }, status: 200, statusText: "OK", headers: {}, config };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  for (const mode of [SearchQueryMode.Keyword, SearchQueryMode.Hybrid]) {
    const response = await guide.search.query({ ...QUERY, mode });
    assert.equal(response.mode, mode);
  }
  assert.deepEqual(calls, [
    { ...QUERY, mode: SearchQueryMode.Keyword },
    { ...QUERY, mode: SearchQueryMode.Hybrid },
  ]);
});

test("publishing and search accept future app-area keys without a generated enum", async () => {
  const calls: string[] = [];
  const adapter: AxiosAdapter = async (config) => {
    const body = JSON.parse(config.data as string) as CreateRevisionRequest | SearchRequest;
    const domain = "metadata" in body ? body.metadata.domain : body.domain;
    calls.push(String(domain));
    return {
      data: "metadata" in body ? publishedRevision() : searchResponse(),
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  const guide = createGuideClient({ apiKey: API_KEY, adapter });
  for (const domain of ["users", "reports", "automations"] satisfies TutorialDomain[]) {
    const input = JSON.parse(
      readFileSync(new URL("./fixtures/draft.json", import.meta.url), "utf8"),
    ) as CreateRevisionRequest;
    input.metadata.domain = domain;
    input.metadata.domainLabel = "App area";
    await guide.publishing.createRevision(`${domain}.guide`, input, { idempotencyKey: domain });
    await guide.search.query({ ...QUERY, domain });
  }
  assert.deepEqual(calls, ["users", "users", "reports", "reports", "automations", "automations"]);
  for (const domain of ["", "Users", "users/path", "space key", "x".repeat(129)]) {
    const input = JSON.parse(
      readFileSync(new URL("./fixtures/draft.json", import.meta.url), "utf8"),
    ) as CreateRevisionRequest;
    input.metadata.domain = domain;
    await assert.rejects(
      guide.publishing.createRevision("users.guide", input, { idempotencyKey: "invalid" }),
      /stable lowercase/,
    );
    await assert.rejects(guide.search.query({ ...QUERY, domain }), /stable lowercase/);
  }
  assert.equal(calls.length, 6);
});
