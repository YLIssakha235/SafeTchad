import { ORPCError, os } from "@orpc/server";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import type { Context } from "./context";
import { appRouter } from "./routers";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

// Type du client ORPC brut basé sur le vrai appRouter
export type AppRouterClient = RouterClient<typeof appRouter>;

// Petite factory pour figer correctement le type des utils TanStack Query
export function createAppOrpcUtils(client: AppRouterClient) {
  return createTanstackQueryUtils(client);
}


export type AppOrpcUtils = ReturnType<typeof createAppOrpcUtils>;

export * from "./routers/index";
export * from "./services/incident-media";
export * from "./contracts/incident";