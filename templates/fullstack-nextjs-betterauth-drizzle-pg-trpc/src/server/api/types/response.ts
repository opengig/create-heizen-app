/**
 * Rate limit information attached to every API response
 */
export type RateLimitInfo = {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** ISO timestamp when the rate limit window resets */
  reset: string;
  /** Seconds until the rate limit window resets */
  retryAfter: number;
};

/**
 * Standard API response format without rate limit info
 * This is what procedures return internally
 */
export type ApiResponseData<T> = {
  data: T | null;
  error: string | null;
  message: string;
};

/**
 * Final API response format with rate limit info
 * This is what the frontend receives
 */
export type ApiResponse<T> = ApiResponseData<T> & {
  rateLimit: RateLimitInfo;
};

/**
 * Error codes that can be returned in the error field
 */
export type ApiErrorCode =
  | "TOO_MANY_REQUESTS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

/**
 * Context with rate limit state (set by rate limit middleware)
 */
export type RateLimitContext = {
  rateLimitInfo: RateLimitInfo;
  rateLimitExceeded: boolean;
};

/**
 * Context with auth state (set by protected middleware)
 */
export type AuthContext = {
  isAuthenticated: boolean;
};

/**
 * Create a default rate limit info object
 */
export function createDefaultRateLimitInfo(): RateLimitInfo {
  return {
    limit: 0,
    remaining: 0,
    reset: new Date().toISOString(),
    retryAfter: 0,
  };
}

/**
 * Helper to create a success response with rate limit info
 */
export function createSuccessResponse<T>(
  data: T,
  rateLimitInfo: RateLimitInfo,
  message = "Success",
): ApiResponse<T> {
  return {
    data,
    error: null,
    message,
    rateLimit: rateLimitInfo,
  };
}

/**
 * Helper to create an error response with rate limit info
 */
export function createErrorResponse(
  error: ApiErrorCode | string,
  message: string,
  rateLimitInfo: RateLimitInfo,
): ApiResponse<null> {
  return {
    data: null,
    error,
    message,
    rateLimit: rateLimitInfo,
  };
}

/**
 * Helper to create rate limit exceeded error response
 */
export function createRateLimitExceededResponse(
  rateLimitInfo: RateLimitInfo,
): ApiResponse<null> {
  return createErrorResponse(
    "TOO_MANY_REQUESTS",
    `Rate limit exceeded. Please try again in ${rateLimitInfo.retryAfter} seconds.`,
    rateLimitInfo,
  );
}

/**
 * Helper to create unauthorized error response
 */
export function createUnauthorizedResponse(
  rateLimitInfo: RateLimitInfo,
): ApiResponse<null> {
  return createErrorResponse(
    "UNAUTHORIZED",
    "You must be logged in to access this resource.",
    rateLimitInfo,
  );
}
