import type {
  AiModelAssignmentResponse,
  AiModelAssignmentUpdateRequest,
  AiModelDomain,
  AiModelProfileKind,
  AiModelProfileResponse,
  ApiKeyCreateRequest,
  ApiKeyCreateResponse,
  ApiKeyResponse,
  ApiKeyUpdateRequest,
  PublicConfigurationResponse,
} from "../api/generated-api";
import type { LumaAiModelDomain, LumaAiModelProfileKind } from "./admin.constants";

export type AdminOrganizationIdOptions = {
  organizationId: string;
};

export type AdminApiKeyIdentifierOptions = AdminOrganizationIdOptions & {
  apiKeyId: string;
};

export type AdminApiKeyCreateOptions = AdminOrganizationIdOptions & ApiKeyCreateRequest;
export type AdminApiKeyUpdateOptions = AdminApiKeyIdentifierOptions & ApiKeyUpdateRequest;

export type AdminApiKeyResponse = ApiKeyResponse;
export type AdminApiKeyCreateResponse = ApiKeyCreateResponse;
export type AdminApiKeyRevokeResponse = Record<string, string>;
export type AdminConfigurationResponse = PublicConfigurationResponse;
export type AdminModelAssignmentResponse = AiModelAssignmentResponse;
export type AdminModelProfileResponse = AiModelProfileResponse;

export type AdminApiKeyAssignmentUpdateOptions = AdminApiKeyIdentifierOptions &
  AiModelAssignmentUpdateRequest & {
    domain: LumaAiModelDomain;
  };

export type { LumaAiModelDomain, LumaAiModelProfileKind } from "./admin.constants";

export type {
  AiModelAssignmentResponse,
  AiModelAssignmentUpdateRequest,
  AiModelDomain,
  AiModelProfileKind,
  AiModelProfileResponse,
  ApiKeyCreateRequest,
  ApiKeyCreateResponse,
  ApiKeyResponse,
  ApiKeyUpdateRequest,
  PublicConfigurationResponse,
};
