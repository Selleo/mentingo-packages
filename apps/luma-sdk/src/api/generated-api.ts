/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * TurnStatus
 * Enumerate the aggregate lifecycle states exposed for one conversational request.
 */
export enum TurnStatus {
  Queued = "queued",
  Running = "running",
  WaitingAuthor = "waiting_author",
  Completed = "completed",
  Failed = "failed",
  Stopped = "stopped",
}

/**
 * TurnPartStatus
 * Describe the lifecycle of one stable assistant response part.
 */
export enum TurnPartStatus {
  Streaming = "streaming",
  Completed = "completed",
  Failed = "failed",
  Stopped = "stopped",
  Review = "review",
}

/**
 * TurnPartKind
 * Identify a user-visible part of one authoring assistant response.
 */
export enum TurnPartKind {
  Text = "text",
  Tool = "tool",
  Proposal = "proposal",
  Question = "question",
}

/**
 * TaskKind
 * Enumerate graph task kinds persisted in task contracts and dispatch records.
 */
export enum TaskKind {
  Plan = "plan",
  Route = "route",
  Research = "research",
  DetailedPlan = "detailed_plan",
  Lesson = "lesson",
  Edit = "edit",
  Source = "source",
  Asset = "asset",
  CourseReview = "course_review",
}

/**
 * ReasoningEffort
 * Bound provider reasoning according to the request's actual work.
 */
export enum ReasoningEffort {
  Low = "low",
  Medium = "medium",
  High = "high",
}

/**
 * PlanningScope
 * Constrain outline planning to a whole course or newly appended chapters.
 */
export enum PlanningScope {
  Course = "course",
  AppendChapter = "append_chapter",
  AppendLesson = "append_lesson",
}

/**
 * ContentMode
 * Distinguish fact-based authoring from an explicitly requested illustrative draft.
 */
export enum ContentMode {
  Verified = "verified",
  Illustrative = "illustrative",
}

/** AiRuntimeResolutionErrorCode */
export enum AiRuntimeResolutionErrorCode {
  ApiKeyNotFound = "api_key_not_found",
  DomainNotSupported = "domain_not_supported",
  ModeNotAllowed = "mode_not_allowed",
  CustomProfileRequired = "custom_profile_required",
  CustomProfileNotFound = "custom_profile_not_found",
  CustomProfileKindMismatch = "custom_profile_kind_mismatch",
  CustomProfileSecretMissing = "custom_profile_secret_missing",
  CoreProviderKeyMissing = "core_provider_key_missing",
  Disabled = "disabled",
}

/** AiModelProfileKind */
export enum AiModelProfileKind {
  Chat = "chat",
  Image = "image",
  Embedding = "embedding",
  SpeechToText = "speechToText",
  TextToSpeech = "textToSpeech",
}

/** AiModelDomain */
export enum AiModelDomain {
  AiMentor = "aiMentor",
  AiMentorJudge = "aiMentorJudge",
  AiMentorConfigurationGenerator = "aiMentorConfigurationGenerator",
  AiJudgeConfigurationGenerator = "aiJudgeConfigurationGenerator",
  AiJudgeConfigurationValidator = "aiJudgeConfigurationValidator",
  Translations = "translations",
  CourseGeneration = "courseGeneration",
  CourseGenerationVisualAssets = "courseGenerationVisualAssets",
  CourseGenerationEmbeddings = "courseGenerationEmbeddings",
  Embeddings = "embeddings",
  DictationTranscription = "dictationTranscription",
  VoiceTranscription = "voiceTranscription",
  VoiceTts = "voiceTts",
}

/** AiMentorConfigurationValidationSeverity */
export enum AiMentorConfigurationValidationSeverity {
  Error = "error",
  Warning = "warning",
}

/** AiMentorConfigurationType */
export enum AiMentorConfigurationType {
  Teacher = "teacher",
  Roleplay = "roleplay",
}

/** AiMentorConfigurationField */
export enum AiMentorConfigurationField {
  TaskGoal = "taskGoal",
  Expertise = "expertise",
  ContentScope = "contentScope",
  TeachingStyle = "teachingStyle",
  FeedbackGuidance = "feedbackGuidance",
  Scenario = "scenario",
  AiRole = "aiRole",
  LearnerRole = "learnerRole",
  CharacterGoal = "characterGoal",
  Difficulty = "difficulty",
  FactsAndConstraints = "factsAndConstraints",
  OpeningInstruction = "openingInstruction",
  AdditionalInstructions = "additionalInstructions",
}

/** AiCapabilityProvider */
export enum AiCapabilityProvider {
  Luma = "luma",
  MentingoCore = "mentingo-core",
}

/** AiCapabilityMode */
export enum AiCapabilityMode {
  Core = "core",
  Custom = "custom",
  Disabled = "disabled",
}

/** AiCapability */
export enum AiCapability {
  CourseGeneration = "courseGeneration",
  CourseGenerationVisualAssets = "courseGenerationVisualAssets",
  CourseGenerationEmbeddings = "courseGenerationEmbeddings",
  AiMentorChat = "aiMentorChat",
  AiMentorJudge = "aiMentorJudge",
  AiMentorConfigurationGenerator = "aiMentorConfigurationGenerator",
  AiJudgeConfigurationGenerator = "aiJudgeConfigurationGenerator",
  AiJudgeConfigurationValidator = "aiJudgeConfigurationValidator",
  AiMentorRagEmbeddings = "aiMentorRagEmbeddings",
  TranslationGeneration = "translationGeneration",
  DictationTranscription = "dictationTranscription",
  VoiceTranscription = "voiceTranscription",
  VoiceMentor = "voiceMentor",
  VoiceTextToSpeech = "voiceTextToSpeech",
}

/** AiCapabilityStatus */
export interface AiCapabilityStatus {
  /** Enabled */
  enabled: boolean;
  mode: AiCapabilityMode;
  provider: AiCapabilityProvider | null;
  reason?: AiRuntimeResolutionErrorCode | null;
}

/** AiJudgeBlockingErrorValidationTarget */
export interface AiJudgeBlockingErrorValidationTarget {
  /** Type */
  type: "blockingError";
  /**
   * Ref
   * @pattern ^B[1-9]\d*$
   */
  ref: string;
  /** Field */
  field: string | null;
}

/** AiJudgeConfigurationBlockingError */
export interface AiJudgeConfigurationBlockingError {
  /**
   * Ref
   * @pattern ^B[1-9]\d*$
   */
  ref: string;
  /**
   * Description
   * @minLength 1
   */
  description: string;
}

/** AiJudgeConfigurationCriterion */
export interface AiJudgeConfigurationCriterion {
  /**
   * Ref
   * @pattern ^C[1-9]\d*$
   */
  ref: string;
  /**
   * Title
   * @minLength 1
   * @maxLength 80
   */
  title: string;
  /**
   * Expectedbehavior
   * @minLength 1
   */
  expectedBehavior: string;
  /**
   * Maxscore
   * @min 1
   * @max 5
   */
  maxScore: number;
  /** Scoreguidance */
  scoreGuidance: AiJudgeConfigurationScoreGuidance[];
}

/** AiJudgeConfigurationResponse */
export interface AiJudgeConfigurationResponseInput {
  /**
   * Taskgoal
   * @minLength 1
   */
  taskGoal: string;
  /**
   * Passingthresholdpercent
   * @min 0
   * @max 100
   */
  passingThresholdPercent: number;
  /** Criteria */
  criteria: AiJudgeConfigurationCriterion[];
  /** Blockingerrors */
  blockingErrors: AiJudgeConfigurationBlockingError[];
}

/** AiJudgeConfigurationResponse */
export interface AiJudgeConfigurationResponseOutput {
  /**
   * Taskgoal
   * @minLength 1
   */
  taskGoal: string;
  /**
   * Passingthresholdpercent
   * @min 0
   * @max 100
   */
  passingThresholdPercent: number;
  /** Criteria */
  criteria: AiJudgeConfigurationCriterion[];
  /** Blockingerrors */
  blockingErrors: AiJudgeConfigurationBlockingError[];
}

/** AiJudgeConfigurationScoreGuidance */
export interface AiJudgeConfigurationScoreGuidance {
  /**
   * Score
   * @min 0
   * @max 5
   */
  score: number;
  /**
   * Description
   * @minLength 1
   */
  description: string;
  /** Example */
  example: string | null;
}

/** AiJudgeConfigurationValidationResponse */
export interface AiJudgeConfigurationValidationResponse {
  /**
   * Summary
   * @minLength 1
   * @maxLength 180
   */
  summary: string;
  /**
   * Issues
   * @maxItems 3
   */
  issues: AiJudgeValidationIssue[];
}

/** AiJudgeConfigurationValidationTarget */
export interface AiJudgeConfigurationValidationTarget {
  /** Type */
  type: "configuration";
  /** Field */
  field: string | null;
}

/** AiJudgeCriterionValidationTarget */
export interface AiJudgeCriterionValidationTarget {
  /** Type */
  type: "criterion";
  /**
   * Ref
   * @pattern ^C[1-9]\d*$
   */
  ref: string;
  /** Field */
  field: string | null;
}

/** AiJudgeScoreGuidanceValidationTarget */
export interface AiJudgeScoreGuidanceValidationTarget {
  /** Type */
  type: "scoreGuidance";
  /**
   * Ref
   * @pattern ^C[1-9]\d*$
   */
  ref: string;
  /**
   * Score
   * @min 0
   * @max 5
   */
  score: number;
  /** Field */
  field: string | null;
}

