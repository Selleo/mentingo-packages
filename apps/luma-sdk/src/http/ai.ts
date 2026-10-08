import { AiMentorConfigurationType, API } from "../api/generated-api";
import {
  AI_MENTOR_CONFIGURATION_TYPES,
  CreateEmbeddingsOptions,
  CreateEmbeddingsResponse,
  GenerateAiJudgeConfigurationOptions,
  GenerateAiJudgeConfigurationResponse,
  GenerateAiMentorConfigurationOptions,
  GenerateAiMentorConfigurationResponse,
  GenerateTranslationsOptions,
  GenerateTranslationsResponse,
  TranscribeDictationOptions,
  TranscribeDictationResponse,
  ValidateAiJudgeConfigurationOptions,
  ValidateAiJudgeConfigurationResponse,
  ValidateAiMentorConfigurationOptions,
  ValidateAiMentorConfigurationResponse,
} from "../types";

export class LumaAiClient {
  constructor(private readonly apiClient: API<unknown>) {}

  async createEmbeddings(opts: CreateEmbeddingsOptions): Promise<CreateEmbeddingsResponse> {
    const response = await this.apiClient.api.createEmbeddingsApiPublicV1AiEmbeddingsPost(opts);

    return response.data;
  }

  async generateJudgeConfiguration(
    opts: GenerateAiJudgeConfigurationOptions,
  ): Promise<GenerateAiJudgeConfigurationResponse> {
    const response =
      await this.apiClient.api.generateJudgeConfigurationApiPublicV1AiJudgeConfigurationGeneratePost(
        opts,
      );

    return response.data;
  }

  async generateMentorConfiguration(
    opts: GenerateAiMentorConfigurationOptions,
  ): Promise<GenerateAiMentorConfigurationResponse> {
    const configurationType =
      opts.configurationType === AI_MENTOR_CONFIGURATION_TYPES.TEACHER
        ? AiMentorConfigurationType.Teacher
        : AiMentorConfigurationType.Roleplay;
    const response =
      await this.apiClient.api.generateMentorConfigurationApiPublicV1AiMentorConfigurationGeneratePost(
        { ...opts, configurationType },
      );

    return response.data;
  }

  async validateJudgeConfiguration(
    opts: ValidateAiJudgeConfigurationOptions,
  ): Promise<ValidateAiJudgeConfigurationResponse> {
    const response =
      await this.apiClient.api.validateJudgeConfigurationApiPublicV1AiJudgeConfigurationValidatePost(
        opts,
      );

    return response.data;
  }

  async validateMentorConfiguration(
    opts: ValidateAiMentorConfigurationOptions,
  ): Promise<ValidateAiMentorConfigurationResponse> {
    const response =
      await this.apiClient.api.validateMentorConfigurationApiPublicV1AiMentorConfigurationValidatePost(
        opts,
      );

    return response.data;
  }

  async generateTranslations(
    opts: GenerateTranslationsOptions,
  ): Promise<GenerateTranslationsResponse> {
    const response =
      await this.apiClient.api.generateTranslationsApiPublicV1AiTranslationsGeneratePost(opts);

    return response.data;
  }

  async transcribeDictation(
    opts: TranscribeDictationOptions,
  ): Promise<TranscribeDictationResponse> {
    const response =
      await this.apiClient.api.transcribeDictationApiPublicV1AiTranscriptionsPost(opts);

    return response.data;
  }
}
