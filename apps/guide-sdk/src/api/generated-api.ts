/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Chapter {
  description: string;
  /** @format int64 */
  endMs: number;
  id: string;
  /** @format int64 */
  startMs: number;
  title: string;
  transcript: string;
}

export interface Compatibility {
  maxVersionExclusive?: string | null;
  minVersionInclusive: string;
}

export interface CreateRevisionRequest {
  /** Null when there is no published predecessor for this tutorial/language. */
  expectedPublishedRevisionId?: string | null;
  metadata: RevisionMetadata;
}

export enum ErrorCode {
  InvalidRequest = "invalid_request",
  InvalidMetadata = "invalid_metadata",
  Unauthorized = "unauthorized",
  NotFound = "not_found",
  Conflict = "conflict",
  StaleRevision = "stale_revision",
  IdempotencyConflict = "idempotency_conflict",
  RateLimited = "rate_limited",
  ServiceUnavailable = "service_unavailable",
  RequestTooLarge = "request_too_large",
  RequestTimeout = "request_timeout",
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  requestId?: string | null;
  retryable: boolean;
}

export enum FinalizationFailure {
  Processing = "processing",
  ProviderUnavailable = "provider_unavailable",
  ProviderRejected = "provider_rejected",
  EncodingFailed = "encoding_failed",
  IntegrityMismatch = "integrity_mismatch",
  TimelineInvalid = "timeline_invalid",
  EmbeddingUnavailable = "embedding_unavailable",
  EmbeddingRejected = "embedding_rejected",
  Expired = "expired",
  StaleRevision = "stale_revision",
}

export interface FinalizationOperation {
  /** @format int64 */
  attempts: number;
  /** @format int64 */
  createdAtMs: number;
  failureCode?: FinalizationFailure | null;
  id: string;
  retryable: boolean;
  revisionId: string;
  /** @format int64 */
  revisionVersion: number;
  status: OperationStatus;
  /** @format int64 */
  updatedAtMs: number;
}

export interface GuideDomain {
  /** Stable app-area identity. New product areas require catalog data, not a service release. */
  key: TutorialDomain;
  label: string;
}

export interface HealthResponse {
  status: HealthStatus;
}

export enum HealthStatus {
  Ok = "ok",
  Unavailable = "unavailable",
}

export enum MediaContentType {
  VideoMp4 = "video/mp4",
}

export enum MediaFailureCode {
  ProviderUnavailable = "provider_unavailable",
  ProviderRejected = "provider_rejected",
  AmbiguousCreation = "ambiguous_creation",
  ProviderConflict = "provider_conflict",
  AttemptsExhausted = "attempts_exhausted",
}

export interface MediaOperation {
  /** @format int64 */
  attempts: number;
  /** @format int64 */
  createdAtMs: number;
  failureCode?: MediaFailureCode | null;
  id: string;
  /** @format int64 */
  retryCount: number;
  retryable: boolean;
  revisionId: string;
  /** @format int64 */
  revisionVersion: number;
  status: OperationStatus;
  /** @format int64 */
  updatedAtMs: number;
}

export enum OperationStatus {
  Queued = "queued",
  Running = "running",
  Succeeded = "succeeded",
  Failed = "failed",
}

export interface PrepareMediaRequest {
  /** The initial video workflow produces MP4. */
  contentType: MediaContentType;
  /** Publisher-provided SHA256. This is not verified by upload authorization. */
  expectedSha256: string;
  /** @format int64 */
  expectedSizeBytes: number;
}

export interface PublicChapter {
  description: string;
  /** @format int64 */
  endMs: number;
  id: string;
  /** @format int64 */
  startMs: number;
  title: string;
}

export interface PublicTutorial {
  chapters: PublicChapter[];
  description: string;
  /** Stable app-area identity. New product areas require catalog data, not a service release. */
  domain: TutorialDomain;
  domainLabel?: string | null;
  /** @format int64 */
  durationMs: number;
  key: string;
  language: string;
  languageFallback: boolean;
  pageKeys: string[];
  posterUrl: string;
  revisionId: string;
  title: string;
  videoUrl: string;
}