/** AiJudgeValidationIssue */
export interface AiJudgeValidationIssue {
  /**
   * Code
   * @minLength 1
   */
  code: string;
  /** Severity */
  severity: "error" | "warning";
  /** Target */
  target:
    | ({
        type: "blockingError";
      } & AiJudgeBlockingErrorValidationTarget)
    | ({
        type: "configuration";
      } & AiJudgeConfigurationValidationTarget)
    | ({
        type: "criterion";
      } & AiJudgeCriterionValidationTarget)
    | ({
        type: "scoreGuidance";
      } & AiJudgeScoreGuidanceValidationTarget);
  /**
   * Message
   * @minLength 1
   * @maxLength 160
   */
  message: string;
  /**
   * Correction
   * @minLength 1
   * @maxLength 220
   */
  correction: string;
}

/** AiMentorConfigurationValidationIssue */
export interface AiMentorConfigurationValidationIssue {
  /**
   * Code
   * @minLength 1
   */
  code: string;
  severity: AiMentorConfigurationValidationSeverity;
  target: AiMentorConfigurationValidationTarget;
  /**
   * Message
   * @minLength 1
   */
  message: string;
  /**
   * Correction
   * @minLength 1
   */
  correction: string;
}

/** AiMentorConfigurationValidationResponse */
export interface AiMentorConfigurationValidationResponse {
  /**
   * Summary
   * @minLength 1
   * @maxLength 180
   */
  summary: string;
  /**
   * Issues
   * @maxItems 3
   */
  issues: AiMentorConfigurationValidationIssue[];
}

/** AiMentorConfigurationValidationTarget */
export interface AiMentorConfigurationValidationTarget {
  field: AiMentorConfigurationField;
}

/** AiMentorRoleplayConfigurationResponse */
export interface AiMentorRoleplayConfigurationResponse {
  /**
   * Scenario
   * @minLength 1
   */
  scenario: string;
  /**
   * Airole
   * @minLength 1
   */
  aiRole: string;
  /**
   * Learnerrole
   * @minLength 1
   */
  learnerRole: string;
  /**
   * Charactergoal
   * @minLength 1
   */
  characterGoal: string;
  /** Difficulty */
  difficulty: "cooperative" | "realistic" | "challenging";
  /** Factsandconstraints */
  factsAndConstraints: string | null;
  /** Openinginstruction */
  openingInstruction: string | null;
  /** Additionalinstructions */
  additionalInstructions: string | null;
}

/** AiMentorTeacherConfigurationResponse */
export interface AiMentorTeacherConfigurationResponse {
  /**
   * Taskgoal
   * @minLength 1
   */
  taskGoal: string;
  /**
   * Expertise
   * @minLength 1
   */
  expertise: string;
  /**
   * Contentscope
   * @minLength 1
   */
  contentScope: string;
  /** Teachingstyle */
  teachingStyle: "explain_and_practice" | "guided_discovery" | "socratic";
  /** Feedbackguidance */
  feedbackGuidance: string | null;
  /** Openinginstruction */
  openingInstruction: string | null;
  /** Additionalinstructions */
  additionalInstructions: string | null;
}

/** AiModelAssignmentResponse */
export interface AiModelAssignmentResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Apikeyid
   * @format uuid
   */
  apiKeyId: string;
  domain: AiModelDomain;
  mode: AiCapabilityMode;
  /** Modelprofileid */
  modelProfileId: string | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** AiModelAssignmentUpdateRequest */
export interface AiModelAssignmentUpdateRequest {
  mode: AiCapabilityMode;
  /** Modelprofileid */
  modelProfileId?: string | null;
}

/** AiModelProfileResponse */
export interface AiModelProfileResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Organizationid
   * @format uuid
   */
  organizationId: string;
  /** Name */
  name: string;
  kind: AiModelProfileKind;
  /** Baseurl */
  baseUrl: string;
  /** Model */
  model: string;
  /** Metadata */
  metadata: Record<string, any>;
  /** Hasapikey */
  hasApiKey: boolean;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** ApiKeyCreateRequest */
export interface ApiKeyCreateRequest {
  /**
   * Name
   * @minLength 2
   * @maxLength 120
   */
  name: string;
}

/** ApiKeyCreateResponse */
export interface ApiKeyCreateResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Key */
  key: string;
  /** Prefix */
  prefix: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
}

/** ApiKeyResponse */
export interface ApiKeyResponse {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Prefix */
  prefix: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
  /** Lastusedat */
  lastUsedAt?: string | null;
  /** Revokedat */
  revokedAt?: string | null;
}

/** ApiKeyUpdateRequest */
export interface ApiKeyUpdateRequest {
  /** Name */
  name?: string | null;
  /** Embeddingapikey */
  embeddingApiKey?: string | null;
  /** Agentapikey */
  agentApiKey?: string | null;
  /**
   * Speechtotextapikey
   * ElevenLabs Scribe speech-to-text API key used for voice mentor transcription.
   */
  speechToTextApiKey?: string | null;
  /**
   * Texttospeechapikey
   * Text-to-speech provider API key. Currently only Cartesia is supported.
   */
  textToSpeechApiKey?: string | null;
}

/** ApplicationDeltaProof */
export interface ApplicationDeltaProof {
  /** Appliedoperationids */
  appliedOperationIds?: string[];
  /** Idmappings */
  idMappings?: Record<string, string>;
}

/**
 * ApplicationReceipt
 * Record the Core application result, ID mappings, and conflict or failure reason.
 */
export interface ApplicationReceipt {
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /**
   * Applicationid
   * @format uuid
   */
  applicationId: string;
  /**
   * Exportid
   * @format uuid
   */
  exportId: string;
  /**
   * Exporthash
   * @pattern ^[0-9a-f]{64}$
   */
  exportHash: string;
  /** Status */
  status: "applied" | "conflict" | "failed";
  /** Idmappings */
  idMappings?: Record<string, string>;
  /** Reason */
  reason?: string | null;
}

/**
 * AssessmentQuestion
 * Model a quiz question and validate child identities, references, and type-specific payloads.
 */
export interface AssessmentQuestionInput {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Questiontype */
  questionType:
    | "single_choice"
    | "multiple_choice"
    | "true_or_false"
    | "photo_question_single_choice"
    | "photo_question_multiple_choice"
    | "fill_in_the_blanks_text"
    | "fill_in_the_blanks_dnd"
    | "brief_response"
    | "detailed_response"
    | "scale_1_5";
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
  /**
   * Maximumpoints
   * @pattern ^\d+(\.\d+)?$
   */
  maximumPoints: string;
  /** Gradingmode */
  gradingMode: "automatic" | "manual" | "participation";
  /** Prompt */
  prompt: string;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /** Photos3Key */
  photoS3Key?: string | null;
  /** Options */
  options?: ChoiceOption[];
  /** Truefalsestatements */
  trueFalseStatements?: TrueFalseStatement[];
  /** Scaleoptions */
  scaleOptions?: ScaleOption[];
  openTextSettings?: OpenTextSettings | null;
  /** Blanks */
  blanks?: QuestionBlank[];
  /** Draganddropoptions */
  dragAndDropOptions?: DragOption[];
}

/**
 * AssessmentQuestion
 * Model a quiz question and validate child identities, references, and type-specific payloads.
 */
export interface AssessmentQuestionOutput {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Questiontype */
  questionType:
    | "single_choice"
    | "multiple_choice"
    | "true_or_false"
    | "photo_question_single_choice"
    | "photo_question_multiple_choice"
    | "fill_in_the_blanks_text"
    | "fill_in_the_blanks_dnd"
    | "brief_response"
    | "detailed_response"
    | "scale_1_5";
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
  /**
   * Maximumpoints
   * @pattern ^\d+(\.\d+)?$
   */
  maximumPoints: string;
  /** Gradingmode */
  gradingMode: "automatic" | "manual" | "participation";
  /** Prompt */
  prompt: string;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /** Photos3Key */
  photoS3Key?: string | null;
  /** Options */
  options?: ChoiceOption[];
  /** Truefalsestatements */
  trueFalseStatements?: TrueFalseStatement[];
  /** Scaleoptions */
  scaleOptions?: ScaleOption[];
  openTextSettings?: OpenTextSettings | null;
  /** Blanks */
  blanks?: QuestionBlank[];
  /** Draganddropoptions */
  dragAndDropOptions?: DragOption[];
}

/**
 * AssetManifestItem
 * Describe an exported asset and its operation, source, section, checksum, and size binding.
 */
export interface AssetManifestItem {
  /** Operationid */
  operationId?: string | null;
  /**
   * Role
   * @default "visual"
   */
  role?: "visual" | "mentor_context";
  /** Sourceversionid */
  sourceVersionId?: string | null;
  /** Sectionids */
  sectionIds?: string[];
  /**
   * Assetid
   * @format uuid
   */
  assetId: string;
  /**
   * Sha256
   * @pattern ^[0-9a-f]{64}$
   */
  sha256: string;
  /** Mimetype */
  mimeType: string;
  /**
   * Revision
   * @min 1
   * @default 1
   */
  revision?: number;
  /**
   * Bytesize
   * @min 0
   */
  byteSize: number;
  /** Required */
  required: boolean;
}

/**
 * AuthoringCommand
 * Define an idempotent session command and enforce its action-specific payload.
 */
