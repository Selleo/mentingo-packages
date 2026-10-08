import {
  AiCapability,
  AiCapabilityMode,
  AiCapabilityProvider,
  ReasoningEffort,
  TaskKind,
} from "./api/generated-api";
import type {
  AiMentorRoleplayConfigurationResponse,
  AiMentorTeacherConfigurationResponse,
  AiMentorConfigurationValidationResponse,
  AiJudgeConfigurationResponseOutput,
  AiJudgeConfigurationValidationResponse,
  BodyTranscribeDictationApiPublicV1AiTranscriptionsPost,
  EmbeddingsRequest,
  EmbeddingsResponse,
  GenerateAiMentorConfigurationRequest,
  JudgeResponse,
  MentorChatRequest,
  MentorChatResponse,
  PublicConfigurationResponse,
  StructuredGenerationRequest,
  TranscriptionResponse,
  TranslationResponse,
} from "./api/generated-api";
export type {
  AiCapabilityStatus,
  MentorChatRequest,
  MentorChatResponse,
  PublicAiMessage,
  PublicConfigurationResponse,
} from "./api/generated-api";
export {
  AiCapability,
  AiCapabilityMode,
  AiCapabilityProvider,
  ReasoningEffort,
  TaskKind,
} from "./api/generated-api";

export type AiRuntimeConfiguration = PublicConfigurationResponse;
export type MentorChatOptions = MentorChatRequest;
export type MentorStreamRequestOptions = {
  signal?: AbortSignal;
};
export type MentorGenerateChatResponse = MentorChatResponse;
export type MentorJudgeOptions = StructuredGenerationRequest;
export type MentorJudgeResponse = JudgeResponse;
export type GenerateAiJudgeConfigurationOptions = StructuredGenerationRequest;
export type GenerateAiJudgeConfigurationResponse = AiJudgeConfigurationResponseOutput;
export const AI_MENTOR_CONFIGURATION_TYPES = {
  TEACHER: "teacher",
  ROLEPLAY: "roleplay",
} as const;

export type AiMentorConfigurationType =
  (typeof AI_MENTOR_CONFIGURATION_TYPES)[keyof typeof AI_MENTOR_CONFIGURATION_TYPES];
export type GenerateAiMentorConfigurationOptions = Omit<
  GenerateAiMentorConfigurationRequest,
  "configurationType"
> & {
  configurationType: AiMentorConfigurationType;
};
export type GenerateAiMentorConfigurationResponse =
  AiMentorTeacherConfigurationResponse | AiMentorRoleplayConfigurationResponse;
export type ValidateAiJudgeConfigurationOptions = StructuredGenerationRequest;
export type ValidateAiJudgeConfigurationResponse = AiJudgeConfigurationValidationResponse;
export type ValidateAiMentorConfigurationOptions = StructuredGenerationRequest;
export type ValidateAiMentorConfigurationResponse = AiMentorConfigurationValidationResponse;
export type CreateEmbeddingsOptions = EmbeddingsRequest;
export type CreateEmbeddingsResponse = EmbeddingsResponse;
export type GenerateTranslationsOptions = StructuredGenerationRequest;
export type GenerateTranslationsResponse = TranslationResponse;
export type TranscribeDictationOptions = BodyTranscribeDictationApiPublicV1AiTranscriptionsPost;
export type TranscribeDictationResponse = TranscriptionResponse;

export const LUMA_AI_CAPABILITY_MODES = {
  CORE: AiCapabilityMode.Core,
  CUSTOM: AiCapabilityMode.Custom,
  DISABLED: AiCapabilityMode.Disabled,
} as const;

export const LUMA_AI_CAPABILITY_PROVIDERS = {
  LUMA: AiCapabilityProvider.Luma,
  MENTINGO_CORE: AiCapabilityProvider.MentingoCore,
} as const;

export const LUMA_AI_CAPABILITIES = {
  COURSE_GENERATION: AiCapability.CourseGeneration,
  COURSE_GENERATION_VISUAL_ASSETS: AiCapability.CourseGenerationVisualAssets,
  COURSE_GENERATION_EMBEDDINGS: AiCapability.CourseGenerationEmbeddings,
  AI_MENTOR_CHAT: AiCapability.AiMentorChat,
  AI_MENTOR_JUDGE: AiCapability.AiMentorJudge,
  AI_MENTOR_CONFIGURATION_GENERATOR: AiCapability.AiMentorConfigurationGenerator,
  AI_JUDGE_CONFIGURATION_GENERATOR: AiCapability.AiJudgeConfigurationGenerator,
  AI_JUDGE_CONFIGURATION_VALIDATOR: AiCapability.AiJudgeConfigurationValidator,
  AI_MENTOR_RAG_EMBEDDINGS: AiCapability.AiMentorRagEmbeddings,
  TRANSLATION_GENERATION: AiCapability.TranslationGeneration,
  DICTATION_TRANSCRIPTION: AiCapability.DictationTranscription,
  VOICE_TRANSCRIPTION: AiCapability.VoiceTranscription,
  VOICE_MENTOR: AiCapability.VoiceMentor,
  VOICE_TEXT_TO_SPEECH: AiCapability.VoiceTextToSpeech,
} as const;
