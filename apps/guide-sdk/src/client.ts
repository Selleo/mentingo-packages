import axios, { type AxiosAdapter } from "axios";
import {
  GuideApi,
  type CreateRevisionRequest,
  type PrepareMediaRequest,
  type RevisionMetadata,
  type SearchRequest,
} from "./api/generated-api";
import { toGuideApiError } from "./errors";
import type { GuideDomainQuery, GuideTutorialQuery } from "./types";

const DEFAULT_BASE_URL = "https://help.mentingo.com";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_JSON_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_JSON_REQUEST_BYTES = 2 * 1024 * 1024;
const TUTORIAL_KEY = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const REVISION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IDEMPOTENCY_KEY = /^[a-zA-Z0-9._-]{1,128}$/;

export interface GuideClientOptions {
  baseURL?: string;
  apiKey?: string;
  timeoutMs?: number;
  adapter?: AxiosAdapter;
}

export interface GuideRequestOptions {
  signal?: AbortSignal;
}

export interface GuideCreateRevisionOptions extends GuideRequestOptions {
  idempotencyKey: string;
}

export interface GuideUpdateRevisionOptions extends GuideRequestOptions {
  expectedVersion: number;
}

export type GuidePrepareMediaOptions = GuideCreateRevisionOptions & GuideUpdateRevisionOptions;
export type GuideFinalizeRevisionOptions = GuidePrepareMediaOptions;
export type GuidePublishRevisionOptions = GuideUpdateRevisionOptions;

function validateDomain(value: unknown): void {
  if (typeof value !== "string" || !TUTORIAL_KEY.test(value)) {
    throw new Error("Guide domain must be a stable lowercase app-area key");
  }
}

function validateBaseURL(value: string): string {
  const url = new URL(value);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("Guide baseURL must be an HTTPS origin or local loopback HTTP origin");
  }
  return url.origin;
}

/**
 * Create the generated Axios facade with explicit configuration; no environment
 * reads, retries, polling or video buffering occur here. Publishing requires the
 * workflow key. The generated security worker sends it only on secured routes.
 * Axios cancellation remains recognizable to callers.
 */