export interface AuthoringCommand {
  /**
   * Schemaversion
   * @default 1
   */
  schemaVersion?: 1;
  /**
   * Commandid
   * @format uuid
   */
  commandId: string;
  /** Actorid */
  actorId: string;
  /** Action */
  action:
    | "request.create"
    | "session.pause"
    | "session.resume"
    | "session.stop"
    | "request.stop"
    | "request.discard"
    | "task.retry"
    | "question.answer"
    | "proposal.accept"
    | "proposal.reject"
    | "proposal.review"
    | "proposal.regenerate"
    | "proposal.regenerate.batch"
    | "draft.edit"
    | "draft.discard"
    | "sources.select"
    | "source.refresh"
    | "asset.retry_submission";
  request?: AuthoringRequest | null;
  /** Targetid */
  targetId?: string | null;
  /** Replacementsourceversionid */
  replacementSourceVersionId?: string | null;
  /** Selectedtaskids */
  selectedTaskIds?: string[] | null;
  /** Expectedrevision */
  expectedRevision?: number | null;
  /** Answer */
  answer?: string | null;
  /** Feedback */
  feedback?: string | null;
  /** Regenerations */
  regenerations?: ProposalRegeneration[] | null;
  /** Operations */
  operations?:
    | (
        | ({
            type: "chapter.create";
          } & ChapterWrite)
        | ({
            type: "chapter.delete";
          } & DeleteOperation)
        | ({
            type: "chapter.reorder";
          } & ReorderOperation)
        | ({
            type: "chapter.update";
          } & ChapterWrite)
        | ({
            type: "course.metadata.update";
          } & MetadataUpdate)
        | ({
            type: "course.settings.update";
          } & SettingsUpdateInput)
        | ({
            type: "lesson.block.replace";
          } & BlockReplace)
        | ({
            type: "lesson.create";
          } & LessonWriteInput)
        | ({
            type: "lesson.delete";
          } & DeleteOperation)
        | ({
            type: "lesson.metadata.update";
          } & LessonMetadataUpdate)
        | ({
            type: "lesson.reorder";
          } & ReorderOperation)
        | ({
            type: "lesson.update";
          } & LessonWriteInput)
      )[]
    | null;
  sourcePolicy?: SourcePolicy | null;
  /**
   * Acceptqualityconcerns
   * @default false
   */
  acceptQualityConcerns?: boolean;
  /** Reviews */
  reviews?: ProposalReviewDecision[] | null;
  /** Requestid */
  requestId?: string | null;
}

/**
 * AuthoringRequest
 * Define the initial course-authoring instruction, trusted context, targets, sources, and optional outline.
 */
export interface AuthoringRequest {
  /**
   * Bound provider reasoning according to the request's actual work.
   * @default "medium"
   */
  reasoningEffort?: ReasoningEffort;
  /** Context */
  context?: Record<string, JsonValue>;
  /**
   * Instruction
   * @minLength 1
   * @maxLength 20000
   */
  instruction: string;
  /**
   * Distinguish fact-based authoring from an explicitly requested illustrative draft.
   * @default "verified"
   */
  contentMode?: ContentMode;
  /** Targets */
  targets: TargetRef[];
  /** Allowlist source versions and explicitly enabled web, general-knowledge, and research-depth permissions. */
  sourcePolicy?: SourcePolicy;
  /** Attachedsourceversionids */
  attachedSourceVersionIds?: string[];
  /** Exactoutline */
  exactOutline?: OutlineChapter[] | null;
  /**
   * Constrain outline planning to a whole course or newly appended chapters.
   * @default "course"
   */
  planningScope?: PlanningScope;
  /**
   * Existingchaptercount
   * @min 0
   * @default 0
   */
  existingChapterCount?: number;
  /** Targetchapterid */
  targetChapterId?: string | null;
  /** Targetchaptertitle */
  targetChapterTitle?: string | null;
  /**
   * Targetchapterorder
   * @min 0
   * @default 0
   */
  targetChapterOrder?: number;
  /**
   * Nextlessonorder
   * @min 0
   * @default 0
   */
  nextLessonOrder?: number;
  continuation?: ContinuationRef | null;
}

/**
 * AuthoringTurn
 * Project one root request and all descendant work into an ordered assistant turn.
 */
export interface AuthoringTurn {
  /**
   * Requestid
   * @format uuid
   */
  requestId: string;
  /** Messageid */
  messageId: string;
  /** Enumerate the aggregate lifecycle states exposed for one conversational request. */
  status: TurnStatus;
  /** Taskids */
  taskIds: string[];
  /** Parts */
  parts: TurnPart[];
  /**
   * Firstsequence
   * @min 1
   */
  firstSequence: number;
  /**
   * Updatedsequence
   * @min 0
   */
  updatedSequence: number;
}

/**
 * BlankAnswerSet
 * Define a preferred answer and accepted alternatives for one fill-in blank.
 */
export interface BlankAnswerSet {
  /** Preferredanswer */
  preferredAnswer: string;
  /** Acceptedanswers */
  acceptedAnswers: string[];
}

/**
 * BlockPayload
 * Carry a stable block identifier and its HTML content.
 */
export interface BlockPayload {
  /** Blockid */
  blockId: string;
  /** Html */
  html: string;
}

/**
 * BlockReplace
 * Replace one lesson block identified by its stable block ID.
 */
export interface BlockReplace {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /**
   * Type
   * @default "lesson.block.replace"
   */
  type?: "lesson.block.replace";
  /** Carry a stable block identifier and its HTML content. */
  payload: BlockPayload;
}

