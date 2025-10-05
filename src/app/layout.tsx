"use client";
import { Roboto } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { type ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/lib/trpc/client";
import type { AppRouter } from "@/lib/trpc/router";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const queryClient = makeQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        splitLink({
          condition: (op) => isNonJsonSerializable(op.input),
          true: httpLink({
            url: "http://localhost:3000/api/trpc",
          }),
          false: httpBatchLink({
            url: "http://localhost:3000/api/trpc",
          }),
        }),
      ],
    }),
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased md:h-screen`}>
        <QueryClientProvider client={queryClient}>
          <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              forcedTheme="light"
              disableTransitionOnChange
            >
              <main className="h-full">{children}</main>
            </ThemeProvider>

            <Toaster position="bottom-right" richColors />
          </TRPCProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
