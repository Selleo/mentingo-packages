import { API } from "../api/generated-api";
import type { NativeChatResult } from "../api/generated-api";
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

  /** Event-mode generation always returns the native tool-call result contract. */
  generateChat(
    opts: MentorChatOptions & { streamFormat: "events" },
    requestOptions?: MentorStreamRequestOptions,
  ): Promise<NativeChatResult>;
  /** Legacy and tool-bearing native requests preserve their matching response shapes. */
  generateChat(
    opts: MentorChatOptions,
    requestOptions?: MentorStreamRequestOptions,
  ): Promise<MentorGenerateChatResponse>;
  /** Generate native chat output, preserving caller cancellation before any fallback decision. */
  async generateChat(
    opts: MentorChatOptions,
    requestOptions: MentorStreamRequestOptions = {},
  ): Promise<MentorGenerateChatResponse> {
    const response = await this.apiClient.api.generateMentorChatApiPublicV1AiMentorChatGeneratePost(
      opts,
      {
        signal: requestOptions.signal,
      },
    );

    return response.data;
  }

  async judge(opts: MentorJudgeOptions): Promise<MentorJudgeResponse> {
    const response = await this.apiClient.api.mentorJudgeApiPublicV1AiMentorJudgePost(opts);

    return response.data;
  }
}
