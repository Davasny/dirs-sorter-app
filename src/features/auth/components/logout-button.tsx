"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/lib/auth-client";

export const LogoutButton = () => {
  const {push} = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    push("/");
  };

  return (
    <Button size="xs" variant="ghost" onClick={() => handleLogout()}>
      wyloguj
    </Button>

  )
}