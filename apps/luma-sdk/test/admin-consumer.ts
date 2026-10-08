import {
  AiCapabilityMode,
  createLumaClient,
  LUMA_AI_MODEL_DOMAINS,
  LUMA_AI_MODEL_PROFILE_KINDS,
} from "../src/index";
import type {
  AdminApiKeyAssignmentUpdateOptions,
  AdminApiKeyUpdateOptions,
  LumaAiModelProfileKind,
} from "../src/http/admin.types";

const apiKeyUpdate: AdminApiKeyUpdateOptions = {
  organizationId: "organization-123",
  apiKeyId: "api-key-123",
  name: "Updated key",
};

const assignmentUpdate: AdminApiKeyAssignmentUpdateOptions = {
  organizationId: "organization-123",
  apiKeyId: "api-key-123",
  domain: LUMA_AI_MODEL_DOMAINS.AI_MENTOR,
  mode: AiCapabilityMode.Custom,
};

const profileKind: LumaAiModelProfileKind = LUMA_AI_MODEL_PROFILE_KINDS.CHAT;
const imageProfileKind: LumaAiModelProfileKind = LUMA_AI_MODEL_PROFILE_KINDS.IMAGE;
const imageAssignment: AdminApiKeyAssignmentUpdateOptions = {
  organizationId: "organization-123",
  apiKeyId: "api-key-123",
  domain: LUMA_AI_MODEL_DOMAINS.COURSE_GENERATION_VISUAL_ASSETS,
  mode: AiCapabilityMode.Custom,
  modelProfileId: "image-profile-123",
};
void imageProfileKind;
void imageAssignment;
const client = createLumaClient({ apiKey: "admin-secret" });

void apiKeyUpdate;
void assignmentUpdate;
void profileKind;
void client.admin.modelProfiles.list({ organizationId: "organization-123" });
