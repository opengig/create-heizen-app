import {
  generalLimiter,
  generalProtectedLimiter,
} from "~/lib/rate-limit/limiter";
import { createRateLimitMiddleware } from "../middleware/middleware.ratelimit";
import { protectedMiddleware } from "../middleware/middleware.protected";
import { timingMiddleware } from "../middleware/middleware.timing";
import { t } from "../trpc";
import type { RateLimitInfo, ApiResponse } from "../types";
import {
  createDefaultRateLimitInfo,
  createRateLimitExceededResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
} from "../types";

// Create rate limit middleware instances
const generalRateLimit = createRateLimitMiddleware(generalLimiter);
const generalProtectedRateLimit = createRateLimitMiddleware(
  generalProtectedLimiter,
);

/**
 * Base procedure with timing middleware (for development delays)
 */
const baseProcedure = t.procedure.use(timingMiddleware);

/**
 * Public procedure with general rate limiting.
 * Rate limit: 10 requests per minute.
 *
 * Middleware order:
 * 1. Timing middleware (for development)
 * 2. Rate limit middleware - checks rate limit, stores info in context
 *
 * The procedure handler receives a context with rate limit state.
 * Use `createPublicHandler` to wrap your handler with proper response formatting.
 */
export const generalProcedure = baseProcedure.use(generalRateLimit);

/**
 * Protected procedure with rate limiting.
 * Rate limit: 5 requests per minute.
 *
 * Middleware order:
 * 1. Rate limit middleware - checks rate limit FIRST, stores info in context
 * 2. Protected middleware - checks auth, stores auth state in context
 *
 * This order ensures that even unauthorized requests count against rate limit.
 * Use `createProtectedHandler` to wrap your handler with proper response formatting.
 */
export const generalProtectedProcedure = baseProcedure
  .use(generalProtectedRateLimit)
  .use(protectedMiddleware);

/**
 * Extracts the rate limit info from context, with fallback to default
 */
function getRateLimitInfo(ctx: {
  rateLimitInfo?: RateLimitInfo;
}): RateLimitInfo {
  return ctx.rateLimitInfo ?? createDefaultRateLimitInfo();
}

/**
 * Wraps a public handler to handle rate limit checks and response formatting.
 * Returns the standardized ApiResponse format with rate limit info.
 *
 * @example
 * ```ts
 * getPublicMessage: generalProcedure.mutation(
 *   createPublicHandler(async ({ ctx, input }) => {
 *     return {
 *       data: { message: "Hello world" },
 *       message: "Success",
 *     };
 *   }),
 * ),
 * ```
 */
export function createPublicHandler<
  TCtx extends { rateLimitInfo?: RateLimitInfo; rateLimitExceeded?: boolean },
  TInput,
  TOutput,
>(
  handler: (opts: { ctx: TCtx; input: TInput }) => Promise<{
    data: TOutput;
    message?: string;
  }>,
): (opts: { ctx: TCtx; input: TInput }) => Promise<ApiResponse<TOutput>> {
  return async (opts) => {
    const { ctx } = opts;
    const rateLimitInfo = getRateLimitInfo(ctx);

    // Check if rate limit exceeded
    if (ctx.rateLimitExceeded) {
      return createRateLimitExceededResponse(
        rateLimitInfo,
      ) as ApiResponse<TOutput>;
    }

    // Call the actual handler
    const result = await handler(opts);

    return createSuccessResponse(
      result.data,
      rateLimitInfo,
      result.message ?? "Success",
    );
  };
}

/**
 * Wraps a protected handler to handle rate limit/auth checks and response formatting.
 * Returns the standardized ApiResponse format with rate limit info.
 *
 * @example
 * ```ts
 * getProtectedMessage: generalProtectedProcedure.mutation(
 *   createProtectedHandler(async ({ ctx, input }) => {
 *     return {
 *       data: { message: `Hello ${ctx.session.user.name}!` },
 *       message: "Success",
 *     };
 *   }),
 * ),
 * ```
 */
export function createProtectedHandler<
  TCtx extends {
    rateLimitInfo?: RateLimitInfo;
    rateLimitExceeded?: boolean;
    isAuthenticated?: boolean;
    session?: { user: { id: string; email: string; name: string } };
  },
  TInput,
  TOutput,
>(
  handler: (opts: {
    ctx: TCtx & {
      session: { user: { id: string; email: string; name: string } };
    };
    input: TInput;
  }) => Promise<{
    data: TOutput;
    message?: string;
  }>,
): (opts: { ctx: TCtx; input: TInput }) => Promise<ApiResponse<TOutput>> {
  return async (opts) => {
    const { ctx } = opts;
    const rateLimitInfo = getRateLimitInfo(ctx);

    // Check if rate limit exceeded
    if (ctx.rateLimitExceeded) {
      return createRateLimitExceededResponse(
        rateLimitInfo,
      ) as ApiResponse<TOutput>;
    }

    // Check if authenticated
    if (!ctx.isAuthenticated || !ctx.session?.user) {
      return createUnauthorizedResponse(rateLimitInfo) as ApiResponse<TOutput>;
    }

    // Call the actual handler with guaranteed session
    const result = await handler(
      opts as {
        ctx: TCtx & {
          session: { user: { id: string; email: string; name: string } };
        };
        input: TInput;
      },
    );

    return createSuccessResponse(
      result.data,
      rateLimitInfo,
      result.message ?? "Success",
    );
  };
}
