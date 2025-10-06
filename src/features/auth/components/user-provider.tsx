"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { IUser } from "@/features/auth/lib/auth";

const UserContext = createContext<IUser | null>(null);

export function UserProvider({
                               children,
                               user,
                             }: {
  children: ReactNode;
  user: IUser;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): IUser {
  const user = useContext(UserContext);

  if (user === null) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return user;
}
