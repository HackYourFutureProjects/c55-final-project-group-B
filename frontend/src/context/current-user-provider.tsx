"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types";

// The JSESSIONID cookie is HttpOnly and the backend has no "who am I"
// endpoint yet, so the login response cached in localStorage is the
// frontend's only notion of being logged in. It is written at login and
// cleared at logout; if the server session expires before that, the first
// 401/403 from a protected endpoint is the signal to clear it.
const STORAGE_KEY = "flint.current-user";

type CurrentUserContextValue = {
  user: User | null;
  // True until the first client render has read localStorage. Consumers
  // should render a placeholder while loading, so the server and client
  // agree on the initial markup.
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

function readStoredUser(): User | null {
  // try/catch covers both malformed JSON and browsers that block storage.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as User | null;
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage only exists in the browser, so the stored user is read
  // after mount instead of during the initial render.
  useEffect(() => {
    setUserState(readStoredUser());
    setIsLoading(false);
  }, []);

  function setUser(next: User) {
    setUserState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage being unavailable only loses the cache across reloads.
    }
  }

  function clearUser() {
    setUserState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Same as above: nothing else to do.
    }
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
