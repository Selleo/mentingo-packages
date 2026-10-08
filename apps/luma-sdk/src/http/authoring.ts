/**
 * Typed transport facade for durable authoring sessions, commands and exports.
 * Server state owns replay and idempotency; this client does not schedule work or
 * apply course content. The supplied API client owns authentication and transport.
 */
import { API } from "../api/generated-api";
import { consumeAuthoringEventStream } from "./authoring.stream";
import type {
  AuthoringApplicationReceipt,
  AuthoringCommandReceipt,
  AuthoringContextFulfillmentReceipt,
  AuthoringContextFailureReceipt,
  AuthoringCreateSessionOptions,
  AuthoringEventPage,
  AuthoringEventsOptions,
  AuthoringSessionOptions,
  AuthoringSessionPage,
  AuthoringSessionSnapshot,
  AuthoringTurnHistoryOptions,
  AuthoringTurnHistoryPage,
  AuthoringSourceUploadReceipt,
  DownloadAuthoringAssetOptions,
  DownloadedAuthoringAsset,
  FrozenAuthoringExport,
  FailAuthoringContextOptions,
  FulfillAuthoringContextOptions,
  GetAuthoringExportOptions,
  ListAuthoringSessionsOptions,
  PrepareAuthoringExportOptions,
  RecordAuthoringReceiptOptions,
  SendAuthoringCommandOptions,
  SubscribeAuthoringEventsOptions,
  UploadAuthoringSourceOptions,
} from "./authoring.types";

/** Authoring HTTP operations exposed by the main SDK client. */
export class LumaAuthoringClient {
  /** Reuse the authenticated generated client and its configured HTTP policy. */
  constructor(private readonly apiClient: API<unknown>) {}

  /** Open or restore the organization/course session using the caller command identity. */
  async createSession(options: AuthoringCreateSessionOptions): Promise<AuthoringSessionSnapshot> {
    const response =
      await this.apiClient.api.createSessionApiPublicV1AuthoringSessionsPost(options);
    return response.data;
  }

  /** List one server-filtered, offset-paginated page of a course's independent conversations in server-defined latest-activity order. */
  async listSessions(options: ListAuthoringSessionsOptions): Promise<AuthoringSessionPage> {
    const response = await this.apiClient.api.listSessionsApiPublicV1AuthoringSessionsGet({
      course_id: options.courseId,
      keyword: options.keyword,
      page: options.page,
      perPage: options.perPage,
    });
    return response.data;
  }

  /** Read the durable workspace snapshot used for initial rendering and resynchronization. */
  async getSession(options: AuthoringSessionOptions): Promise<AuthoringSessionSnapshot> {
    const response = await this.apiClient.api.getSessionApiPublicV1AuthoringSessionsSessionIdGet(
      options.sessionId,
    );
    return response.data;
  }

  /** Read an older, stable keyset page of turns and the records for their review cards. */
  async getOlderTurns(options: AuthoringTurnHistoryOptions): Promise<AuthoringTurnHistoryPage> {
    const response =
      await this.apiClient.api.getOlderTurnsApiPublicV1AuthoringSessionsSessionIdTurnsGet(
        options.sessionId,
        { beforeRequestId: options.beforeRequestId },
      );
    return response.data;
  }

  /** Read one ordered event page after a durable cursor; callers own pagination. */
  async getEvents(options: AuthoringEventsOptions): Promise<AuthoringEventPage> {
    const response =
      await this.apiClient.api.getEventsApiPublicV1AuthoringSessionsSessionIdEventsGet(
        options.sessionId,
        {
          afterSequence: options.afterSequence,
          limit: options.limit,
        },
      );
    return response.data;
  }

