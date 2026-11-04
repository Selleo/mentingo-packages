import axios from "axios";
import { ErrorCode, type ErrorResponse } from "./api/generated-api";

/** Safe API failure without retaining Axios configuration, bodies or credentials. */
export class GuideApiError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined,
    readonly requestId: string | undefined,
    readonly retryAfter: string | undefined,
    readonly code: ErrorCode | undefined = undefined,
    readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "GuideApiError";
  }
}

function boundedString(value: unknown, max: number): string | undefined {
  return typeof value === "string" && value.length <= max ? value : undefined;
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const response = value as Record<string, unknown>;
  return (
    typeof response.code === "string" &&
    Object.values(ErrorCode).includes(response.code as ErrorCode) &&
    boundedString(response.message, 500) !== undefined &&
    typeof response.retryable === "boolean" &&
    (response.requestId === undefined ||
      response.requestId === null ||
      boundedString(response.requestId, 128) !== undefined)
  );
}

export function toGuideApiError(error: unknown): GuideApiError {
  if (axios.isAxiosError<unknown>(error)) {
    const response = isErrorResponse(error.response?.data) ? error.response.data : undefined;
    return new GuideApiError(
      response?.message ?? "Helpdesk request failed",
      error.response?.status,
      boundedString(error.response?.headers["x-request-id"], 128) ??
        response?.requestId ??
        undefined,
      boundedString(error.response?.headers["retry-after"], 128),
      response?.code,
      response?.retryable ?? false,
    );
  }
  return new GuideApiError("Helpdesk request failed", undefined, undefined, undefined);
}
