export type RateLimitDecision =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

type Bucket = {
  count: number;
  resetAt: number;
};

export function createInMemoryRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  maxBuckets: number;
}) {
  const buckets = new Map<string, Bucket>();

  function prune(now: number) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  return {
    take(key: string, now = Date.now()): RateLimitDecision {
      prune(now);
      const normalizedKey = key.trim().slice(0, 128) || "unknown";
      const current = buckets.get(normalizedKey);

      if (current && current.resetAt > now) {
        if (current.count >= options.maxRequests) {
          return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
          };
        }
        current.count += 1;
        return { allowed: true, remaining: options.maxRequests - current.count };
      }

      if (!current && buckets.size >= options.maxBuckets) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(options.windowMs / 1_000)) };
      }

      buckets.set(normalizedKey, { count: 1, resetAt: now + options.windowMs });
      return { allowed: true, remaining: Math.max(0, options.maxRequests - 1) };
    },
    reset() {
      buckets.clear();
    },
    size() {
      return buckets.size;
    },
  };
}

export const COACH_RATE_LIMIT = Object.freeze({
  windowMs: 60_000,
  maxRequests: 5,
  maxBuckets: 2_048,
});

// A process-local safety budget prevents a single warm Node worker from making
// unbounded provider calls. It is not a deployment-wide billing control.
export const COACH_INSTANCE_BUDGET = Object.freeze({
  windowMs: 60 * 60_000,
  maxRequests: 60,
  maxBuckets: 1,
});

export const coachRequestLimiter = createInMemoryRateLimiter(COACH_RATE_LIMIT);
export const coachInstanceBudget = createInMemoryRateLimiter(COACH_INSTANCE_BUDGET);
