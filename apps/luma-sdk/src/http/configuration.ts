import { API } from "../api/generated-api";
import { PublicConfigurationResponse } from "../types";

export class LumaConfigurationClient {
  constructor(private readonly apiClient: API<unknown>) {}

  async get(): Promise<PublicConfigurationResponse> {
    const response = await this.apiClient.api.getConfigurationStatusApiPublicV1AiConfigurationGet();
    return response.data;
  }
}
