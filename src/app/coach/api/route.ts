import {
  MAX_REQUEST_BYTES,
  type ProviderFailureKind,
} from "@/lib/ai/contracts";
import { getRateLimitKey, isSameOriginRequest, parseJson, readLimitedRequestBody } from "@/lib/ai/http";
import { getOpenAIApiKey, isOpenAICoachAvailable, requestOpenAICoach } from "@/lib/ai/openai-provider";
import { coachInstanceBudget, coachRequestLimiter } from "@/lib/ai/rate-limit";
import { parseCoachRequest } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...headers },
  });
}

export async function GET() {
  return jsonResponse({
    available: isOpenAICoachAvailable(),
    provider: "OpenAI",
  });
}

function errorMessage(kind: ProviderFailureKind): { status: number; message: string } {
  switch (kind) {
    case "timeout":
      return {
        status: 504,
        message: "The provider did not respond in time. No automatic retry was made to avoid duplicate calls. You can try again later or use the local tools.",
      };
    case "rate_limited":
      return {
        status: 429,
        message: "The provider usage limit was reached. Wait before trying again, or use the local tools.",
      };
    case "invalid_response":
      return {
        status: 502,
        message: "The guide returned an unsupported reply, so no workspace action was taken. Try another question or use the local tools.",
      };
    case "unavailable":
      return {
        status: 503,
        message: "The optional AI service could not complete this request. No automatic retry was made; the local tools remain available.",
      };
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonResponse({ error: "origin_rejected", message: "This request was not accepted. Reload the page and try again." }, 403);
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return jsonResponse({ error: "unsupported_content_type", message: "The guide accepts a small JSON request only." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "request_too_large", message: "That request is larger than the guide allows." }, 413);
  }

  const limit = coachRequestLimiter.take(getRateLimitKey(request));
  if (!limit.allowed) {
    return jsonResponse(
      { error: "rate_limited", message: "The guide has reached its short-term request limit. Wait a minute, or use the local tools." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const rawBody = await readLimitedRequestBody(request);
  if (rawBody === null) {
    return jsonResponse({ error: "request_too_large", message: "That request is larger than the guide allows." }, 413);
  }

  const body = parseJson(rawBody);
  const parsedRequest = parseCoachRequest(body);
  if (!parsedRequest) {
    return jsonResponse({
      error: "invalid_request",
      message: "The request did not match the guide's allowed fields, adult-only eligibility, or consent requirements. No data was sent to the provider.",
    }, 400);
  }

  const apiKey = getOpenAIApiKey();
  if (!isOpenAICoachAvailable() || !apiKey) {
    return jsonResponse({
      error: "not_configured",
      message: "The optional AI guide is not enabled for this deployment. The local workspace remains available.",
    }, 503);
  }

  const providerBudget = coachInstanceBudget.take("openai-coach");
  if (!providerBudget.allowed) {
    return jsonResponse(
      { error: "usage_limited", message: "The optional guide has reached this server's hourly request budget. Try again later or use the local tools." },
      429,
      { "Retry-After": String(providerBudget.retryAfterSeconds) },
    );
  }

  const result = await requestOpenAICoach(parsedRequest, { apiKey });
  if (!result.ok) {
    const failure = errorMessage(result.kind);
    return jsonResponse({ error: result.kind, message: failure.message }, failure.status);
  }

  return jsonResponse({
    answer: result.turn.answer,
    workspaceItem: result.turn.workspaceItem,
  });
}