export function createGuideClient(options: GuideClientOptions = {}) {
  const apiKey = options.apiKey;
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new Error("Guide timeoutMs must be a positive finite number");
  }
  if (apiKey !== undefined && !/^[\x21-\x7e]{32,256}$/.test(apiKey)) {
    throw new Error("Guide apiKey must contain 32-256 non-whitespace ASCII characters");
  }
  const api = new GuideApi<string>({
    baseURL: validateBaseURL(options.baseURL ?? DEFAULT_BASE_URL),
    timeout,
    maxContentLength: MAX_JSON_RESPONSE_BYTES,
    maxBodyLength: MAX_JSON_REQUEST_BYTES,
    maxRedirects: 0,
    securityWorker: (apiKey) =>
      apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : undefined,
    ...(options.adapter ? { adapter: options.adapter } : {}),
  });
  if (apiKey) api.setSecurityData(apiKey);

  async function request<T>(operation: () => Promise<{ data: T }>): Promise<T> {
    try {
      return (await operation()).data;
    } catch (error: unknown) {
      if (axios.isCancel(error)) throw error;
      throw toGuideApiError(error);
    }
  }

  function requirePublisher(): void {
    if (!apiKey) throw new Error("Guide publishing requires apiKey");
  }

  function validateId(id: string, resource: "revision" | "operation"): void {
    if (!REVISION_ID.test(id)) throw new Error(`Guide ${resource} ID must be a UUID`);
  }

  function validateIdempotencyKey(value: string | undefined): string {
    if (typeof value !== "string" || !IDEMPOTENCY_KEY.test(value)) {
      throw new Error("Guide idempotencyKey is invalid");
    }
    return value;
  }

  function versionETag(version: number): string {
    if (!Number.isSafeInteger(version) || version <= 0) {
      throw new Error("Guide expectedVersion must be a positive safe integer");
    }
    return `"${version}"`;
  }

  return {
    health: {
      liveness: (params: GuideRequestOptions = {}) => request(() => api.health.getLiveness(params)),
      readiness: (params: GuideRequestOptions = {}) =>
        request(() => api.health.getReadiness(params)),
    },
    search: {
      query: async (input: SearchRequest, params: GuideRequestOptions = {}) => {
        if (input.domain != null) validateDomain(input.domain);
        return request(() => api.api.searchGuides(input, { signal: params.signal }));
      },
    },
    tutorials: {
      get: async (key: string, query: GuideTutorialQuery, params: GuideRequestOptions = {}) => {
        if (typeof key !== "string" || !TUTORIAL_KEY.test(key))
          throw new Error("Guide tutorial key is invalid");
        return request(() => api.api.getGuide(key, query, { signal: params.signal }));
      },
      domains: (query: GuideDomainQuery = {}, params: GuideRequestOptions = {}) =>
        request(() => api.api.getGuideDomains(query, { signal: params.signal })),
    },
    publishing: {
      createRevision: async (
        key: string,
        input: CreateRevisionRequest,
        params: GuideCreateRevisionOptions,
      ) => {
        requirePublisher();
        if (typeof key !== "string" || !TUTORIAL_KEY.test(key))
          throw new Error("Guide tutorial key is invalid");
        validateDomain(input.metadata.domain);
        const idempotencyKey = validateIdempotencyKey(params?.idempotencyKey);
        return request(() =>
          api.api.createDraftRevision(key, input, {
            signal: params.signal,
            headers: { "Idempotency-Key": idempotencyKey },
          }),
        );
      },
      getRevision: async (id: string, params: GuideRequestOptions = {}) => {
        requirePublisher();
        validateId(id, "revision");
        return request(() => api.api.getDraftRevision(id, { signal: params.signal }));
      },
      prepareMedia: async (
        id: string,
        input: PrepareMediaRequest,
        params: GuidePrepareMediaOptions,
      ) => {
        requirePublisher();
        validateId(id, "revision");
        const idempotencyKey = validateIdempotencyKey(params?.idempotencyKey);
        const etag = versionETag(params?.expectedVersion);
        return request(() =>
          api.api.prepareRevisionMedia(id, input, {
            signal: params.signal,
            headers: { "Idempotency-Key": idempotencyKey, "If-Match": etag },
          }),
        );
      },
      getOperation: async (id: string, params: GuideRequestOptions = {}) => {
        requirePublisher();
        validateId(id, "operation");
        return request(() => api.api.getMediaOperation(id, { signal: params.signal }));
      },
      retryOperation: async (id: string, params: GuideRequestOptions = {}) => {
        requirePublisher();
        validateId(id, "operation");
        return request(() => api.api.retryMediaOperation(id, { signal: params.signal }));
      },
      createUploadAuthorization: async (id: string, params: GuideRequestOptions = {}) => {
        requirePublisher();
        validateId(id, "revision");
        return request(() => api.api.createUploadAuthorization(id, { signal: params.signal }));
      },
      finalizeRevision: async (id: string, params: GuideFinalizeRevisionOptions) => {
        requirePublisher();
        validateId(id, "revision");
        const idempotencyKey = validateIdempotencyKey(params?.idempotencyKey);
        const etag = versionETag(params?.expectedVersion);
        return request(() =>
          api.api.finalizeRevision(id, {
            signal: params.signal,
            headers: { "Idempotency-Key": idempotencyKey, "If-Match": etag },
          }),
        );
      },
      getFinalizationOperation: async (id: string, params: GuideRequestOptions = {}) => {
        requirePublisher();
        validateId(id, "operation");
        return request(() => api.api.getFinalizationOperation(id, { signal: params.signal }));
      },
      retryFinalizationOperation: async (id: string, params: GuideRequestOptions = {}) => {
        requirePublisher();
        validateId(id, "operation");
        return request(() => api.api.retryFinalizationOperation(id, { signal: params.signal }));
      },
      publishRevision: async (id: string, params: GuidePublishRevisionOptions) => {
        requirePublisher();
        validateId(id, "revision");
        const etag = versionETag(params?.expectedVersion);
        return request(() =>
          api.api.publishRevision(id, {
            signal: params.signal,
            headers: { "If-Match": etag },
          }),
        );
      },
      updateRevision: async (
        id: string,
        metadata: RevisionMetadata,
        params: GuideUpdateRevisionOptions,
      ) => {
        requirePublisher();
        validateId(id, "revision");
        const etag = versionETag(params?.expectedVersion);
        validateDomain(metadata.domain);
        return request(() =>
          api.api.updateDraftRevision(id, metadata, {
            signal: params.signal,
            headers: { "If-Match": etag },
          }),
        );
      },
    },
  };
}
