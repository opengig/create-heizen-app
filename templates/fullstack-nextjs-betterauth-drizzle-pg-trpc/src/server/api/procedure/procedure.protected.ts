import { t } from "../trpc";
import { protectedMiddleware } from "../middleware";

/**
 * Protected procedure that requires authentication.
 * Uses the protectedMiddleware which handles auth checks with never-throw strategy.
 */
export const protectedProcedure = t.procedure.use(protectedMiddleware);
