/**
 * Consumer-facing authoring contracts derived from generated API types.
 * Creation-specific Mentor requirements are narrowed here without duplicating the
 * full wire schema. Stream callbacks and transfer options are SDK-local contracts.
 */
import type {
  AiJudgeConfigurationResponseInput,
  AuthoringTurn as GeneratedAuthoringTurn,
  ApplicationReceipt,
  AuthoringCommand as GeneratedAuthoringCommand,
  BodyUploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost,
  CommandReceipt,
  ContextFulfillmentReceipt,
  ContextFailure,
  ContextFailureReceipt,
  ContextResponse,
  CreateSession,
  Event as GeneratedAuthoringEvent,
  EventPage,
  FrozenExport,
  LessonWriteInput,
  MentorLessonInput,
  PrepareExport,
  ProposalReviewDecision,
  SessionSummary,
  SessionSummaryPage,
  SessionSnapshot as GeneratedSessionSnapshot,
  TurnHistoryPage,
  SourceUploadReceipt,
  TaskSummary as GeneratedTaskSummary,
  TaskFailure as GeneratedTaskFailure,
  TurnPart as GeneratedTurnPart,
  WorkspaceRecord,
} from "../api/generated-api";
import { TurnPartKind, TurnPartStatus, TurnStatus } from "../api/generated-api";

export { TurnPartKind, TurnPartStatus, TurnStatus };

type GeneratedAuthoringOperation = NonNullable<GeneratedAuthoringCommand["operations"]>[number];
type GeneratedNonLessonOperation = Exclude<
  GeneratedAuthoringOperation,
  { type: "lesson.create" | "lesson.update" }
>;
type GeneratedLessonPayload = LessonWriteInput["payload"];
type GeneratedNonMentorLessonPayload = Exclude<GeneratedLessonPayload, { lessonType: "ai_mentor" }>;

export type AuthoringMentorLessonCreatePayload = Omit<MentorLessonInput, "judgeConfiguration"> & {
  lessonType: "ai_mentor";
  judgeConfiguration: AiJudgeConfigurationResponseInput;
};

export type AuthoringLessonCreateOperation = Omit<LessonWriteInput, "type" | "payload"> & {
  type: "lesson.create";
  payload: GeneratedNonMentorLessonPayload | AuthoringMentorLessonCreatePayload;
};

export type AuthoringLessonUpdateOperation = Omit<LessonWriteInput, "type"> & {
  type: "lesson.update";
};

export type AuthoringOperation =
  GeneratedNonLessonOperation | AuthoringLessonCreateOperation | AuthoringLessonUpdateOperation;

/**
 * Public command input. It narrows mentor lesson creation so a judge configuration
 * cannot be omitted or explicitly set to null.
 */
export type AuthoringCommand = Omit<GeneratedAuthoringCommand, "operations"> & {
  operations?: AuthoringOperation[] | null;
};

export type AuthoringWorkProgressStage =
  "outline" | "lesson_planning" | "lesson_generation" | "validation" | "repairing" | "recovering";

export type AuthoringWorkProgressChapter = {
  chapterId: string;
  title: string;
  lessonCount: number;
  status: "pending" | "running" | "complete" | "failed";
  failureCode?: string;
};

export type AuthoringWorkProgress = {
  stage: AuthoringWorkProgressStage;
  chapters?: AuthoringWorkProgressChapter[];
  completedLessons?: number;
  totalLessons?: number;
  lessonId?: string;
  lessonTitle?: string;
  chapterId?: string;
  chapterTitle?: string;
  failedLessonIds?: string[];
  repairAttempt?: number;
  repairLimit?: number;
};

export type AuthoringTaskFailure = GeneratedTaskFailure;
export type TaskFailure = GeneratedTaskFailure;

export type TaskSummary = GeneratedTaskSummary & {
  failure?: TaskFailure | null;
  workProgress?: AuthoringWorkProgress;
};

export type SessionSnapshot = Omit<GeneratedSessionSnapshot, "tasks"> & {
  tasks: TaskSummary[];
};

