import { createLumaClient, ReasoningEffort } from "../src/index";
import type { AuthoringRequest } from "../src/api/generated-api";
import type {
  AuthoringCommand,
  AuthoringOperation,
  AuthoringContextFulfillmentReceipt,
  AuthoringContextFailure,
  AuthoringContextFailureReceipt,
  AuthoringContextResponse,
  AuthoringEventPage,
  AuthoringMentorLessonCreatePayload,
  AuthoringSessionSnapshot,
  AuthoringTaskFailure,
  AuthoringWorkProgress,
  FrozenAuthoringExport,
} from "../src/http/authoring.types";

const client = createLumaClient({ apiKey: "organization-secret" });
const sessionId = "00000000-0000-4000-8000-000000000001";
const commandId = "00000000-0000-4000-8000-000000000002";

const authoringRequest: AuthoringRequest = {
  instruction: "Create one lesson",
  targets: [],
  reasoningEffort: ReasoningEffort.High,
};
void authoringRequest;

const command: AuthoringCommand = {
  commandId,
  actorId: "author-1",
  action: "session.pause",
};

const snapshotPromise: Promise<AuthoringSessionSnapshot> = client.authoring.getSession({
  sessionId,
});
const eventsPromise: Promise<AuthoringEventPage> = client.authoring.getEvents({
  sessionId,
  afterSequence: 42,
  limit: 100,
});
const exportPromise: Promise<FrozenAuthoringExport> = client.authoring.getExport({
  sessionId,
  exportId: "00000000-0000-4000-8000-000000000003",
});

void client.authoring.sendCommand({ sessionId, command });
void client.authoring.uploadSource({
  sessionId,
  commandId,
  file: new File(["source"], "source.txt", { type: "text/plain" }),
});
void client.authoring.downloadAsset({
  sessionId,
  assetId: "00000000-0000-4000-8000-000000000004",
  revision: 2,
});
void client.authoring.subscribeEvents({
  sessionId,
  afterSequence: 42,
  signal: new AbortController().signal,
  onEvent: (event) => {
    void event.sequence;
  },
  onError: (error) => {
    void error.code;
  },
});
void snapshotPromise.then((snapshot) => {
  // @ts-expect-error Session accounting is private and absent from the public contract.
  void snapshot.usage;
  const firstPart = snapshot.turns?.[0]?.parts[0];
  const partKind: "text" | "tool" | "proposal" | "question" | undefined = firstPart?.partKind;
  const toolSourceCount: number | null | undefined = firstPart?.tool?.result?.sourceCount;
  void snapshot.courseId;
  const reasoningControlAvailable: boolean | undefined = snapshot.reasoningControlAvailable;
  void reasoningControlAvailable;
  void partKind;
  void toolSourceCount;
});
void eventsPromise;
void exportPromise;

declare const selectedContext: AuthoringContextResponse;
const fulfillmentPromise: Promise<AuthoringContextFulfillmentReceipt> =
  client.authoring.fulfillContext({
    sessionId,
    contextRequestId: "00000000-0000-4000-8000-000000000010",
    response: selectedContext,
  });
void fulfillmentPromise;

declare const contextFailure: AuthoringContextFailure;
const failurePromise: Promise<AuthoringContextFailureReceipt> = client.authoring.failContext({
  sessionId,
  contextRequestId: "00000000-0000-4000-8000-000000000010",
  failure: contextFailure,
});
void failurePromise;

declare const validMentorPayload: AuthoringMentorLessonCreatePayload;

const invalidMentorPayload: AuthoringMentorLessonCreatePayload = {
  ...validMentorPayload,
  // @ts-expect-error A mentor lesson creation cannot explicitly remove its judge configuration.
  judgeConfiguration: null,
};

void invalidMentorPayload;

const qualityAcceptance: AuthoringCommand = {
  commandId,
  actorId: "author-1",
  action: "proposal.accept",
  targetId: sessionId,
  expectedRevision: 1,
  acceptQualityConcerns: true,
};
void client.authoring.sendCommand({ sessionId, command: qualityAcceptance });

