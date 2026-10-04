import { MAX_REQUEST_BYTES, isPlainRecord } from "@/lib/ai/contracts";

function lastForwardedValue(value: string | null): string | null {
  const candidate = value?.split(",").at(-1)?.trim();
  return candidate ? candidate : null;
}

export function isSameOriginRequest(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader || originHeader === "null") return false;

  let origin: URL;
  try {
    origin = new URL(originHeader);
    if (
      origin.pathname !== "/" ||
      origin.search !== "" ||
      origin.hash !== "" ||
      origin.username !== "" ||
      origin.password !== ""
    ) return false;
  } catch {
    return false;
  }

  try {
    if (origin.origin === new URL(request.url).origin) return true;
  } catch {
    return false;
  }

  // Reverse proxies may terminate HTTPS and forward the request to Next.js
  // over HTTP. Only trust these headers when the deployment proxy overwrites
  // them; use the last hop when a trusted proxy supplies a forwarded chain.
  const forwardedHost = lastForwardedValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = lastForwardedValue(request.headers.get("x-forwarded-proto"))?.toLowerCase();
  if (
    !forwardedHost ||
    forwardedHost.includes("/") ||
    forwardedHost.includes("\\") ||
    forwardedHost.includes("@") ||
    (forwardedProto !== "https" && forwardedProto !== "http")
  ) return false;

  try {
    return origin.origin === new URL(`${forwardedProto}://${forwardedHost}`).origin;
  } catch {
    return false;
  }
}

export async function readLimitedRequestBody(
  request: Request,
  maxBytes = MAX_REQUEST_BYTES,
): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function parseJson(text: string): unknown | null {
  try {
    const value: unknown = JSON.parse(text);
    return isPlainRecord(value) ? value : null;
  } catch {
    return null;
  }
}

export function getRateLimitKey(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return forwardedIp ? forwardedIp.slice(0, 128) : "local-or-unavailable";
}
