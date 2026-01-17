import type { Ratelimit } from "@upstash/ratelimit";
import { getUserIdentifier } from "~/lib/rate-limit/limiter";
import { middleware } from "../trpc";
import type { RateLimitInfo } from "../types";

/**
 * Create a default rate limit info object for cases where rate limit check fails
 */
function createDefaultRateLimitInfo(): RateLimitInfo {
  return {
    limit: 0,
    remaining: 0,
    reset: new Date().toISOString(),
    retryAfter: 0,
  };
}

/**
 * Create rate limit info from Upstash rate limit response
 */
function createRateLimitInfo(
  limit: number,
  remaining: number,
  reset: number,
): RateLimitInfo {
  const resetDate = new Date(reset);
  const retryAfter = Math.max(
    0,
    Math.ceil((resetDate.getTime() - Date.now()) / 1000),
  );

  return {
    limit,
    remaining,
    reset: resetDate.toISOString(),
    retryAfter,
  };
}

/**
 * Rate limit state stored in context
 */
export type RateLimitState = {
  rateLimitInfo: RateLimitInfo;
  rateLimitExceeded: boolean;
};

/**
 * Create rate limit middleware that stores rate limit info in context.
 * This middleware:
 * 1. Always performs the rate limit check
 * 2. Stores rate limit info and exceeded status in context
 * 3. Always calls next() - the procedure handles returning appropriate response
 */
export function createRateLimitMiddleware(limiter: Ratelimit) {
  return middleware(async ({ ctx, next }) => {
    const identifier = getUserIdentifier(
      ctx.session?.user?.id,
      ctx.headers.get("x-forwarded-for") ?? undefined,
    );

    let rateLimitInfo: RateLimitInfo;
    let rateLimitExceeded = false;

    try {
      // Check rate limit
      const { success, limit, remaining, reset } =
        await limiter.limit(identifier);

      rateLimitInfo = createRateLimitInfo(limit, remaining, reset);
      rateLimitExceeded = !success;
    } catch (error) {
      // If rate limit check fails, use default info and continue
      // This ensures the API doesn't break if Redis is down
      console.error("Rate limit check failed:", error);
      rateLimitInfo = createDefaultRateLimitInfo();
      rateLimitExceeded = false;
    }

    // Continue to next middleware/procedure with rate limit state in context
    return next({
      ctx: {
        ...ctx,
        rateLimitInfo,
        rateLimitExceeded,
      },
    });
  });
}

/**
 * Middleware that only fetches rate limit info without consuming a request.
 * Useful for procedures that need rate limit info but don't need rate limiting.
 */
export function createRateLimitInfoMiddleware(limiter: Ratelimit) {
  return middleware(async ({ ctx, next }) => {
    const identifier = getUserIdentifier(
      ctx.session?.user?.id,
      ctx.headers.get("x-forwarded-for") ?? undefined,
    );

    let rateLimitInfo: RateLimitInfo;

    try {
      // Get current rate limit status without consuming a request
      const { limit, remaining, reset } =
        await limiter.getRemaining(identifier);
      rateLimitInfo = createRateLimitInfo(limit, remaining, reset);
    } catch (error) {
      console.error("Rate limit info fetch failed:", error);
      rateLimitInfo = createDefaultRateLimitInfo();
    }

    return next({
      ctx: {
        ...ctx,
        rateLimitInfo,
        rateLimitExceeded: false,
      },
    });
  });
}
