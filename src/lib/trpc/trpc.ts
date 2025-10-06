import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from 'superjson';

type ContextOptions = object;

export function createContext(_opts?: ContextOptions) {
  return async ({ req }: FetchCreateContextFnOptions) => {
    return {
      headers: req.headers,
    };
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
export const router = t.router;

export const publicProcedure = t.procedure;
