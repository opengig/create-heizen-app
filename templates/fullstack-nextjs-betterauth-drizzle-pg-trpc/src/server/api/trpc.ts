import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { auth } from "../better-auth";
import type { RateLimitInfo } from "./types";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });
  return {
    db,
    session,
    // Rate limit state (set by rate limit middleware)
    rateLimitInfo: undefined as RateLimitInfo | undefined,
    rateLimitExceeded: false,
    // Auth state (set by protected middleware)
    isAuthenticated: !!session?.user,
    ...opts,
  };
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

// Export middleware
export const middleware = t.middleware;
