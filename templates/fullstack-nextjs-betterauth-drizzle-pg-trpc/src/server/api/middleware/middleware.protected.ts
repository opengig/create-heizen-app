import { middleware } from "../trpc";

/**
 * Auth state stored in context
 */
export type AuthState = {
  isAuthenticated: boolean;
};

/**
 * Protected middleware that checks for authentication.
 * This middleware:
 * 1. Checks if user is authenticated
 * 2. Stores auth state in context
 * 3. Always calls next() - the procedure handles returning appropriate response
 *
 * Note: This middleware should run AFTER rate limit middleware so that
 * rate limit info is available in context for error responses.
 */
export const protectedMiddleware = middleware(async ({ ctx, next }) => {
  const isAuthenticated = !!ctx.session?.user;

  if (isAuthenticated && ctx.session?.user) {
    // User is authenticated, continue with guaranteed user in session
    return next({
      ctx: {
        ...ctx,
        isAuthenticated: true,
        session: {
          ...ctx.session,
          user: ctx.session.user,
        },
      },
    });
  }

  // User is not authenticated - still continue but mark as not authenticated
  // The procedure will handle returning the appropriate error response
  return next({
    ctx: {
      ...ctx,
      isAuthenticated: false,
    },
  });
});
