import { API } from "../api/generated-api";
import type {
  AdminApiKeyAssignmentUpdateOptions,
  AdminApiKeyCreateOptions,
  AdminApiKeyCreateResponse,
  AdminApiKeyIdentifierOptions,
  AdminApiKeyResponse,
  AdminApiKeyRevokeResponse,
  AdminApiKeyUpdateOptions,
  AdminConfigurationResponse,
  AdminModelAssignmentResponse,
  AdminModelProfileResponse,
  AdminOrganizationIdOptions,
} from "./admin.types";

const ADMIN_API_KEY_REQUIRED_MESSAGE =
  "Luma API key is required. Pass apiKey to createLumaClient({ apiKey }).";

class AdminApiExecutions {
  constructor(
    private readonly apiClient: API<unknown>,
    private readonly apiKey?: string,
  ) {}

  private assertAdminApiKey(): void {
    if (!this.apiKey?.trim()) {
      throw new Error(ADMIN_API_KEY_REQUIRED_MESSAGE);
    }
  }

  async listApiKeys(opts: AdminOrganizationIdOptions): Promise<AdminApiKeyResponse[]> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.listOrganizationApiKeysApiPublicV1AdminOrganizationsOrganizationIdApiKeysGet(
        opts.organizationId,
      );

    return response.data;
  }

  async createApiKey(opts: AdminApiKeyCreateOptions): Promise<AdminApiKeyCreateResponse> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.createOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysPost(
        opts.organizationId,
        { name: opts.name },
      );

    return response.data;
  }

  async getApiKey(opts: AdminApiKeyIdentifierOptions): Promise<AdminApiKeyResponse> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.getOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdGet(
        opts.organizationId,
        opts.apiKeyId,
      );

    return response.data;
  }

  async updateApiKey(opts: AdminApiKeyUpdateOptions): Promise<AdminApiKeyResponse> {
    this.assertAdminApiKey();
    const { organizationId, apiKeyId, ...data } = opts;
    const response =
      await this.apiClient.api.updateOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdPatch(
        organizationId,
        apiKeyId,
        data,
      );

    return response.data;
  }

  async revokeApiKey(opts: AdminApiKeyIdentifierOptions): Promise<AdminApiKeyRevokeResponse> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.revokeOrganizationApiKeyApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdDelete(
        opts.organizationId,
        opts.apiKeyId,
      );

    return response.data;
  }

  async getConfiguration(opts: AdminApiKeyIdentifierOptions): Promise<AdminConfigurationResponse> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.getOrganizationApiKeyConfigurationApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdConfigurationGet(
        opts.organizationId,
        opts.apiKeyId,
      );

    return response.data;
  }

  async listAssignments(
    opts: AdminApiKeyIdentifierOptions,
  ): Promise<AdminModelAssignmentResponse[]> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.listOrganizationApiKeyAssignmentsApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdAiModelAssignmentsGet(
        opts.organizationId,
        opts.apiKeyId,
      );

    return response.data;
  }

  async updateAssignment(
    opts: AdminApiKeyAssignmentUpdateOptions,
  ): Promise<AdminModelAssignmentResponse> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.updateOrganizationApiKeyAssignmentApiPublicV1AdminOrganizationsOrganizationIdApiKeysApiKeyIdAiModelAssignmentsDomainPatch(
        opts.organizationId,
        opts.apiKeyId,
        opts.domain,
        {
          mode: opts.mode,
          modelProfileId: opts.modelProfileId,
        },
      );

    return response.data;
  }

  async listModelProfiles(opts: AdminOrganizationIdOptions): Promise<AdminModelProfileResponse[]> {
    this.assertAdminApiKey();
    const response =
      await this.apiClient.api.listOrganizationAiModelProfilesApiPublicV1AdminOrganizationsOrganizationIdAiModelProfilesGet(
        opts.organizationId,
      );

    return response.data;
  }
}

export class LumaAdminApiKeysClient {
  constructor(private readonly executions: AdminApiExecutions) {}

  list(opts: AdminOrganizationIdOptions): Promise<AdminApiKeyResponse[]> {
    return this.executions.listApiKeys(opts);
  }

  create(opts: AdminApiKeyCreateOptions): Promise<AdminApiKeyCreateResponse> {
    return this.executions.createApiKey(opts);
  }

  get(opts: AdminApiKeyIdentifierOptions): Promise<AdminApiKeyResponse> {
    return this.executions.getApiKey(opts);
  }

  update(opts: AdminApiKeyUpdateOptions): Promise<AdminApiKeyResponse> {
    return this.executions.updateApiKey(opts);
  }

  revoke(opts: AdminApiKeyIdentifierOptions): Promise<AdminApiKeyRevokeResponse> {
    return this.executions.revokeApiKey(opts);
  }

  getConfiguration(opts: AdminApiKeyIdentifierOptions): Promise<AdminConfigurationResponse> {
    return this.executions.getConfiguration(opts);
  }

  listAssignments(opts: AdminApiKeyIdentifierOptions): Promise<AdminModelAssignmentResponse[]> {
    return this.executions.listAssignments(opts);
  }

  updateAssignment(
    opts: AdminApiKeyAssignmentUpdateOptions,
  ): Promise<AdminModelAssignmentResponse> {
    return this.executions.updateAssignment(opts);
  }
}

export class LumaAdminModelProfilesClient {
  constructor(private readonly executions: AdminApiExecutions) {}

  list(opts: AdminOrganizationIdOptions): Promise<AdminModelProfileResponse[]> {
    return this.executions.listModelProfiles(opts);
  }
}

export class LumaAdminClient {
  readonly apiKeys: LumaAdminApiKeysClient;
  readonly modelProfiles: LumaAdminModelProfilesClient;

  constructor(apiClient: API<unknown>, apiKey?: string) {
    const executions = new AdminApiExecutions(apiClient, apiKey);
    this.apiKeys = new LumaAdminApiKeysClient(executions);
    this.modelProfiles = new LumaAdminModelProfilesClient(executions);
  }
}
