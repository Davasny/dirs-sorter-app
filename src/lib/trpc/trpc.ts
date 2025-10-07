import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { z } from "zod";
import { auth } from "@/features/auth/lib/auth";
import { checkUserProjectAccess } from "@/features/auth/utils/check-user-project-access";

type ContextOptions = object;

export function createContext(_opts?: ContextOptions) {
  return async ({ req }: FetchCreateContextFnOptions) => {
    const session = await auth.api.getSession({ headers: req.headers });

    return {
      user: session?.user || null,
      headers: req.headers,
    };
  };
}

export type Context = Awaited<ReturnType<ReturnType<typeof createContext>>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const projectProcedure = protectedProcedure
  .input(z.object({ projectId: z.uuidv7() }))
  .use(async ({ ctx, next, input }) => {
    // if input has no projectId, throw error
    if (!input || typeof input !== "object" || !("projectId" in input)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing projectId in input",
        cause: input,
      });
    }

    const { projectId } = input as { projectId: string };
    const hasAccess = await checkUserProjectAccess({
      userId: ctx.user.id,
      projectId,
    });

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No access to this project",
      });
    }

    return next({ ctx });
  });
