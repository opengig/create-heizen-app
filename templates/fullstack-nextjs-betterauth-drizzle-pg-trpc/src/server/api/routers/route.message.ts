import { createTRPCRouter } from "~/server/api/trpc";

// procedure and handlers
import {
  generalProcedure,
  generalProtectedProcedure,
  createPublicHandler,
  createProtectedHandler,
} from "../procedure";

export const messageRouter = createTRPCRouter({
  getPublicMessage: generalProcedure.mutation(
    createPublicHandler(async () => {
      return {
        data: {
          message: "This is a public message.",
        },
        error: null,
        message: "Public message retrieved successfully",
      };
    }),
  ),

  getProtectedMessage: generalProtectedProcedure.mutation(
    createProtectedHandler(async ({ ctx }) => {
      return {
        data: {
          message: `Hello ${ctx.session.user.name}! This is a protected message.`,
        },
        error: null,
        message: "Protected message retrieved successfully",
      };
    }),
  ),
});