/** Body_transcribe_dictation_api_public_v1_ai_transcriptions_post */
export interface BodyTranscribeDictationApiPublicV1AiTranscriptionsPost {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_upload_source_api_public_v1_authoring_sessions__session_id__sources_post */
export interface BodyUploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost {
  /**
   * File
   * @format binary
   */
  file: File;
  /**
   * Commandid
   * @format uuid
   */
  commandId: string;
}

/**
 * ChapterPayload
 * Carry a chapter title and its ordered display position.
 */
export interface ChapterPayload {
  /** Title */
  title: string;
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
}

/**
 * ChapterWrite
 * Create or update a chapter under the operation baseline fence.
 */
export interface ChapterWrite {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /** Type */
  type: "chapter.create" | "chapter.update";
  /** Carry a chapter title and its ordered display position. */
  payload: ChapterPayload;
}

/**
 * ChoiceOption
 * Represent one scored choice with stable identity, display order, and correctness.
 */
export interface ChoiceOption {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
  /** Iscorrect */
  isCorrect: boolean;
  /** Label */
  label: string;
}

/**
 * CommandReceipt
 * Return idempotent command identity, accepted sequence, workspace revision, and produced IDs.
 */
export interface CommandReceipt {
  /**
   * Commandid
   * @format uuid
   */
  commandId: string;
  /**
   * Hash
   * @pattern ^[0-9a-f]{64}$
   */
  hash: string;
  /** Acceptedsequence */
  acceptedSequence: number;
  /** Workspacerevision */
  workspaceRevision: number;
  /** Requestid */
  requestId?: string | null;
  /** Taskids */
  taskIds?: string[] | null;
  /** Refreshid */
  refreshId?: string | null;
  /** Refreshstatus */
  refreshStatus?: "refreshed" | "needs_mapping" | null;
}

/**
 * ContentLesson
 * Carry the title and description payload for a content lesson operation.
 */
export interface ContentLesson {
  /**
   * Lessontype
   * @default "content"
   */
  lessonType?: "content";
  /** Title */
  title: string;
  /** Description */
  description: string;
}

/**
 * ContextFailure
 * Report one bounded terminal callback outcome without transmitting lesson content.
 */
export interface ContextFailure {
  /**
   * Schemaversion
   * @default 1
   */
  schemaVersion?: 1;
  /**
   * Contextrequestid
   * @format uuid
   */
  contextRequestId: string;
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /**
   * Requestid
   * @format uuid
   */
  requestId: string;
  /**
   * Taskid
   * @format uuid
   */
  taskId: string;
  /**
   * Taskfence
   * @min 1
   */
  taskFence: number;
  /** Reasoncode */
  reasonCode:
    | "permission_revoked"
    | "course_unavailable"
    | "target_unavailable"
    | "context_invalid";
  /**
   * Failurehash
   * @pattern ^[0-9a-f]{64}$
   */
  failureHash: string;
}

/**
 * ContextFailureReceipt
 * Acknowledge one idempotent, system-owned terminal context failure.
 */
export interface ContextFailureReceipt {
  /**
   * Contextrequestid
   * @format uuid
   */
  contextRequestId: string;
  /**
   * Taskid
   * @format uuid
   */
  taskId: string;
  /**
   * Status
   * @default "failed"
   */
  status?: "failed";
  /**
   * Failurehash
   * @pattern ^[0-9a-f]{64}$
   */
  failureHash: string;
}

/**
 * ContextFulfillmentReceipt
 * Acknowledge durable context fulfillment and the single recovery dispatch it created.
 */
export interface ContextFulfillmentReceipt {
  /**
   * Contextrequestid
   * @format uuid
   */
  contextRequestId: string;
  /**
   * Taskid
   * @format uuid
   */
  taskId: string;
  /**
   * Resumed
   * @default true
   */
  resumed?: true;
  /**
   * Dispatchid
   * @format uuid
   */
  dispatchId: string;
}

/**
 * ContextResponse
 * Return only Core-authorized selected lesson details for one pending context request.
 */
export interface ContextResponse {
  /**
   * Schemaversion
   * @default 1
   */
  schemaVersion?: 1;
  /**
   * Contextrequestid
   * @format uuid
   */
  contextRequestId: string;
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /**
   * Requestid
   * @format uuid
   */
  requestId: string;
  /**
   * Taskid
   * @format uuid
   */
  taskId: string;
  /**
   * Taskfence
   * @min 1
   */
  taskFence: number;
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /**
   * Coursebaselinehash
   * @pattern ^[0-9a-f]{64}$
   */
  courseBaselineHash: string;
  /**
   * Chapters
   * @maxItems 100
   * @minItems 1
   */
  chapters: SelectedChapterContext[];
  /**
   * Responsehash
   * @pattern ^[0-9a-f]{64}$
   */
  responseHash: string;
}

/**
 * ContinuationRef
 * Reference an earlier request/proposal without accepting caller-owned context text.
 */
export interface ContinuationRef {
  /** Parentrequestid */
  parentRequestId?: string | null;
  /** Parentproposalid */
  parentProposalId?: string | null;
  /** Parentworkspacerevision */
  parentWorkspaceRevision?: number | null;
}

/**
 * CreateSession
 * Request creation of an authoring session for one course and actor.
 */
export interface CreateSession {
  /**
   * Commandid
   * @format uuid
   */
  commandId: string;
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /**
   * Actorid
   * @minLength 1
   */
  actorId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Context */
  context?: Record<string, JsonValue>;
}

/**
 * DeleteOperation
 * Delete one chapter or lesson selected by operation target and baseline.
 */
export interface DeleteOperation {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /** Type */
  type: "chapter.delete" | "lesson.delete";
}

/**
 * DragOption
 * Place a draggable answer against an optional stable blank identifier.
 */
export interface DragOption {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Label */
  label: string;
  /** Targetblankid */
  targetBlankId: string | null;
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
}

/** EmbeddingsRequest */
export interface EmbeddingsRequest {
  /** Texts */
  texts: string[];
}

/** EmbeddingsResponse */
export interface EmbeddingsResponse {
  /** Embeddings */
  embeddings: number[][];
}

/**
 * Event
 * Represent one ordered, durable authoring event in the session stream.
 */
export interface Event {
  /**
   * Schemaversion
   * @default 1
   */
  schemaVersion?: 1;
  /**
   * Eventid
   * @format uuid
   */
  eventId: string;
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /** Sequence */
  sequence: number;
  /**
   * Occurredat
   * @format date-time
   */
  occurredAt: string;
  /** Type */
  type: string;
  /** Payload */
  payload: Record<string, JsonValue>;
}

/**
 * EventPage
 * Page the durable event stream from a sequence cursor.
 */
export interface EventPage {
  /** Events */
  events: Event[];
  /** Nextsequence */
  nextSequence: number;
  /** Hasmore */
  hasMore: boolean;
}

/**
 * FixedValidity
 * Represent certificate validity through a fixed calendar date.
 */
export interface FixedValidity {
  /**
   * Type
   * @default "fixed_date"
   */
  type?: "fixed_date";
  /**
   * Date
   * @format date
   */
  date: string;
}

/**
 * FrozenExport
 * Freeze proposals, operations, assets, and export hash for one application attempt.
 */
export interface FrozenExport {
  /**
   * Schemaversion
   * @default 1
   */
  schemaVersion?: 1;
  /**
   * Exportid
   * @format uuid
   */
  exportId: string;
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /**
   * Exporthash
   * @pattern ^[0-9a-f]{64}$
   */
  exportHash: string;
  /** Proposalids */
  proposalIds: string[];
  /** Operations */
  operations: (
    | ({
        type: "chapter.create";
      } & ChapterWrite)
    | ({
        type: "chapter.delete";
      } & DeleteOperation)
    | ({
        type: "chapter.reorder";
      } & ReorderOperation)
    | ({
        type: "chapter.update";
      } & ChapterWrite)
    | ({
        type: "course.metadata.update";
      } & MetadataUpdate)
    | ({
        type: "course.settings.update";
      } & SettingsUpdateOutput)
    | ({
        type: "lesson.block.replace";
      } & BlockReplace)
    | ({
        type: "lesson.create";
      } & LessonWriteOutput)
    | ({
        type: "lesson.delete";
      } & DeleteOperation)
    | ({
        type: "lesson.metadata.update";
      } & LessonMetadataUpdate)
    | ({
        type: "lesson.reorder";
      } & ReorderOperation)
    | ({
        type: "lesson.update";
      } & LessonWriteOutput)
  )[];
  /** Assets */
  assets: AssetManifestItem[];
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
}

/** GenerateAiMentorConfigurationRequest */
export interface GenerateAiMentorConfigurationRequest {
  /** Messages */
  messages: PublicAiMessage[];
  /** Temperature */
  temperature?: number | null;
  configurationType: AiMentorConfigurationType;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

export type JsonValue = any;

/** JudgeCriterionResult */
export interface JudgeCriterionResult {
  /**
   * Criterionref
   * @pattern ^C[1-9]\d*$
   */
  criterionRef: string;
  /**
   * Awardedscore
   * @min 0
   */
  awardedScore: number;
  /**
   * Learnersafefeedback
   * @minLength 1
   */
  learnerSafeFeedback: string;
}

/** JudgeResponse */
export interface JudgeResponse {
  /** Criterionresults */
  criterionResults: JudgeCriterionResult[];
  /** Triggeredblockingerrors */
  triggeredBlockingErrors: JudgeTriggeredBlockingError[];
}

/** JudgeTriggeredBlockingError */
export interface JudgeTriggeredBlockingError {
  /**
   * Blockingerrorref
   * @pattern ^B[1-9]\d*$
   */
  blockingErrorRef: string;
  /**
   * Learnersafefeedback
   * @minLength 1
   */
  learnerSafeFeedback: string;
}

/**
 * LessonMetadataPayload
 * Patch lesson text without rewriting lesson configuration, assessment, or resources.
 */
export interface LessonMetadataPayload {
  /**
   * Title
   * @minLength 1
   */
  title?: string;
  /** Description */
  description?: string;
}

/**
 * LessonMetadataUpdate
 * Update only explicitly supplied lesson title or description under its baseline fence.
 */
export interface LessonMetadataUpdate {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /** Type */
  type: "lesson.metadata.update";
  /** Patch lesson text without rewriting lesson configuration, assessment, or resources. */
  payload: LessonMetadataPayload;
}

/**
 * LessonWrite
 * Create or update a lesson while preserving its chapter binding and discriminated lesson payload.
 */
export interface LessonWriteInput {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /** Displayorder */
  displayOrder?: number | null;
  /** Type */
  type: "lesson.create" | "lesson.update";
  /**
   * Chapterid
   * @format uuid
   */
  chapterId: string;
  /** Payload */
  payload:
    | ({
        lessonType: "ai_mentor";
      } & MentorLessonInput)
    | ({
        lessonType: "content";
      } & ContentLesson)
    | ({
        lessonType: "quiz";
      } & QuizLessonInput);
}

/**
 * LessonWrite
 * Create or update a lesson while preserving its chapter binding and discriminated lesson payload.
 */
export interface LessonWriteOutput {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /** Displayorder */
  displayOrder?: number | null;
  /** Type */
  type: "lesson.create" | "lesson.update";
  /**
   * Chapterid
   * @format uuid
   */
  chapterId: string;
  /** Payload */
  payload:
    | ({
        lessonType: "ai_mentor";
      } & MentorLessonOutput)
    | ({
        lessonType: "content";
      } & ContentLesson)
    | ({
        lessonType: "quiz";
      } & QuizLessonOutput);
}

/** MentorChatRequest */
export interface MentorChatRequest {
  /** Messages */
  messages: PublicAiMessage[];
  /** Temperature */
  temperature?: number | null;
  /** Voicesessionid */
  voiceSessionId?: string | null;
}

/** MentorChatResponse */
export interface MentorChatResponse {
  /** Message */
  message: string;
}

/**
 * MentorLesson
 * Carry an AI mentor lesson configuration, source bindings, and optional visual or voice assets.
 */
export interface MentorLessonInput {
  /**
   * Lessontype
   * @default "ai_mentor"
   */
  lessonType?: "ai_mentor";
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Name */
  name: string;
  /** Configurationtype */
  configurationType: "teacher" | "roleplay";
  /** Configuration */
  configuration:
    | AiMentorTeacherConfigurationResponse
    | AiMentorRoleplayConfigurationResponse;
  judgeConfiguration?: AiJudgeConfigurationResponseInput | null;
  /** Sourceversionids */
  sourceVersionIds?: string[];
  /** Avatarassetid */
  avatarAssetId?: string | null;
  /** Voicemode */
  voiceMode?: "preset" | "custom" | null;
  /** Ttspreset */
  ttsPreset?: "male" | "female" | null;
  /** Customttsreference */
  customTtsReference?: string | null;
  /** Preparedresourceids */
  preparedResourceIds?: string[];
}

/**
 * MentorLesson
 * Carry an AI mentor lesson configuration, source bindings, and optional visual or voice assets.
 */
export interface MentorLessonOutput {
  /**
   * Lessontype
   * @default "ai_mentor"
   */
  lessonType?: "ai_mentor";
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Name */
  name: string;
  /** Configurationtype */
  configurationType: "teacher" | "roleplay";
  /** Configuration */
  configuration:
    | AiMentorTeacherConfigurationResponse
    | AiMentorRoleplayConfigurationResponse;
  judgeConfiguration?: AiJudgeConfigurationResponseOutput | null;
  /** Sourceversionids */
  sourceVersionIds?: string[];
  /** Avatarassetid */
  avatarAssetId?: string | null;
  /** Voicemode */
  voiceMode?: "preset" | "custom" | null;
  /** Ttspreset */
  ttsPreset?: "male" | "female" | null;
  /** Customttsreference */
  customTtsReference?: string | null;
  /** Preparedresourceids */
  preparedResourceIds?: string[];
}

/**
 * MetadataPayload
 * Carry the optional course metadata fields that a metadata patch may change.
 */
export interface MetadataPayload {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Learningoutcomes */
  learningOutcomes?: string[] | null;
  /** Thumbnailassetid */
  thumbnailAssetId?: string | null;
}

/**
 * MetadataUpdate
 * Patch course metadata under the operation baseline fence.
 */
export interface MetadataUpdate {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /**
   * Type
   * @default "course.metadata.update"
   */
  type?: "course.metadata.update";
  /** Carry the optional course metadata fields that a metadata patch may change. */
  payload: MetadataPayload;
}

/**
 * OpenTextSettings
 * Constrain and guide manually reviewed free-text answers.
 */
export interface OpenTextSettings {
  /** Minimumcharacters */
  minimumCharacters?: number | null;
  /** Maximumcharacters */
  maximumCharacters?: number | null;
  /** Reviewerinstructions */
  reviewerInstructions?: string | null;
}

/**
 * OutlineChapter
 * Describe an exact-outline chapter and its ordered lesson skeleton.
 */
export interface OutlineChapter {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Title
   * @minLength 1
   */
  title: string;
  /** Lessons */
  lessons: OutlineLesson[];
}

/**
 * OutlineLesson
 * Describe an exact-outline lesson, objectives, source bindings, and required sections.
 */
export interface OutlineLesson {
  /** Sourceversionids */
  sourceVersionIds?: string[] | null;
  /** Requiredsectionids */
  requiredSectionIds?: string[];
  /** Coveragenotes */
  coverageNotes?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Title
   * @minLength 1
   */
  title: string;
  /** Lessontype */
  lessonType: "content" | "quiz" | "ai_mentor";
  /** Objectives */
  objectives?: string[];
}

/**
 * PeriodValidity
 * Represent certificate validity as a positive duration.
 */
export interface PeriodValidity {
  /**
   * Type
   * @default "period"
   */
  type?: "period";
  /**
   * Value
   * @min 1
   */
  value: number;
  /** Unit */
  unit: "days" | "months" | "years";
}

/**
 * PrepareExport
 * Select proposals and optional asset omissions before creating a frozen export.
 */
export interface PrepareExport {
  /**
   * Commandid
   * @format uuid
   */
  commandId: string;
  /** Actorid */
  actorId: string;
  /**
   * Proposalids
   * @minItems 1
   */
  proposalIds: string[];
  /** Omitoptionalassetids */
  omitOptionalAssetIds?: string[];
}

/**
 * ProposalRegeneration
 * Carry feedback for one exact proposal revision in an atomic regeneration batch.
 */
export interface ProposalRegeneration {
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /**
   * Expectedrevision
   * @min 1
   */
  expectedRevision: number;
  /**
   * Feedback
   * @minLength 1
   * @maxLength 2000
   */
  feedback: string;
}

/**
 * ProposalReviewDecision
 * Accept or reject one exact proposal revision within an atomic review command.
 */
export interface ProposalReviewDecision {
  /**
   * Proposalid
   * @format uuid
   */
  proposalId: string;
  /**
   * Expectedrevision
   * @min 1
   */
  expectedRevision: number;
  /** Accepted */
  accepted: boolean;
  /**
   * Acceptqualityconcerns
   * @default false
   */
  acceptQualityConcerns?: boolean;
}

/** PublicAiMessage */
export interface PublicAiMessage {
  /** Role */
  role: "system" | "user" | "assistant";
  /** Content */
  content: string;
}

/** PublicConfigurationResponse */
export interface PublicConfigurationResponse {
  /** Coursegeneration */
  courseGeneration: boolean;
  /** Voicementor */
  voiceMentor: boolean;
  /** Enabled */
  enabled: boolean;
  /** Capabilities */
  capabilities: Record<AiCapability, AiCapabilityStatus>;
}

/**
 * QuestionBlank
 * Describe a fill-in blank and how its answer sets are compared.
 */
export interface QuestionBlank {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Textcomparisonmode */
  textComparisonMode: "exact" | "normalized";
  /**
   * Answersets
   * @minItems 1
   */
  answerSets: BlankAnswerSet[];
}

/**
 * QuizLesson
 * Carry quiz settings and an ordered, validated collection of assessment questions.
 */
export interface QuizLessonInput {
  /**
   * Lessontype
   * @default "quiz"
   */
  lessonType?: "quiz";
  /** Title */
  title: string;
  /**
   * Description
   * @default ""
   */
  description?: string;
  /**
   * Thresholdscore
   * @min 0
   * @max 100
   */
  thresholdScore: number;
  /** Attemptslimit */
  attemptsLimit?: number | null;
  /** Quizcooldowninhours */
  quizCooldownInHours?: number | null;
  /**
   * Questions
   * @minItems 1
   */
  questions: AssessmentQuestionInput[];
}

/**
 * QuizLesson
 * Carry quiz settings and an ordered, validated collection of assessment questions.
 */
export interface QuizLessonOutput {
  /**
   * Lessontype
   * @default "quiz"
   */
  lessonType?: "quiz";
  /** Title */
  title: string;
  /**
   * Description
   * @default ""
   */
  description?: string;
  /**
   * Thresholdscore
   * @min 0
   * @max 100
   */
  thresholdScore: number;
  /** Attemptslimit */
  attemptsLimit?: number | null;
  /** Quizcooldowninhours */
  quizCooldownInHours?: number | null;
  /**
   * Questions
   * @minItems 1
   */
  questions: AssessmentQuestionOutput[];
}

/**
 * ReorderOperation
 * Replace chapter or lesson ordering under the operation baseline fence.
 */
export interface ReorderOperation {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /** Type */
  type: "chapter.reorder" | "lesson.reorder";
  /** Carry the complete ordered list of chapter or lesson IDs. */
  payload: ReorderPayload;
}

/**
 * ReorderPayload
 * Carry the complete ordered list of chapter or lesson IDs.
 */
export interface ReorderPayload {
  /** Orderedids */
  orderedIds: string[];
}

/**
 * ScaleOption
 * Represent one ordered five-point scale value and its label.
 */
export interface ScaleOption {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
  /**
   * Scalevalue
   * @min 1
   * @max 5
   */
  scaleValue: number;
  /** Label */
  label: string;
}

/**
 * SelectedChapterContext
 * Carry a selected lesson's parent chapter identity and current chapter baseline.
 */
export interface SelectedChapterContext {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Title */
  title: string;
  /** Displayorder */
  displayOrder: number | null;
  /**
   * Baselinehash
   * @pattern ^[0-9a-f]{64}$
   */
  baselineHash: string;
  /**
   * Deletionbaselinehash
   * @pattern ^[0-9a-f]{64}$
   */
  deletionBaselineHash: string;
  /**
   * Lessons
   * @maxItems 100
   * @minItems 1
   */
  lessons: SelectedLessonContext[];
}

/**
 * SelectedLessonContext
 * Carry one selected lesson's current typed baseline and optional authoring detail.
 */
export interface SelectedLessonContext {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Title */
  title: string;
  /** Lessontype */
  lessonType: string;
  /**
   * Assessmentattemptcount
   * @min 0
   */
  assessmentAttemptCount: number;
  /** Displayorder */
  displayOrder: number | null;
  /**
   * Baselinehash
   * @pattern ^[0-9a-f]{64}$
   */
  baselineHash: string;
  /** Description */
  description?: string | null;
  /** Quiz */
  quiz?: Record<string, JsonValue> | null;
  /** Mentorconfiguration */
  mentorConfiguration?: Record<string, JsonValue> | null;
  /** Judgeconfiguration */
  judgeConfiguration?: Record<string, JsonValue> | null;
  /** Blocks */
  blocks?: Record<string, JsonValue>[] | null;
}

/**
 * SessionSnapshot
 * Return an authorized high-water session projection with tasks and records.
 */
export interface SessionSnapshot {
  /**
   * Reasoningcontrolavailable
   * @default false
   */
  reasoningControlAvailable?: boolean;
  applicationDelta?: ApplicationDeltaProof;
  /**
   * Schemaversion
   * @default 1
   */
  schemaVersion?: 1;
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Status */
  status: "active" | "paused" | "stopped" | "discarded";
  /** Snapshotsequence */
  snapshotSequence: number;
  /** Workspacerevision */
  workspaceRevision: number;
  /** Tasks */
  tasks: TaskSummary[];
  /** Records */
  records: WorkspaceRecord[];
  /** Turns */
  turns?: AuthoringTurn[];
  /**
   * Hasmoreturns
   * @default false
   */
  hasMoreTurns?: boolean;
  /** Nextbeforerequestid */
  nextBeforeRequestId?: string | null;
}

/**
 * SessionSummary
 * Describe one lightweight session row for a course's thread browser.
 */
export interface SessionSummary {
  /**
   * Sessionid
   * @format uuid
   */
  sessionId: string;
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Status */
  status: "active" | "paused" | "stopped" | "discarded";
  /**
   * Title
   * @minLength 1
   * @maxLength 96
   */
  title: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Lastactivityat
   * @format date-time
   */
  lastActivityAt: string;
}

/**
 * SessionSummaryPage
 * Describe one server-filtered, offset-paginated page of a course's thread browser.
 */
export interface SessionSummaryPage {
  /** Sessions */
  sessions: SessionSummary[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Perpage */
  perPage: number;
  /** Hasmore */
  hasMore: boolean;
}

/**
 * SettingsPayload
 * Carry a non-empty course settings patch while preserving omitted fields.
 */
export interface SettingsPayload {
  /** Lessonsequenceenabled */
  lessonSequenceEnabled?: boolean | null;
  /** Quizfeedbackenabled */
  quizFeedbackEnabled?: boolean | null;
  /** Videocompletiontrackingenabled */
  videoCompletionTrackingEnabled?: boolean | null;
  /** Certificatefontcolor */
  certificateFontColor?: string | null;
  /** Certificatevalidity */
  certificateValidity?:
    | (
        | ({
            type: "fixed_date";
          } & FixedValidity)
        | ({
            type: "period";
          } & PeriodValidity)
      )
    | null;
  /** Applyvaliditytoexistingcertificates */
  applyValidityToExistingCertificates?: boolean | null;
  /** Removecertificatesignature */
  removeCertificateSignature?: boolean | null;
  /** Certificatesignatureassetid */
  certificateSignatureAssetId?: string | null;
}

/**
 * SettingsUpdate
 * Patch course settings under the operation baseline fence.
 */
export interface SettingsUpdateInput {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /**
   * Type
   * @default "course.settings.update"
   */
  type?: "course.settings.update";
  /** Carry a non-empty course settings patch while preserving omitted fields. */
  payload: SettingsPayload;
}

/**
 * SettingsUpdate
 * Patch course settings under the operation baseline fence.
 */
export interface SettingsUpdateOutput {
  /**
   * Operationid
   * @format uuid
   */
  operationId: string;
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Dependencies */
  dependencies?: string[];
  /** Fieldbaselines */
  fieldBaselines?: Record<string, string>;
  /**
   * Type
   * @default "course.settings.update"
   */
  type?: "course.settings.update";
  /** Carry a non-empty course settings patch while preserving omitted fields. */
  payload: SettingsPayload;
}

/**
 * SourcePolicy
 * Allowlist source versions and explicitly enabled web, general-knowledge, and research-depth permissions.
 */
export interface SourcePolicy {
  /** Sourceversionids */
  sourceVersionIds?: string[];
  /**
   * Webenabled
   * @default false
   */
  webEnabled?: boolean;
  /**
   * Generalknowledgeenabled
   * @default false
   */
  generalKnowledgeEnabled?: boolean;
  /**
   * Researchdepth
   * @default "standard"
   */
  researchDepth?: "standard" | "deep";
  /** Requiredsectionids */
  requiredSectionIds?: string[];
  /** Excludedsectionids */
  excludedSectionIds?: string[];
}

/**
 * SourceUploadReceipt
 * Return the immutable uploaded source version and its queued ingestion task.
 */
export interface SourceUploadReceipt {
  /**
   * Sourceversionid
   * @format uuid
   */
  sourceVersionId: string;
  /**
   * Taskid
   * @format uuid
   */
  taskId: string;
  /**
   * Status
   * @default "queued"
   */
  status?: "queued";
  /**
   * Checksum
   * @pattern ^[0-9a-f]{64}$
   */
  checksum: string;
}

/** StructuredGenerationRequest */
export interface StructuredGenerationRequest {
  /** Messages */
  messages: PublicAiMessage[];
  /** Temperature */
  temperature?: number | null;
}

/**
 * TargetRef
 * Identify the course entity and fields, blocks, or quiz questions that a targeted edit may touch.
 */
export interface TargetRef {
  /**
   * Targetid
   * @format uuid
   */
  targetId: string;
  /** Kind */
  kind: "course" | "chapter" | "lesson" | "block" | "question";
  /** Language */
  language: "en" | "pl" | "de" | "lt" | "cs" | "es" | "fr";
  /** Baselinehash */
  baselineHash?: string | null;
  /** Blockids */
  blockIds?: string[];
  /** Questionids */
  questionIds?: string[];
  /** Allowedfields */
  allowedFields?: string[];
}

/**
 * TaskFailure
 * Describe a recovery action without exposing provider or source contents.
 */
export interface TaskFailure {
  /** Code */
  code: string;
  /** Category */
  category:
    | "generation"
    | "evidence"
    | "author_decision"
    | "provider"
    | "configuration"
    | "internal";
  /** Stage */
  stage: string;
  /** Recoveryaction */
  recoveryAction:
    | "retry_failed_parts"
    | "answer_question"
    | "retry_provider"
    | "service_fix";
  /** Retryable */
  retryable: boolean;
  /** Affectedchapterids */
  affectedChapterIds?: string[];
  /** Affectedlessonids */
  affectedLessonIds?: string[];
  /** Correlationid */
  correlationId?: string | null;
  /** Detailkey */
  detailKey?: string | null;
  /**
   * Generationrevision
   * @min 0
   * @default 0
   */
  generationRevision?: number;
}

/**
 * TaskSummary
 * Expose the durable lifecycle and output reference of one authoring task.
 */
export interface TaskSummary {
  /**
   * Taskid
   * @format uuid
   */
  taskId: string;
  /**
   * Requestid
   * @format uuid
   */
  requestId: string;
  kind?: TaskKind | null;
  /** Status */
  status:
    | "queued"
    | "running"
    | "waiting_author"
    | "waiting_dependencies"
    | "paused"
    | "succeeded"
    | "failed"
    | "superseded"
    | "stopped";
  /** Errorcode */
  errorCode?: string | null;
  /** Outputid */
  outputId?: string | null;
  failure?: TaskFailure | null;
}

/** TranscriptionResponse */
export interface TranscriptionResponse {
  /** Text */
  text: string;
}

/** TranslationResponse */
export interface TranslationResponse {
  /** Translations */
  translations: string[];
}

/**
 * TrueFalseStatement
 * Represent one ordered true-or-false statement and its expected value.
 */
export interface TrueFalseStatement {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Displayorder
   * @min 0
   */
  displayOrder: number;
  /** Correctvalue */
  correctValue: boolean;
  /** Statement */
  statement: string;
}

/**
 * TurnArtifactRef
 * Reference an existing review artifact or author question from a turn part.
 */
export interface TurnArtifactRef {
  /** Artifactkind */
  artifactKind: "proposal" | "question";
  /** Artifactid */
  artifactId: string;
}

/**
 * TurnHistoryPage
 * Return one older conversation page with the records needed to render its artifacts.
 */
export interface TurnHistoryPage {
  /**
   * Courseid
   * @format uuid
   */
  courseId: string;
  /** Turns */
  turns: AuthoringTurn[];
  /** Records */
  records: WorkspaceRecord[];
  /** Hasmore */
  hasMore: boolean;
  /** Nextbeforerequestid */
  nextBeforeRequestId?: string | null;
}

/**
 * TurnPart
 * Represent one ordered, replayable text, tool, proposal, or question part.
 */
export interface TurnPart {
  /**
   * Requestid
   * @format uuid
   */
  requestId: string;
  /** Messageid */
  messageId: string;
  /** Partid */
  partId: string;
  /** Identify a user-visible part of one authoring assistant response. */
  partKind: TurnPartKind;
  /** Taskid */
  taskId?: string | null;
  /** Describe the lifecycle of one stable assistant response part. */
  status: TurnPartStatus;
  /**
   * Firstsequence
   * @min 1
   */
  firstSequence: number;
  /**
   * Updatedsequence
   * @min 1
   */
  updatedSequence: number;
  /** Text */
  text?: string | null;
  /**
   * Plansteps
   * @maxItems 6
   */
  planSteps?: string[];
  /** Answer */
  answer?: string | null;
  tool?: TurnTool | null;
  artifact?: TurnArtifactRef | null;
}

/**
 * TurnTool
 * Describe one stable tool invocation displayed inside an assistant turn.
 */
export interface TurnTool {
  /** Toolcallid */
  toolCallId: string;
  /** Toolname */
  toolName: string;
  /** Display */
  display: string;
  /** Status */
  status: "started" | "completed" | "failed" | "stopped";
  result?: TurnToolResult | null;
}

/**
 * TurnToolResult
 * Expose bounded counts from a completed tool without forwarding raw provider output.
 */
export interface TurnToolResult {
  /** Sourcecount */
  sourceCount?: number | null;
  /** Findingcount */
  findingCount?: number | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
  /** Input */
  input?: any;
  /** Context */
  ctx?: object;
}

/**
 * WorkspaceRecord
 * Expose one immutable workspace projection record by kind and payload.
 */
export interface WorkspaceRecord {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Kind */
  kind: string;
  /** Payload */
  payload: Record<string, JsonValue>;
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

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

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
  JsonApi = "application/vnd.api+json",
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
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
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
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
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
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
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

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Luma API
 * @version 0.1.0
 */
export class API<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Returns whether required API-key-scoped provider secrets are configured for course generation and voice mentor. Authorization header required: `X-API-Key: <luma_api_key>`.
     *
     * @tags Public - Require API Key
     * @name GetConfigurationStatusApiPublicV1AiConfigurationGet
     * @summary Get Public API Configuration Status
     * @request GET:/api/public/v1/ai/configuration
     * @secure
     */
    getConfigurationStatusApiPublicV1AiConfigurationGet: (
      params: RequestParams = {},
    ) =>
      this.request<PublicConfigurationResponse, void>({
        path: `/api/public/v1/ai/configuration`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public - Require API Key
     * @name MentorChatApiPublicV1AiMentorChatPost
     * @summary Stream Mentor Chat With Custom Runtime
     * @request POST:/api/public/v1/ai/mentor/chat
     * @secure
     */
    mentorChatApiPublicV1AiMentorChatPost: (
      data: MentorChatRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, void | HTTPValidationError>({
        path: `/api/public/v1/ai/mentor/chat`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public - Require API Key
     * @name GenerateMentorChatApiPublicV1AiMentorChatGeneratePost
     * @summary Generate Mentor Chat Message With Custom Runtime
     * @request POST:/api/public/v1/ai/mentor/chat/generate
     * @secure
     */
    generateMentorChatApiPublicV1AiMentorChatGeneratePost: (
      data: MentorChatRequest,
      params: RequestParams = {},
    ) =>
      this.request<MentorChatResponse, void | HTTPValidationError>({
        path: `/api/public/v1/ai/mentor/chat/generate`,
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
     * @tags Public - Require API Key
     * @name MentorJudgeApiPublicV1AiMentorJudgePost
     * @summary Run AI Mentor Judge With Custom Runtime
     * @request POST:/api/public/v1/ai/mentor/judge
     * @secure
     */
    mentorJudgeApiPublicV1AiMentorJudgePost: (
      data: StructuredGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<JudgeResponse, void | HTTPValidationError>({
        path: `/api/public/v1/ai/mentor/judge`,
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
     * @tags Public - Require API Key
     * @name GenerateMentorConfigurationApiPublicV1AiMentorConfigurationGeneratePost
     * @summary Generate AI Mentor Configuration With Custom Runtime
     * @request POST:/api/public/v1/ai/mentor-configuration/generate
     * @secure
     */
    generateMentorConfigurationApiPublicV1AiMentorConfigurationGeneratePost: (
      data: GenerateAiMentorConfigurationRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        | AiMentorTeacherConfigurationResponse
        | AiMentorRoleplayConfigurationResponse,
        void | HTTPValidationError
      >({
        path: `/api/public/v1/ai/mentor-configuration/generate`,
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
     * @tags Public - Require API Key
     * @name ValidateMentorConfigurationApiPublicV1AiMentorConfigurationValidatePost
     * @summary Validate AI Mentor Configuration With Custom Runtime
     * @request POST:/api/public/v1/ai/mentor-configuration/validate
     * @secure
     */
    validateMentorConfigurationApiPublicV1AiMentorConfigurationValidatePost: (
      data: StructuredGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        AiMentorConfigurationValidationResponse,
        void | HTTPValidationError
      >({
        path: `/api/public/v1/ai/mentor-configuration/validate`,
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
     * @tags Public - Require API Key
     * @name GenerateJudgeConfigurationApiPublicV1AiJudgeConfigurationGeneratePost
     * @summary Generate AI Judge Configuration With Custom Runtime
     * @request POST:/api/public/v1/ai/judge-configuration/generate
     * @secure
     */
    generateJudgeConfigurationApiPublicV1AiJudgeConfigurationGeneratePost: (
      data: StructuredGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        AiJudgeConfigurationResponseOutput,
        void | HTTPValidationError
      >({
        path: `/api/public/v1/ai/judge-configuration/generate`,
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
     * @tags Public - Require API Key
     * @name ValidateJudgeConfigurationApiPublicV1AiJudgeConfigurationValidatePost
     * @summary Validate AI Judge Configuration With Custom Runtime
     * @request POST:/api/public/v1/ai/judge-configuration/validate
     * @secure
     */
    validateJudgeConfigurationApiPublicV1AiJudgeConfigurationValidatePost: (
      data: StructuredGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        AiJudgeConfigurationValidationResponse,
        void | HTTPValidationError
      >({
        path: `/api/public/v1/ai/judge-configuration/validate`,
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
     * @tags Public - Require API Key
     * @name GenerateTranslationsApiPublicV1AiTranslationsGeneratePost
     * @summary Generate Translations With Custom Runtime
     * @request POST:/api/public/v1/ai/translations/generate
     * @secure
     */
    generateTranslationsApiPublicV1AiTranslationsGeneratePost: (
      data: StructuredGenerationRequest,
      params: RequestParams = {},
    ) =>
      this.request<TranslationResponse, void | HTTPValidationError>({
        path: `/api/public/v1/ai/translations/generate`,
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
     * @tags Public - Require API Key
     * @name CreateEmbeddingsApiPublicV1AiEmbeddingsPost
     * @summary Create Embeddings With Custom Runtime
     * @request POST:/api/public/v1/ai/embeddings
     * @secure
     */
    createEmbeddingsApiPublicV1AiEmbeddingsPost: (
      data: EmbeddingsRequest,
      params: RequestParams = {},
    ) =>
      this.request<EmbeddingsResponse, void | HTTPValidationError>({
        path: `/api/public/v1/ai/embeddings`,
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
     * @tags Public - Require API Key
     * @name TranscribeDictationApiPublicV1AiTranscriptionsPost
     * @summary Transcribe Dictation Audio With Custom Runtime
     * @request POST:/api/public/v1/ai/transcriptions
     * @secure
     */
    transcribeDictationApiPublicV1AiTranscriptionsPost: (
      data: BodyTranscribeDictationApiPublicV1AiTranscriptionsPost,
      params: RequestParams = {},
    ) =>
      this.request<TranscriptionResponse, void | HTTPValidationError>({
        path: `/api/public/v1/ai/transcriptions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Open or restore the organization-scoped course authoring session.
     *
     * @tags Public - Require API Key
     * @name CreateSessionApiPublicV1AuthoringSessionsPost
     * @summary Create Session
     * @request POST:/api/public/v1/authoring/sessions
     * @secure
     */
    createSessionApiPublicV1AuthoringSessionsPost: (
      data: CreateSession,
      params: RequestParams = {},
    ) =>
      this.request<SessionSnapshot, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List one server-filtered, offset-paginated page of durable course conversations in stable latest-activity order.
     *
     * @tags Public - Require API Key
     * @name ListSessionsApiPublicV1AuthoringSessionsGet
     * @summary List Sessions
     * @request GET:/api/public/v1/authoring/sessions
     * @secure
     */
    listSessionsApiPublicV1AuthoringSessionsGet: (
      query: {
        /**
         * Course Id
         * @format uuid
         */
        course_id: string;
        /** Keyword */
        keyword?: string | null;
        /**
         * Page
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Perpage
         * @min 1
         * @max 100
         * @default 20
         */
        perPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SessionSummaryPage, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the authorized durable workspace snapshot, including task state.
     *
     * @tags Public - Require API Key
     * @name GetSessionApiPublicV1AuthoringSessionsSessionIdGet
     * @summary Get Session
     * @request GET:/api/public/v1/authoring/sessions/{session_id}
     * @secure
     */
    getSessionApiPublicV1AuthoringSessionsSessionIdGet: (
      sessionId: string,
      params: RequestParams = {},
    ) =>
      this.request<SessionSnapshot, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Page older saved turns and their review artifacts by a stable request cursor.
     *
     * @tags Public - Require API Key
     * @name GetOlderTurnsApiPublicV1AuthoringSessionsSessionIdTurnsGet
     * @summary Get Older Turns
     * @request GET:/api/public/v1/authoring/sessions/{session_id}/turns
     * @secure
     */
    getOlderTurnsApiPublicV1AuthoringSessionsSessionIdTurnsGet: (
      sessionId: string,
      query: {
        /**
         * Beforerequestid
         * @format uuid
         */
        beforeRequestId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<TurnHistoryPage, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/turns`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Read an ordered page after the supplied durable cursor for client replay.
     *
     * @tags Public - Require API Key
     * @name GetEventsApiPublicV1AuthoringSessionsSessionIdEventsGet
     * @summary Get Events
     * @request GET:/api/public/v1/authoring/sessions/{session_id}/events
     * @secure
     */
    getEventsApiPublicV1AuthoringSessionsSessionIdEventsGet: (
      sessionId: string,
      query?: {
        /**
         * Aftersequence
         * @min 0
         * @default 0
         */
        afterSequence?: number;
        /**
         * Limit
         * @min 1
         * @max 500
         * @default 100
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<EventPage, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/events`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Accept an idempotent authoring command and return its durable acknowledgement.
     *
     * @tags Public - Require API Key
     * @name CommandApiPublicV1AuthoringSessionsSessionIdCommandsPost
     * @summary Command
     * @request POST:/api/public/v1/authoring/sessions/{session_id}/commands
     * @secure
     */
    commandApiPublicV1AuthoringSessionsSessionIdCommandsPost: (
      sessionId: string,
      data: AuthoringCommand,
      params: RequestParams = {},
    ) =>
      this.request<CommandReceipt, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/commands`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Accept one organization-scoped selected-detail callback and resume its fenced task.
     *
     * @tags Public - Require API Key
     * @name FulfillContextApiPublicV1AuthoringSessionsSessionIdContextRequestsContextRequestIdFulfillmentPost
     * @summary Fulfill Context
     * @request POST:/api/public/v1/authoring/sessions/{session_id}/context-requests/{context_request_id}/fulfillment
     * @secure
     */
    fulfillContextApiPublicV1AuthoringSessionsSessionIdContextRequestsContextRequestIdFulfillmentPost:
      (
        sessionId: string,
        contextRequestId: string,
        data: ContextResponse,
        params: RequestParams = {},
      ) =>
        this.request<ContextFulfillmentReceipt, HTTPValidationError>({
          path: `/api/public/v1/authoring/sessions/${sessionId}/context-requests/${contextRequestId}/fulfillment`,
          method: "POST",
          body: data,
          secure: true,
          type: ContentType.Json,
          format: "json",
          ...params,
        }),

    /**
     * @description Record one bounded Core-side context failure and terminate only its waiting task.
     *
     * @tags Public - Require API Key
     * @name FailContextApiPublicV1AuthoringSessionsSessionIdContextRequestsContextRequestIdFailurePost
     * @summary Fail Context
     * @request POST:/api/public/v1/authoring/sessions/{session_id}/context-requests/{context_request_id}/failure
     * @secure
     */
    failContextApiPublicV1AuthoringSessionsSessionIdContextRequestsContextRequestIdFailurePost:
      (
        sessionId: string,
        contextRequestId: string,
        data: ContextFailure,
        params: RequestParams = {},
      ) =>
        this.request<ContextFailureReceipt, HTTPValidationError>({
          path: `/api/public/v1/authoring/sessions/${sessionId}/context-requests/${contextRequestId}/failure`,
          method: "POST",
          body: data,
          secure: true,
          type: ContentType.Json,
          format: "json",
          ...params,
        }),

    /**
     * @description Freeze a validated selection of reviewed proposals for Core application. This does not write course content to Core.
     *
     * @tags Public - Require API Key
     * @name PrepareExportApiPublicV1AuthoringSessionsSessionIdExportsPost
     * @summary Prepare Export
     * @request POST:/api/public/v1/authoring/sessions/{session_id}/exports
     * @secure
     */
    prepareExportApiPublicV1AuthoringSessionsSessionIdExportsPost: (
      sessionId: string,
      data: PrepareExport,
      params: RequestParams = {},
    ) =>
      this.request<FrozenExport, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/exports`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Read the immutable application bundle previously frozen for this session.
     *
     * @tags Public - Require API Key
     * @name GetExportApiPublicV1AuthoringSessionsSessionIdExportsExportIdGet
     * @summary Get Export
     * @request GET:/api/public/v1/authoring/sessions/{session_id}/exports/{export_id}
     * @secure
     */
    getExportApiPublicV1AuthoringSessionsSessionIdExportsExportIdGet: (
      sessionId: string,
      exportId: string,
      params: RequestParams = {},
    ) =>
      this.request<FrozenExport, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/exports/${exportId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Record Core application feedback against the corresponding frozen export.
     *
     * @tags Public - Require API Key
     * @name ReceiptApiPublicV1AuthoringSessionsSessionIdReceiptsPost
     * @summary Receipt
     * @request POST:/api/public/v1/authoring/sessions/{session_id}/receipts
     * @secure
     */
    receiptApiPublicV1AuthoringSessionsSessionIdReceiptsPost: (
      sessionId: string,
      data: ApplicationReceipt,
      params: RequestParams = {},
    ) =>
      this.request<ApplicationReceipt, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/receipts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Stream durable events after authorization, using Redis only as a wake-up hint. The generator rechecks integration access and reads SQL to recover missed notifications. Closing this response does not cancel authoring tasks.
     *
     * @tags Public - Require API Key
     * @name SubscribeEventsApiPublicV1AuthoringSessionsSessionIdEventsStreamGet
     * @summary Subscribe Events
     * @request GET:/api/public/v1/authoring/sessions/{session_id}/events/stream
     * @secure
     */
    subscribeEventsApiPublicV1AuthoringSessionsSessionIdEventsStreamGet: (
      sessionId: string,
      query?: {
        /**
         * Aftersequence
         * @min 0
         * @default 0
         */
        afterSequence?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<string, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/events/stream`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Store an authorized upload and enqueue source processing under its command identity.
     *
     * @tags Public - Require API Key
     * @name UploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost
     * @summary Upload Source
     * @request POST:/api/public/v1/authoring/sessions/{session_id}/sources
     * @secure
     */
    uploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost: (
      sessionId: string,
      data: BodyUploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost,
      params: RequestParams = {},
    ) =>
      this.request<SourceUploadReceipt, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/sources`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Return an authorized asset revision with private, non-cacheable response headers.
     *
     * @tags Public - Require API Key
     * @name DownloadAssetApiPublicV1AuthoringSessionsSessionIdAssetsAssetIdGet
     * @summary Download Asset
     * @request GET:/api/public/v1/authoring/sessions/{session_id}/assets/{asset_id}
     * @secure
     */
    downloadAssetApiPublicV1AuthoringSessionsSessionIdAssetsAssetIdGet: (
      sessionId: string,
      assetId: string,
      query?: {
        /**
         * Revision
         * @min 1
         * @default 1
         */
        revision?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<File, HTTPValidationError>({
        path: `/api/public/v1/authoring/sessions/${sessionId}/assets/${assetId}`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public - Require Admin API Key
     * @name ListOrganizationApiKeysApiPublicV1AdminOrganizationsOrganizationIdApiKeysGet
     * @summary List Organization Api Keys
     * @request GET:/api/public/v1/admin/organizations/{organization_id}/api-keys
     * @secure
     */
    listOrganizationApiKeysApiPublicV1AdminOrganizationsOrganizationIdApiKeysGet:
      (organizationId: string, params: RequestParams = {}) =>
        this.request<ApiKeyResponse[], HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys`,
          method: "GET",
          secure: true,
          format: "json",
          ...params,
        }),

    /**
     * No description
     *
     * @tags Public - Require Admin API Key
     * @name CreateOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysPost
     * @summary Create Organization Api Key
     * @request POST:/api/public/v1/admin/organizations/{organization_id}/api-keys
     * @secure
     */
    createOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysPost:
      (
        organizationId: string,
        data: ApiKeyCreateRequest,
        params: RequestParams = {},
      ) =>
        this.request<ApiKeyCreateResponse, HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys`,
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
     * @tags Public - Require Admin API Key
     * @name GetOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdGet
     * @summary Get Organization Api Key
     * @request GET:/api/public/v1/admin/organizations/{organization_id}/api-keys/{api_key_id}
     * @secure
     */
    getOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdGet:
      (organizationId: string, apiKeyId: string, params: RequestParams = {}) =>
        this.request<ApiKeyResponse, HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys/${apiKeyId}`,
          method: "GET",
          secure: true,
          format: "json",
          ...params,
        }),

    /**
     * No description
     *
     * @tags Public - Require Admin API Key
     * @name UpdateOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdPatch
     * @summary Update Organization Api Key
     * @request PATCH:/api/public/v1/admin/organizations/{organization_id}/api-keys/{api_key_id}
     * @secure
     */
    updateOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdPatch:
      (
        organizationId: string,
        apiKeyId: string,
        data: ApiKeyUpdateRequest,
        params: RequestParams = {},
      ) =>
        this.request<ApiKeyResponse, HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys/${apiKeyId}`,
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
     * @tags Public - Require Admin API Key
     * @name RevokeOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdDelete
     * @summary Revoke Organization Api Key
     * @request DELETE:/api/public/v1/admin/organizations/{organization_id}/api-keys/{api_key_id}
     * @secure
     */
    revokeOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdDelete:
      (organizationId: string, apiKeyId: string, params: RequestParams = {}) =>
        this.request<Record<string, string>, HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys/${apiKeyId}`,
          method: "DELETE",
          secure: true,
          format: "json",
          ...params,
        }),

    /**
     * No description
     *
     * @tags Public - Require Admin API Key
     * @name GetOrganizationApiKeyConfigurationApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdConfigurationGet
     * @summary Get Organization Api Key Configuration
     * @request GET:/api/public/v1/admin/organizations/{organization_id}/api-keys/{api_key_id}/configuration
     * @secure
     */
    getOrganizationApiKeyConfigurationApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdConfigurationGet:
      (organizationId: string, apiKeyId: string, params: RequestParams = {}) =>
        this.request<PublicConfigurationResponse, HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys/${apiKeyId}/configuration`,
          method: "GET",
          secure: true,
          format: "json",
          ...params,
        }),

    /**
     * No description
     *
     * @tags Public - Require Admin API Key
     * @name ListOrganizationApiKeyAssignmentsApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdAiModelAssignmentsGet
     * @summary List Organization Api Key Assignments
     * @request GET:/api/public/v1/admin/organizations/{organization_id}/api-keys/{api_key_id}/ai-model-assignments
     * @secure
     */
    listOrganizationApiKeyAssignmentsApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdAiModelAssignmentsGet:
      (organizationId: string, apiKeyId: string, params: RequestParams = {}) =>
        this.request<AiModelAssignmentResponse[], HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys/${apiKeyId}/ai-model-assignments`,
          method: "GET",
          secure: true,
          format: "json",
          ...params,
        }),

    /**
     * No description
     *
     * @tags Public - Require Admin API Key
     * @name UpdateOrganizationApiKeyAssignmentApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdAiModelAssignmentsDomainPatch
     * @summary Update Organization Api Key Assignment
     * @request PATCH:/api/public/v1/admin/organizations/{organization_id}/api-keys/{api_key_id}/ai-model-assignments/{domain}
     * @secure
     */
    updateOrganizationApiKeyAssignmentApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdAiModelAssignmentsDomainPatch:
      (
        organizationId: string,
        apiKeyId: string,
        domain: AiModelDomain,
        data: AiModelAssignmentUpdateRequest,
        params: RequestParams = {},
      ) =>
        this.request<AiModelAssignmentResponse, HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/api-keys/${apiKeyId}/ai-model-assignments/${domain}`,
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
     * @tags Public - Require Admin API Key
     * @name ListOrganizationAiModelProfilesApiPublicV1AdminOrganizationsOrganizationIdAiModelProfilesGet
     * @summary List Organization Ai Model Profiles
     * @request GET:/api/public/v1/admin/organizations/{organization_id}/ai-model-profiles
     * @secure
     */
    listOrganizationAiModelProfilesApiPublicV1AdminOrganizationsOrganizationIdAiModelProfilesGet:
      (organizationId: string, params: RequestParams = {}) =>
        this.request<AiModelProfileResponse[], HTTPValidationError>({
          path: `/api/public/v1/admin/organizations/${organizationId}/ai-model-profiles`,
          method: "GET",
          secure: true,
          format: "json",
          ...params,
        }),
  };
}
