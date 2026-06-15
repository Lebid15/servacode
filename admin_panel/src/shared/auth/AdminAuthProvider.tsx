"use client";

/**
 * =====================================================
 * AdminAuthProvider
 * يدير جلسة لوحة الأدمن ويحفظ التوكنات في localStorage
 * =====================================================
 */

import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  login as loginRequest,
  type AuthResponse,
  type AuthUser,
  type LoginPayload,
  type TokenPair
} from "@/shared/api/auth-client";
import type { AdminAuthContextValue } from "./admin-auth-types";

const STORAGE_KEY = "company-admin-session";

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type StoredSession = {
  tokens: TokenPair;
  user: AuthUser;
};

type AdminAuthProviderProps = {
  children: React.ReactNode;
};

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setTokens(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const setSession = (response: AuthResponse) => {
    setUser(response.user);
    setTokens(response.tokens);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: response.user,
        tokens: response.tokens
      })
    );
  };

  const login = async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    setSession(response);
    return response;
  };

  const updateUser = (nextUser: AuthUser) => {
    setUser(nextUser);

    if (tokens) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: nextUser,
          tokens
        })
      );
    }
  };

  const logout = () => {
    clearSession();
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as StoredSession;

        if (!parsed?.tokens?.access_token || !parsed?.user) {
          clearSession();
          return;
        }

        setTokens(parsed.tokens);
        setUser(parsed.user);

        try {
          const freshUser = await getCurrentUser(parsed.tokens.access_token);
          setUser(freshUser);
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: freshUser,
              tokens: parsed.tokens
            })
          );
        } catch (error) {
          console.warn("ADMIN_SESSION_REFRESH_WARNING", error);
          // نبقي الجلسة المحلية صالحة في بيئة التطوير إذا تعذر تحديث بيانات المستخدم مؤقتًا.
        }
      } catch (error) {
        console.error("ADMIN_SESSION_RESTORE_ERROR", error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value: AdminAuthContextValue = {
    user,
    tokens,
    isLoading,
    isAuthenticated: Boolean(user && tokens?.access_token),
    login,
    logout,
    setSession,
    updateUser
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }

  return context;
}
