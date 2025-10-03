import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createContext(),
  });
}

export const runtime = 'nodejs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export { handler as GET, handler as POST };