export interface Revision {
  /** @format int64 */
  createdAtMs: number;
  expectedPublishedRevisionId?: string | null;
  id: string;
  metadata: RevisionMetadata;
  state: RevisionState;
  tutorialKey: string;
  /** @format int64 */
  updatedAtMs: number;
  /**
   * Optimistic edit version, also returned as a strong ETag.
   * @format int64
   */
  version: number;
}

export interface RevisionMetadata {
  audiences: string[];
  chapters: Chapter[];
  compatibility: Compatibility;
  description: string;
  /** Stable app-area identity. New product areas require catalog data, not a service release. */
  domain: TutorialDomain;
  /** Readable app-area label in this revision's language; omitted by older publishers. */
  domainLabel?: string | null;
  /**
   * Publisher estimate only; Bunny's measured duration is verified before publication later.
   * @format int64
   */
  expectedDurationMs: number;
  featureRequirements: string[];
  keywords: string[];
  language: string;
  pageKeys: string[];
  source: SourceProvenance;
  title: string;
}

export enum RevisionState {
  Draft = "draft",
  Published = "published",
  Withdrawn = "withdrawn",
}

export interface SearchHit {
  chapterId?: string | null;
  /** @format int64 */
  endMs: number;
  excerpt: string;
  /**
   * Rank fusion orders results; this value is not a confidence probability.
   * @format double
   */
  rankScore: number;
  /** @format int64 */
  startMs: number;
  tutorial: PublicTutorial;
}

export enum SearchMode {
  Keyword = "keyword",
  Hybrid = "hybrid",
  KeywordFallback = "keyword_fallback",
  Browse = "browse",
}

/** Requested retrieval strategy, independent from the returned execution/fallback mode. */
export enum SearchQueryMode {
  Keyword = "keyword",
  Hybrid = "hybrid",
}

export interface SearchRequest {
  appVersion: string;
  domain?: TutorialDomain | null;
  features?: string[];
  language: string;
  /**
   * @format int32
   * @min 0
   */
  limit?: number | null;
  /**
   * Omitted mode preserves hybrid retrieval; keyword never requests or uses vectors.
   * @default "hybrid"
   */
  mode?: SearchQueryMode;
  pageKey?: string | null;
  query: string;
}

export interface SearchResponse {
  mode: SearchMode;
  results: SearchHit[];
}

export interface SourceProvenance {
  commit: string;
  specPaths: string[];
  workflowRunId: string;
}

/**
 * Stable app-area identity. New product areas require catalog data, not a service release.
 * @minLength 1
 * @maxLength 128
 * @pattern ^[a-z0-9][a-z0-9._-]{0,127}$
 */
export type TutorialDomain = string;

export interface UploadAuthorization {
  endpoint: string;
  expectedSha256: string;
  /** @format int64 */
  expectedSizeBytes: number;
  /** @format int64 */
  expiresAt: number;
  headers: UploadHeaders;
  metadata: UploadMetadata;
}

export interface UploadHeaders {
  AuthorizationExpire: string;
  AuthorizationSignature: string;
  LibraryId: string;
  VideoId: string;
}

