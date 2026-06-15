/**
 * =====================================================
 * أنواع مصادقة لوحة الأدمن
 * =====================================================
 */

import type { AuthResponse, AuthUser, LoginPayload, TokenPair } from "@/shared/api/auth-client";

export type AdminAuthState = {
  user: AuthUser | null;
  tokens: TokenPair | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AdminAuthContextValue = AdminAuthState & {
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => void;
  setSession: (response: AuthResponse) => void;
  updateUser: (user: AuthUser) => void;
};
