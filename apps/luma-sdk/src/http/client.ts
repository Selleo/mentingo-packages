/**
 * SDK composition root: shares transport configuration across feature clients
 * while keeping public and administrative API-key headers separate.
 */
import { Agent as HttpsAgent } from "node:https";

import { API } from "../api/generated-api";
import { LumaAiClient } from "./ai";
import { LumaAdminClient } from "./admin";
import { LumaAuthoringClient } from "./authoring";
import { LumaConfigurationClient } from "./configuration";
import { LumaMentorClient } from "./mentor";

export type LumaClientOptions = {
  baseURL?: string;
  apiKey?: string;
  httpsAgent?: HttpsAgent;
  allowInsecureTls?: boolean;
};

/** Connected feature facades; construction does not open an authoring session. */
export class LumaClient {
  readonly ai: LumaAiClient;
  readonly admin: LumaAdminClient;
  readonly authoring: LumaAuthoringClient;
  readonly configuration: LumaConfigurationClient;
  readonly mentor: LumaMentorClient;
  private readonly apiClient: API<unknown>;

  /** Configure authenticated transports; TLS verification stays enabled unless explicitly disabled. */
  constructor(opts: LumaClientOptions) {
    const httpsAgent =
      opts.httpsAgent ??
      (opts.allowInsecureTls ? new HttpsAgent({ rejectUnauthorized: false }) : undefined);

    this.apiClient = new API({
      baseURL: opts.baseURL,
      secure: true,
      httpsAgent,
      headers: {
        "X-API-Key": opts.apiKey,
      },
    });

    const adminApiClient = new API({
      baseURL: opts.baseURL,
      secure: true,
      httpsAgent,
      headers: {
        "X-Admin-API-Key": opts.apiKey,
      },
    });

    this.ai = new LumaAiClient(this.apiClient);
    this.admin = new LumaAdminClient(adminApiClient, opts.apiKey);
    this.authoring = new LumaAuthoringClient(this.apiClient);
    this.configuration = new LumaConfigurationClient(this.apiClient);
    this.mentor = new LumaMentorClient(this.apiClient);
  }
}

/** Construct feature clients with the supplied endpoint and integration credentials. */
export const createLumaClient = (opts: LumaClientOptions): LumaClient => {
  return new LumaClient(opts);
};
