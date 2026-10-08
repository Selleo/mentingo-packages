import { AiModelDomain, AiModelProfileKind } from "../api/generated-api";

export const LUMA_AI_MODEL_DOMAINS = {
  AI_MENTOR: AiModelDomain.AiMentor,
  AI_MENTOR_CONFIGURATION_GENERATOR: AiModelDomain.AiMentorConfigurationGenerator,
  AI_MENTOR_JUDGE: AiModelDomain.AiMentorJudge,
  AI_JUDGE_CONFIGURATION_GENERATOR: AiModelDomain.AiJudgeConfigurationGenerator,
  AI_JUDGE_CONFIGURATION_VALIDATOR: AiModelDomain.AiJudgeConfigurationValidator,
  TRANSLATIONS: AiModelDomain.Translations,
  COURSE_GENERATION: AiModelDomain.CourseGeneration,
  COURSE_GENERATION_VISUAL_ASSETS: AiModelDomain.CourseGenerationVisualAssets,
  COURSE_GENERATION_EMBEDDINGS: AiModelDomain.CourseGenerationEmbeddings,
  EMBEDDINGS: AiModelDomain.Embeddings,
  DICTATION_TRANSCRIPTION: AiModelDomain.DictationTranscription,
  VOICE_TRANSCRIPTION: AiModelDomain.VoiceTranscription,
  VOICE_TTS: AiModelDomain.VoiceTts,
} as const;

export type LumaAiModelDomain = (typeof LUMA_AI_MODEL_DOMAINS)[keyof typeof LUMA_AI_MODEL_DOMAINS];

export const LUMA_AI_MODEL_PROFILE_KINDS = {
  CHAT: AiModelProfileKind.Chat,
  EMBEDDING: AiModelProfileKind.Embedding,
  SPEECH_TO_TEXT: AiModelProfileKind.SpeechToText,
  TEXT_TO_SPEECH: AiModelProfileKind.TextToSpeech,
} as const;

export type LumaAiModelProfileKind =
  (typeof LUMA_AI_MODEL_PROFILE_KINDS)[keyof typeof LUMA_AI_MODEL_PROFILE_KINDS];

export { AiModelDomain, AiModelProfileKind } from "../api/generated-api";
