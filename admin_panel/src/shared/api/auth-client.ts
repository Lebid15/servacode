/**
 * =====================================================
 * Auth Client
 * طلبات المصادقة الخاصة بلوحة الأدمن
 * =====================================================
 */

import { apiRequest } from "./api-client";

export type LoginPayload = {
  username: string;
  password: string;
  remember_me?: boolean;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  remember_me?: boolean;
};

export type AuthUserRole = {
  id: string;
  name: string;
  display_name_ar: string;
  display_name_en: string;
  permissions: string[];
};

export type AuthUser = {
  id: string;
  full_name: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  preferred_locale?: string | null;
  preferred_theme?: string | null;
  status: string;
  is_superuser: boolean;
  role?: AuthUserRole | null;
};

export type AuthResponse = {
  tokens: TokenPair;
  user: AuthUser;
};

export type PublicBrandingSettings = {
  site_name_ar?: string | null;
  site_name_en?: string | null;
  company_description_ar?: string | null;
  company_description_en?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  site_icon_url?: string | null;
  icon_url?: string | null;
  brand_icon_url?: string | null;
};

export function getPublicBrandingSettings() {
  return apiRequest<PublicBrandingSettings>("/public/settings", {
    cache: "no-store"
  });
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<AuthUser>("/auth/me", {
    token
  });
}

export function requestPasswordReset(identifier: string) {
  return apiRequest<{ accepted: boolean; email_sent: boolean; development_reset_url?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ identifier })
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ password_reset: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword })
  });
}

export type ProfileUpdatePayload = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  preferred_locale?: string | null;
  preferred_theme?: string | null;
};

export type PasswordChangePayload = {
  current_password: string;
  new_password: string;
};

export function updateCurrentUserProfile(token: string, payload: ProfileUpdatePayload) {
  return apiRequest<AuthUser>("/users/me/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function changeCurrentUserPassword(token: string, payload: PasswordChangePayload) {
  return apiRequest<Record<string, unknown>>("/users/me/password", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}
