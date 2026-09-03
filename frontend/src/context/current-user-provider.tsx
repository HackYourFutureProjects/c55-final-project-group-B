"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/types";

type CurrentUserContextValue = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setUserState(await getCurrentUser());
      } catch {
        // If /me can't be reached, treat it as logged out.
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  function setUser(next: User) {
    setUserState(next);
  }

  function clearUser() {
    setUserState(null);
  }

  return (
    <CurrentUserContext.Provider
      value={{ user, isLoading, setUser, clearUser }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used inside a CurrentUserProvider");
  }
  return context;
}
