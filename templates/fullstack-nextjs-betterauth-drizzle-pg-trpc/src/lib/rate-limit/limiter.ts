import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// General: 10 requests per minute
export const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:general",
});

// General: 5 requests per minute
export const generalProtectedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:general",
});

/**
 * Get user identifier from session or IP
 */
export function getUserIdentifier(userId?: string, ip?: string): string {
  return userId ?? ip ?? "anonymous";
}