  /** Consume one SSE connection until closure or failure.
   * The caller owns reconnect and cursor persistence; aborting only closes the
   * subscription and never stops generation. Terminal access/history errors reject. */
  async subscribeEvents(options: SubscribeAuthoringEventsOptions): Promise<void> {
    const controller = new AbortController();
    /** Forward caller cancellation to the connection owned by this subscription. */
    const abort = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted) abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    try {
      const response =
        await this.apiClient.api.subscribeEventsApiPublicV1AuthoringSessionsSessionIdEventsStreamGet(
          options.sessionId,
          { afterSequence: options.afterSequence },
          {
            format: "stream",
            headers: { Accept: "text/event-stream" },
            signal: controller.signal,
          },
        );
      await consumeAuthoringEventStream(response.data, options);
    } finally {
      options.signal?.removeEventListener("abort", abort);
      controller.abort();
    }
  }

  /** Upload a source under a stable command ID; processing completes asynchronously. */
  async uploadSource(options: UploadAuthoringSourceOptions): Promise<AuthoringSourceUploadReceipt> {
    const response =
      await this.apiClient.api.uploadSourceApiPublicV1AuthoringSessionsSessionIdSourcesPost(
        options.sessionId,
        { file: options.file, commandId: options.commandId },
      );
    return response.data;
  }

  /** Download one authorized asset revision with a response-size bound.
   * Defaults to 32 MiB. Pass the frozen manifest size when known; invalid limits
   * and oversized responses reject without returning partial asset data. */
  async downloadAsset(options: DownloadAuthoringAssetOptions): Promise<DownloadedAuthoringAsset> {
    const maxBytes = options.maxBytes ?? 32 * 1024 * 1024;
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
      throw new RangeError("Asset maxBytes must be a nonnegative safe integer");
    }
    const response =
      await this.apiClient.api.downloadAssetApiPublicV1AuthoringSessionsSessionIdAssetsAssetIdGet(
        options.sessionId,
        options.assetId,
        { revision: options.revision },
        { format: "arraybuffer", signal: options.signal, maxContentLength: maxBytes },
      );
    const data: unknown = response.data;
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    if (bytes.byteLength > maxBytes) throw new RangeError("Asset response exceeds maxBytes");
    const contentType = response.headers["content-type"];
    return {
      assetId: options.assetId,
      revision: options.revision ?? 1,
      bytes,
      mimeType: typeof contentType === "string" ? contentType : undefined,
    };
  }

  /** Submit a command with its stable identity and return the server acknowledgement.
   * An acknowledgement records acceptance, not completion of provider work. */
  async sendCommand(options: SendAuthoringCommandOptions): Promise<AuthoringCommandReceipt> {
    const response =
      await this.apiClient.api.commandApiPublicV1AuthoringSessionsSessionIdCommandsPost(
        options.sessionId,
        options.command,
      );
    return response.data;
  }

  /** Deliver only the selected Core-authorized context for a pending fenced task. */
  async fulfillContext(
    options: FulfillAuthoringContextOptions,
  ): Promise<AuthoringContextFulfillmentReceipt> {
    const response =
      await this.apiClient.api.fulfillContextApiPublicV1AuthoringSessionsSessionIdContextRequestsContextRequestIdFulfillmentPost(
        options.sessionId,
        options.contextRequestId,
        options.response,
      );
    return response.data;
  }

  /** Settle one pending context request when Core cannot return authorized detail. */
  async failContext(options: FailAuthoringContextOptions): Promise<AuthoringContextFailureReceipt> {
    const response =
      await this.apiClient.api.failContextApiPublicV1AuthoringSessionsSessionIdContextRequestsContextRequestIdFailurePost(
        options.sessionId,
        options.contextRequestId,
        options.failure,
      );
    return response.data;
  }

  /** Freeze selected reviewed changes for Core; this operation does not apply them. */
  async prepareExport(options: PrepareAuthoringExportOptions): Promise<FrozenAuthoringExport> {
    const response =
      await this.apiClient.api.prepareExportApiPublicV1AuthoringSessionsSessionIdExportsPost(
        options.sessionId,
        options.request,
      );
    return response.data;
  }

  /** Retrieve the previously frozen bundle without regenerating its content. */
  async getExport(options: GetAuthoringExportOptions): Promise<FrozenAuthoringExport> {
    const response =
      await this.apiClient.api.getExportApiPublicV1AuthoringSessionsSessionIdExportsExportIdGet(
        options.sessionId,
        options.exportId,
      );
    return response.data;
  }

  /** Deliver Core application feedback so Luma can reconcile the reviewed changes. */
  async recordReceipt(
    options: RecordAuthoringReceiptOptions,
  ): Promise<AuthoringApplicationReceipt> {
    const response =
      await this.apiClient.api.receiptApiPublicV1AuthoringSessionsSessionIdReceiptsPost(
        options.sessionId,
        options.receipt,
      );
    return response.data;
  }
}
