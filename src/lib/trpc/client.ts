import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/lib/trpc/router";

export const {
  TRPCProvider: TRPCProvider,
  useTRPC: useTRPC,
  useTRPCClient: useTRPCClient,
} = createTRPCContext<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
