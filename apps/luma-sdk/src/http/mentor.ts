import { API } from "../api/generated-api";
import {
  MentorChatOptions,
  MentorGenerateChatResponse,
  MentorJudgeOptions,
  MentorJudgeResponse,
  MentorStreamRequestOptions,
} from "../types";

export class LumaMentorClient {
  constructor(private readonly apiClient: API<unknown>) {}

  streamChat(
    opts: MentorChatOptions,
    requestOptions: MentorStreamRequestOptions = {},
  ): ReturnType<API<unknown>["api"]["mentorChatApiPublicV1AiMentorChatPost"]> {
    return this.apiClient.api.mentorChatApiPublicV1AiMentorChatPost(opts, {
      format: "stream",
      signal: requestOptions.signal,
    });
  }

  chat(
    opts: MentorChatOptions,
    requestOptions: MentorStreamRequestOptions = {},
  ): ReturnType<API<unknown>["api"]["mentorChatApiPublicV1AiMentorChatPost"]> {
    return this.streamChat(opts, requestOptions);
  }

  async generateChat(opts: MentorChatOptions): Promise<MentorGenerateChatResponse> {
    const response =
      await this.apiClient.api.generateMentorChatApiPublicV1AiMentorChatGeneratePost(opts);

    return response.data;
  }

  async judge(opts: MentorJudgeOptions): Promise<MentorJudgeResponse> {
    const response = await this.apiClient.api.mentorJudgeApiPublicV1AiMentorJudgePost(opts);

    return response.data;
  }
}
