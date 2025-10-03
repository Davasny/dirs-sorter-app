import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

type ContextOptions = object;

export function createContext(_opts?: ContextOptions) {
  return async ({ req }: FetchCreateContextFnOptions) => {
    return {};
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
export const router = t.router;

export const publicProcedure = t.procedure;
