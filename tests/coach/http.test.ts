import { describe, expect, it } from "vitest";
import { getRateLimitKey, isSameOriginRequest, parseJson, readLimitedRequestBody } from "@/lib/ai/http";

describe("coach HTTP boundary helpers", () => {
  it("accepts exact same-origin and correctly forwarded HTTPS origins", () => {
    const sameOrigin = new Request("https://cognitive.example/coach/api", {
      method: "POST",
      headers: { Origin: "https://cognitive.example" },
    });
    expect(isSameOriginRequest(sameOrigin)).toBe(true);

    const proxied = new Request("http://next-internal:3000/coach/api", {
      method: "POST",
      headers: {
        Origin: "https://3000-preview-sandbox.e2b.app",
        "X-Forwarded-Host": "3000-preview-sandbox.e2b.app",
        "X-Forwarded-Proto": "https",
      },
    });
    expect(isSameOriginRequest(proxied)).toBe(true);
  });

  it("rejects absent, malformed, path-bearing, and cross-site origins", () => {
    expect(isSameOriginRequest(new Request("https://cognitive.example/coach/api"))).toBe(false);
    expect(isSameOriginRequest(new Request("https://cognitive.example/coach/api", {
      headers: { Origin: "null" },
    }))).toBe(false);
    expect(isSameOriginRequest(new Request("https://cognitive.example/coach/api", {
      headers: { Origin: "https://cognitive.example/path" },
    }))).toBe(false);
    expect(isSameOriginRequest(new Request("http://next-internal/coach/api", {
      headers: {
        Origin: "https://attacker.example",
        "X-Forwarded-Host": "cognitive.example",
        "X-Forwarded-Proto": "https",
      },
    }))).toBe(false);
  });

  it("limits request bytes, rejects invalid UTF-8, and accepts only JSON objects", async () => {
    const small = new Request("https://cognitive.example/coach/api", {
      method: "POST",
      body: "{\"ok\":true}",
    });
    expect(await readLimitedRequestBody(small, 32)).toBe("{\"ok\":true}");

    const large = new Request("https://cognitive.example/coach/api", {
      method: "POST",
      body: "x".repeat(33),
    });
    expect(await readLimitedRequestBody(large, 32)).toBeNull();

    const invalidUtf8 = new Request("https://cognitive.example/coach/api", {
      method: "POST",
      body: new Uint8Array([0xff, 0xfe]),
    });
    expect(await readLimitedRequestBody(invalidUtf8, 32)).toBeNull();
    expect(parseJson("{\"field\":1}")).toEqual({ field: 1 });
    expect(parseJson("[]")).toBeNull();
    expect(parseJson("null")).toBeNull();
  });

  it("uses a normalized proxy client address when available", () => {
    const forwarded = new Request("https://cognitive.example/coach/api", {
      headers: { "X-Forwarded-For": "203.0.113.5, 10.0.0.2" },
    });
    expect(getRateLimitKey(forwarded)).toBe("203.0.113.5");

    const realIp = new Request("https://cognitive.example/coach/api", {
      headers: { "X-Real-IP": "203.0.113.9", "X-Forwarded-For": "203.0.113.5" },
    });
    expect(getRateLimitKey(realIp)).toBe("203.0.113.9");
  });
});
