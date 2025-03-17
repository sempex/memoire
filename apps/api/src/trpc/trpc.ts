import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "..";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

const t = initTRPC.context<Context>().create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
  }
  return next();
});
export const middleware = t.middleware;