export interface UploadMetadata {
  filetype: string;
  title: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Mentingo Helpdesk
 * @version 0.1.0
 *
 * Public version-aware tutorial search and authenticated direct-to-Bunny publishing, verification and indexing.
 */
export class GuideApi<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags publishing
     * @name GetFinalizationOperation
     * @request GET:/api/v1/admin/finalization-operations/{id}
     * @secure
     */
    getFinalizationOperation: (id: string, params: RequestParams = {}) =>
      this.request<FinalizationOperation, ErrorResponse>({
        path: `/api/v1/admin/finalization-operations/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name RetryFinalizationOperation
     * @request POST:/api/v1/admin/finalization-operations/{id}/retry
     * @secure
     */
    retryFinalizationOperation: (id: string, params: RequestParams = {}) =>
      this.request<FinalizationOperation, ErrorResponse>({
        path: `/api/v1/admin/finalization-operations/${id}/retry`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name GetMediaOperation
     * @request GET:/api/v1/admin/operations/{id}
     * @secure
     */
    getMediaOperation: (id: string, params: RequestParams = {}) =>
      this.request<MediaOperation, ErrorResponse>({
        path: `/api/v1/admin/operations/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name RetryMediaOperation
     * @request POST:/api/v1/admin/operations/{id}/retry
     * @secure
     */
    retryMediaOperation: (id: string, params: RequestParams = {}) =>
      this.request<MediaOperation, ErrorResponse>({
        path: `/api/v1/admin/operations/${id}/retry`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name CreateDraftRevision
     * @request POST:/api/v1/admin/tutorials/{key}/revisions
     * @secure
     */
    createDraftRevision: (key: string, data: CreateRevisionRequest, params: RequestParams = {}) =>
      this.request<Revision, ErrorResponse>({
        path: `/api/v1/admin/tutorials/${key}/revisions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name GetDraftRevision
     * @request GET:/api/v1/admin/video-revisions/{id}
     * @secure
     */
    getDraftRevision: (id: string, params: RequestParams = {}) =>
      this.request<Revision, ErrorResponse>({
        path: `/api/v1/admin/video-revisions/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name UpdateDraftRevision
     * @request PATCH:/api/v1/admin/video-revisions/{id}
     * @secure
     */
    updateDraftRevision: (id: string, data: RevisionMetadata, params: RequestParams = {}) =>
      this.request<Revision, ErrorResponse>({
        path: `/api/v1/admin/video-revisions/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name FinalizeRevision
     * @request POST:/api/v1/admin/video-revisions/{id}/finalize
     * @secure
     */
    finalizeRevision: (id: string, params: RequestParams = {}) =>
      this.request<FinalizationOperation, ErrorResponse>({
        path: `/api/v1/admin/video-revisions/${id}/finalize`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name PrepareRevisionMedia
     * @request POST:/api/v1/admin/video-revisions/{id}/media
     * @secure
     */
    prepareRevisionMedia: (id: string, data: PrepareMediaRequest, params: RequestParams = {}) =>
      this.request<MediaOperation, ErrorResponse>({
        path: `/api/v1/admin/video-revisions/${id}/media`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name PublishRevision
     * @request POST:/api/v1/admin/video-revisions/{id}/publish
     * @secure
     */
    publishRevision: (id: string, params: RequestParams = {}) =>
      this.request<Revision, ErrorResponse>({
        path: `/api/v1/admin/video-revisions/${id}/publish`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags publishing
     * @name CreateUploadAuthorization
     * @request POST:/api/v1/admin/video-revisions/{id}/upload-authorizations
     * @secure
     */
    createUploadAuthorization: (id: string, params: RequestParams = {}) =>
      this.request<UploadAuthorization, ErrorResponse>({
        path: `/api/v1/admin/video-revisions/${id}/upload-authorizations`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags tutorials
     * @name GetGuideDomains
     * @request GET:/api/v1/domains
     */
    getGuideDomains: (
      query?: {
        language?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GuideDomain[], ErrorResponse>({
        path: `/api/v1/domains`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags search
     * @name SearchGuides
     * @request POST:/api/v1/search
     */
    searchGuides: (data: SearchRequest, params: RequestParams = {}) =>
      this.request<SearchResponse, ErrorResponse>({
        path: `/api/v1/search`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags tutorials
     * @name GetGuide
     * @request GET:/api/v1/tutorials/{key}
     */
    getGuide: (
      key: string,
      query: {
        appVersion: string;
        language: string;
        /** Comma-separated enabled public product feature keys. */
        features?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicTutorial, ErrorResponse>({
        path: `/api/v1/tutorials/${key}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags webhooks
     * @name ReceiveBunnyWebhook
     * @request POST:/api/v1/webhooks/bunny
     */
    receiveBunnyWebhook: (params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/v1/webhooks/bunny`,
        method: "POST",
        ...params,
      }),
  };
  health = {
    /**
     * No description
     *
     * @tags health
     * @name GetLiveness
     * @request GET:/health/live
     */
    getLiveness: (params: RequestParams = {}) =>
      this.request<HealthResponse, any>({
        path: `/health/live`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags health
     * @name GetReadiness
     * @request GET:/health/ready
     */
    getReadiness: (params: RequestParams = {}) =>
      this.request<HealthResponse, HealthResponse>({
        path: `/health/ready`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
