import { describe, expect, it } from "vitest";
import { createInMemoryRateLimiter } from "@/lib/ai/rate-limit";

describe("in-memory coach request limiter", () => {
  it("allows only the configured number of requests per window", () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 60_000, maxRequests: 2, maxBuckets: 5 });
    expect(limiter.take("client-a", 10_000)).toEqual({ allowed: true, remaining: 1 });
    expect(limiter.take("client-a", 10_100)).toEqual({ allowed: true, remaining: 0 });
    expect(limiter.take("client-a", 10_200)).toEqual({ allowed: false, retryAfterSeconds: 60 });
    expect(limiter.take("client-a", 70_000)).toEqual({ allowed: true, remaining: 1 });
  });

  it("bounds bucket memory and prunes expired keys", () => {
    const limiter = createInMemoryRateLimiter({ windowMs: 1_000, maxRequests: 1, maxBuckets: 1 });
    expect(limiter.take("first", 0).allowed).toBe(true);
    expect(limiter.take("second", 100)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.size()).toBe(1);
    expect(limiter.take("second", 1_000).allowed).toBe(true);
    expect(limiter.size()).toBe(1);
  });
});