export type AuthoringCreateSessionOptions = CreateSession;
export type AuthoringSessionSnapshot = SessionSnapshot;
export type AuthoringTurnHistoryPage = TurnHistoryPage;
export type AuthoringSessionSummary = SessionSummary;
export type AuthoringSessionPage = SessionSummaryPage;
export type AuthoringTurn = GeneratedAuthoringTurn;
export type AuthoringTurnPart = GeneratedTurnPart;
export type AuthoringTaskSummary = TaskSummary;
export type AuthoringWorkspaceRecord = WorkspaceRecord;
export type AuthoringEvent = GeneratedAuthoringEvent;
export type AuthoringEventPage = EventPage;
export type AuthoringCommandReceipt = CommandReceipt;
export type AuthoringContextResponse = ContextResponse;
export type AuthoringContextFulfillmentReceipt = ContextFulfillmentReceipt;
export type AuthoringContextFailure = ContextFailure;
export type AuthoringContextFailureReceipt = ContextFailureReceipt;
export type PrepareAuthoringExport = PrepareExport;
export type FrozenAuthoringExport = FrozenExport;
export type AuthoringApplicationReceipt = ApplicationReceipt;

export type AuthoringSessionOptions = {
  sessionId: string;
};

export type AuthoringTurnHistoryOptions = AuthoringSessionOptions & {
  beforeRequestId: string;
};

/** Scope, filter, and page the lightweight thread browser for one Core-authorized course. */
export type ListAuthoringSessionsOptions = {
  courseId: string;
  keyword?: string;
  page?: number;
  perPage?: number;
};

export type AuthoringEventsOptions = AuthoringSessionOptions & {
  afterSequence?: number;
  limit?: number;
};

export type AuthoringSubscriptionErrorCode = "history_expired" | "permission_revoked";

/** Terminal subscription condition that requires access recovery or a fresh snapshot. */
export class AuthoringSubscriptionError extends Error {
  readonly code: AuthoringSubscriptionErrorCode;

  /** Preserve the machine-readable terminal reason for consumer recovery decisions. */
  constructor(code: AuthoringSubscriptionErrorCode) {
    super(`Authoring event subscription ended: ${code}`);
    this.name = "AuthoringSubscriptionError";
    this.code = code;
  }
}

export type SubscribeAuthoringEventsOptions = AuthoringSessionOptions & {
  afterSequence?: number;
  signal?: AbortSignal;
  onEvent: (event: AuthoringEvent) => void | Promise<void>;
  onError?: (error: AuthoringSubscriptionError) => void | Promise<void>;
};

export type SendAuthoringCommandOptions = AuthoringSessionOptions & {
  command: AuthoringCommand;
};

export type PrepareAuthoringExportOptions = AuthoringSessionOptions & {
  request: PrepareAuthoringExport;
};

export type GetAuthoringExportOptions = AuthoringSessionOptions & {
  exportId: string;
};

export type RecordAuthoringReceiptOptions = AuthoringSessionOptions & {
  receipt: AuthoringApplicationReceipt;
};

/** Fulfill one AI-selected detail request with Core-authorized current content. */
export type FulfillAuthoringContextOptions = AuthoringSessionOptions & {
  contextRequestId: string;
  response: AuthoringContextResponse;
};

/** Report an authorized, terminal context failure without exposing lesson content. */
export type FailAuthoringContextOptions = AuthoringSessionOptions & {
  contextRequestId: string;
  failure: AuthoringContextFailure;
};

export type UploadAuthoringSourceOptions = AuthoringSessionOptions &
  BodyUploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost;
export type AuthoringSourceUploadReceipt = SourceUploadReceipt;

export type DownloadAuthoringAssetOptions = AuthoringSessionOptions & {
  assetId: string;
  revision?: number;
  /** Maximum response bytes; use the frozen manifest byteSize when available. */
  maxBytes?: number;
  signal?: AbortSignal;
};

export type DownloadedAuthoringAsset = {
  assetId: string;
  revision: number;
  bytes: Uint8Array;
  mimeType?: string;
};

export type {
  AiJudgeConfigurationResponseInput,
  ApplicationReceipt,
  BodyUploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost,
  CommandReceipt,
  ContextFulfillmentReceipt,
  ContextFailure,
  ContextFailureReceipt,
  ContextResponse,
  CreateSession,
  EventPage,
  FrozenExport,
  PrepareExport,
  ProposalReviewDecision,
  SessionSummary,
  SessionSummaryPage,
  SourceUploadReceipt,
  WorkspaceRecord,
};
