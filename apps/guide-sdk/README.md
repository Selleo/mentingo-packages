# @mentingo/guide-sdk

Thin generated Axios client for Mentingo's self-onboarding service. The
package supports authenticated drafts, media preparation, Bunny upload grants,
verification/indexing operations and explicit publication. Public clients can
search and resolve compatible tutorials without a key. Drafts remain private
until verification/indexing succeeds and `publishRevision` activates them.

The default API origin is `https://help.mentingo.com`. The SDK supports ESM and CommonJS.

```sh
pnpm add @mentingo/guide-sdk
```

```typescript
import { createGuideClient } from "@mentingo/guide-sdk";

const guide = createGuideClient({
  baseURL: process.env.GUIDE_API_URL,
  apiKey: process.env.GUIDE_PUBLISH_API_KEY,
});

const draft = await guide.publishing.createRevision(
  "course-authoring.edit-curriculum",
  { metadata, expectedPublishedRevisionId: null },
  { idempotencyKey: "release-1-course-curriculum-en" },
);
const current = await guide.publishing.getRevision(draft.id);
const updated = await guide.publishing.updateRevision(current.id, updatedMetadata, {
  expectedVersion: current.version,
});
```

`metadata`/`updatedMetadata` use the generated `RevisionMetadata` contract, and
`createRevision` returns a generated `Revision`, not a background operation. See
the [synthetic fixture](https://github.com/Selleo/mentingo-plugins/blob/main/apps/helpdesk/tests/fixtures/draft.json) for the full
metadata shape. Updating replaces the complete metadata document. The SDK sends
a strong quoted `If-Match` version; stale edits return a typed conflict. Creation
retries with the same idempotency key/payload replay the original creation result;
use `getRevision` for current state after later edits. Use a new key for a new
creation request. There is no automatic retry or polling.

## Prepare a direct Bunny upload

```typescript
import { MediaContentType, OperationStatus, SearchQueryMode } from "@mentingo/guide-sdk";

const signal = AbortSignal.timeout(120_000);
let operation = await guide.publishing.prepareMedia(
  updated.id,
  { contentType: MediaContentType.VideoMp4, expectedSizeBytes: fileSize, expectedSha256: sha256 },
  {
    idempotencyKey: "release-1-course-curriculum-en-media",
    expectedVersion: updated.version,
    signal,
  },
);

// Poll explicitly with your workflow's bounded retry/deadline policy.
for (
  let attempt = 0;
  attempt < 60 && [OperationStatus.Queued, OperationStatus.Running].includes(operation.status);
  attempt += 1
) {
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  operation = await guide.publishing.getOperation(operation.id, { signal });
}
if (operation.status !== OperationStatus.Succeeded) {
  throw new Error(`Media preparation did not succeed: ${operation.status}`);
}
const grant = await guide.publishing.createUploadAuthorization(updated.id, { signal });
// Pass grant.endpoint, grant.headers and grant.metadata to your existing TUS client.
// That client uploads the file directly to Bunny, never through the Helpdesk API.
```

`prepareMedia` requires both an idempotency key and the current strong edit
version; it returns a `MediaOperation`. `getOperation` reads status once.
`retryOperation(operation.id)` explicitly requests retry of a recoverable failed
operation; it does not poll or retry automatically. An upload grant maps directly
to the generated `UploadAuthorization`, including its Bunny headers and metadata.
Do not log those grants or send the Helpdesk publishing key to Bunny.

Grants last **3,600 seconds**. Requesting a refreshed grant keeps the same video
GUID and does not extend an existing TUS upload resource's own lifetime. File size
and SHA256 are publisher expectations returned with the grant; the authorization
signature does not enforce or verify those expectations. Grant issuance/preparation
success also does not establish completed upload, playable encoding or publication.

## Finalize, publish and search

After the existing TUS client has completed the direct upload, request media
verification and indexing. Polling remains explicit and bounded by your workflow.
Success does not itself publish the draft:

```typescript
const uploaded = await guide.publishing.getRevision(updated.id);
let finalization = await guide.publishing.finalizeRevision(uploaded.id, {
  expectedVersion: uploaded.version,
  idempotencyKey: "release-1-course-curriculum-en-finalize",
  signal,
});
for (
  let attempt = 0;
  attempt < 60 && [OperationStatus.Queued, OperationStatus.Running].includes(finalization.status);
  attempt += 1
) {
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  finalization = await guide.publishing.getFinalizationOperation(finalization.id, { signal });
}
if (finalization.status !== OperationStatus.Succeeded) {
  throw new Error(`Finalization did not succeed: ${finalization.status}`);
}
const published = await guide.publishing.publishRevision(uploaded.id, {
  expectedVersion: finalization.revisionVersion,
  signal,
});

// Public viewers and self-hosted installations do not receive a publishing key.
const viewer = createGuideClient({ baseURL: process.env.GUIDE_API_URL });
const results = await viewer.search.query({
  query: "How do I add a lesson?",
  appVersion: "1.2.0",
  language: "en",
  mode: SearchQueryMode.Keyword,
  features: ["course-editor"],
  pageKey: "admin.course.curriculum",
});
const tutorial = await viewer.tutorials.get(published.tutorialKey, {
  appVersion: "1.2.0",
  language: "en",
  features: "course-editor",
});
const domains = await viewer.tutorials.domains({ language: "pl" }, { signal });
// [{ key: 'users', label: 'Użytkownicy' }, ...]
```

`finalizeRevision` uses both `Idempotency-Key` and a strong version precondition;
`publishRevision` uses the version from the successful finalization operation.
`retryFinalizationOperation(id)` is an explicit caller decision for a recoverable
failed operation. The SDK never silently polls, retries or publishes. These calls
carry JSON/control metadata, not video bytes. Finalization requires authoritative
Bunny verification evidence and the configured embedding provider; upload/grant
success alone is insufficient.

Public search and tutorial methods send no Authorization header, even if the same
factory was configured with a publishing key. `SearchRequest.mode` explicitly selects `SearchQueryMode.Keyword` or
`SearchQueryMode.Hybrid`. Keyword requests never use embeddings or cached vectors;
choose hybrid only when requested by the caller. Omitting the field preserves
hybrid behavior for existing clients. `SearchResponse.mode` distinguishes
keyword retrieval, hybrid retrieval, hybrid keyword fallback and browsing. Public tutorial data contains
Bunny URLs and chapter bounds, without publisher-only provenance. Search accepts
an array of feature keys; the generated tutorial GET query uses comma-separated
`features`. Domain labels are metadata/suggestions, not required UI filters.

## Configuration and errors

Configuration is explicit: `baseURL`, optional `apiKey`, `timeoutMs` and an
optional Axios adapter for tests. The SDK never reads environment variables. JSON/control requests have fixed limits:
8 MiB per response and 2 MiB per request body. Redirects are disabled, so credentials
and queries stay at the configured origin. Video upload and playback bytes bypass
this SDK and these limits entirely.
Publishing methods reject locally when `apiKey` is absent. The generated
security worker sends it only to secured publishing routes, never health checks.
Do not distribute publishing keys to browsers or self-hosted viewers.

Per-call options accept `signal`; creation requires `idempotencyKey`, and updates
require a positive safe-integer `expectedVersion`. Media preparation requires
both options; finalization does too. Publication requires `expectedVersion`.
Operation, upload-grant and public retrieval methods accept `signal`. `GuideApiError` exposes safe
server code/message, HTTP status, request ID, retryability and Retry-After without
retaining Axios configuration or credentials. Cancellation remains recognizable
through Axios `isCancel`.

## Domain contract in 0.2

`TutorialDomain` is a type-only string alias, rather than a runtime enum. Use a
stable app-area key such as `users`, `reports`, or `automations`; publishing and
search validate `[a-z0-9][a-z0-9._-]{0,127}` before sending requests. Optional
`RevisionMetadata.domainLabel` localizes the readable area name and is returned
on public tutorials. Domain discovery returns `{key,label}` descriptors from
published revisions, with requested-language then English fallback. Existing
revisions without labels continue to work with readable key fallback.

## Updating the contract

The Rust service in `Selleo/mentingo-plugins/apps/helpdesk` owns the HTTP contract.
Export its OpenAPI through the service's `openapi` command, copy the public JSON to
`src/api/api-schema.json`, then run `pnpm --filter @mentingo/guide-sdk generate:client`.
Never edit generated API declarations by hand. Keep the readable facade in `src/client.ts`,
errors in `src/errors.ts` and browser-safe exports in `src/types.ts`. Tests use synthetic
metadata and mocked Axios adapters; they make no provider calls.

Add a changeset for SDK changes. `pnpm version-packages` applies the release bump,
and `pnpm release` publishes from main after the release PR has merged. Core can then
replace its vendored file dependency with the published version.

Run package checks from this repository:

```sh
pnpm --filter @mentingo/guide-sdk typecheck
pnpm --filter @mentingo/guide-sdk lint
pnpm --filter @mentingo/guide-sdk test
pnpm --filter @mentingo/guide-sdk build
```
