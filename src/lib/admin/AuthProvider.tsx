"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { bootstrapSession, login as apiLogin, logout as apiLogout } from "./auth";
import { onSessionEnded } from "./authClient";
import type { AuthUser } from "./permissions";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const booted = useRef(false);

  // Restore a session from the HttpOnly refresh cookie once on mount.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    bootstrapSession()
      .then((restored) => {
        setUserState(restored);
        setStatus(restored ? "authenticated" : "unauthenticated");
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  // If a refresh fails mid-session, the client signals here → force re-login.
  useEffect(() => {
    onSessionEnded(() => {
      setUserState(null);
      setStatus("unauthenticated");
      qc.clear();
    });
  }, [qc]);

  const login = useCallback(async (email: string, password: string) => {
    const authed = await apiLogin(email, password);
    setUserState(authed);
    setStatus("authenticated");
    return authed;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUserState(null);
    setStatus("unauthenticated");
    qc.clear();
  }, [qc]);

  const setUser = useCallback((next: AuthUser) => setUserState(next), []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
