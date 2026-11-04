import type { GuideApi } from "./api/generated-api";

/** Browser-safe contract exports; generated from the Rust HTTP schema. */
export type {
  Chapter,
  Compatibility,
  CreateRevisionRequest,
  ErrorResponse,
  HealthResponse,
  FinalizationOperation,
  MediaOperation,
  PrepareMediaRequest,
  PublicChapter,
  PublicTutorial,
  GuideDomain,
  TutorialDomain,
  Revision,
  RevisionMetadata,
  SourceProvenance,
  SearchHit,
  SearchRequest,
  SearchResponse,
  UploadAuthorization,
  UploadHeaders,
  UploadMetadata,
} from "./api/generated-api";
export {
  ErrorCode,
  FinalizationFailure,
  HealthStatus,
  MediaContentType,
  MediaFailureCode,
  OperationStatus,
  RevisionState,
  SearchMode,
  SearchQueryMode,
} from "./api/generated-api";

/** Query parameters derived from the generated public tutorial operation. */
export type GuideTutorialQuery = Parameters<GuideApi<unknown>["api"]["getGuide"]>[1];

/** Optional language for published app-area discovery. */
export type GuideDomainQuery = NonNullable<
  Parameters<GuideApi<unknown>["api"]["getGuideDomains"]>[0]
>;
