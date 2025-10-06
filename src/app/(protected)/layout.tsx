import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { UserProvider } from "@/features/auth/components/user-provider";
import { auth } from "@/features/auth/lib/auth";

export default async function Layout({
                                       children,
                                     }: Readonly<{
  children: ReactNode;
}>) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({headers: reqHeaders});

  if (!session) {
    redirect("/signin");
  }

  if (typeof window !== "undefined") {
    throw Error("This component should be used on client side");
  }

  return (
    <UserProvider user={session.user}>
      {children}
    </UserProvider>
  );
}