const targetedRegeneration: AuthoringCommand = {
  commandId,
  actorId: "author-1",
  action: "proposal.regenerate",
  targetId: sessionId,
  expectedRevision: 1,
  feedback: "Keep the example and shorten the introduction.",
};
void targetedRegeneration;

const batchRegeneration: AuthoringCommand = {
  commandId,
  actorId: "author-1",
  action: "proposal.regenerate.batch",
  regenerations: [
    {
      targetId: sessionId,
      expectedRevision: 1,
      feedback: "Add a worked example.",
    },
  ],
};
void client.authoring.sendCommand({ sessionId, command: batchRegeneration });

const batchReview: AuthoringCommand = {
  commandId,
  actorId: "author-1",
  action: "proposal.review",
  requestId: "00000000-0000-4000-8000-000000000007",
  reviews: [
    {
      proposalId: "00000000-0000-4000-8000-000000000008",
      expectedRevision: 1,
      accepted: true,
      acceptQualityConcerns: true,
    },
    {
      proposalId: "00000000-0000-4000-8000-000000000009",
      expectedRevision: 2,
      accepted: false,
    },
  ],
};
void client.authoring.sendCommand({ sessionId, command: batchReview });
void client.authoring
  .sendCommand({
    sessionId,
    command: {
      commandId,
      actorId: "author-1",
      action: "source.refresh",
      targetId: "00000000-0000-4000-8000-000000000005",
      replacementSourceVersionId: "00000000-0000-4000-8000-000000000006",
      selectedTaskIds: ["00000000-0000-4000-8000-000000000007"],
    },
  })
  .then((receipt) => {
    const status: "refreshed" | "needs_mapping" | null | undefined = receipt.refreshStatus;
    const refreshId: string | null | undefined = receipt.refreshId;
    void status;
    void refreshId;
  });
void exportPromise.then((exported) => {
  for (const asset of exported.assets) {
    if (asset.role === "mentor_context") {
      const sourceVersionId: string | null | undefined = asset.sourceVersionId;
      const sectionIds: string[] | undefined = asset.sectionIds;
      void sourceVersionId;
      void sectionIds;
    }
  }
});

const taskFailure: AuthoringTaskFailure = {
  code: "detailed_plan_invalid",
  category: "generation",
  stage: "generate",
  recoveryAction: "retry_failed_parts",
  retryable: true,
  affectedChapterIds: [sessionId],
  affectedLessonIds: [],
  correlationId: null,
  detailKey: null,
  generationRevision: 1,
};
const recoveringProgress: AuthoringWorkProgress = {
  stage: "recovering",
  chapters: [
    {
      chapterId: sessionId,
      title: "Practice",
      lessonCount: 1,
      status: "failed",
      failureCode: taskFailure.code,
    },
  ],
  failedLessonIds: [commandId],
  repairAttempt: 1,
  repairLimit: 2,
};
void snapshotPromise.then((snapshot) => {
  const failure: AuthoringTaskFailure | null | undefined = snapshot.tasks[0]?.failure;
  const progress: AuthoringWorkProgress | undefined = snapshot.tasks[0]?.workProgress;
  void failure;
  void progress;
});
void recoveringProgress;

const renameLesson: AuthoringOperation = {
  type: "lesson.metadata.update",
  operationId: commandId,
  targetId: sessionId,
  language: "en",
  baselineHash: "a".repeat(64),
  dependencies: [],
  payload: { title: "Clearer lesson title" },
};
void renameLesson;

const clearIntroduction: AuthoringOperation = {
  ...renameLesson,
  payload: { description: "" },
};
void clearIntroduction;

const invalidMetadata: AuthoringOperation = {
  ...renameLesson,
  // @ts-expect-error Lesson metadata edits do not change assessment questions.
  payload: { questions: [] },
};
void invalidMetadata;
