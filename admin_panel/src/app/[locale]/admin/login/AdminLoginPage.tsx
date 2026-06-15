"use client";

/**
 * =====================================================
 * AdminLoginPage
 * شاشة دخول لوحة التحكم مع تذكرني واستعادة كلمة المرور بالبريد.
 * =====================================================
 */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getPublicBrandingSettings, requestPasswordReset, type PublicBrandingSettings } from "@/shared/api/auth-client";
import { ApiClientError } from "@/shared/api/api-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLogo } from "@/shared/design-system/components/AppLogo";
import { LanguageSwitcher } from "@/shared/design-system/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/shared/design-system/components/ThemeSwitcher";
import type { ThemeName } from "@/shared/design-system/themes/theme-provider";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminLoginLabels = {
  brand: string;
  panel: string;
  title: string;
  description: string;
  username: string;
  password: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  button: string;
  loading: string;
  failed: string;
  showPassword: string;
  hidePassword: string;
  secureNotice: string;
  switchLanguage: string;
  switchTheme: string;
  themes: Record<ThemeName, string>;
  rememberMe: string;
  forgotPassword: string;
  backToLogin: string;
  forgotTitle: string;
  forgotDescription: string;
  accountEmailOrUsername: string;
  accountEmailOrUsernamePlaceholder: string;
  sendResetLink: string;
  sendingResetLink: string;
  resetEmailSent: string;
  developmentResetLink: string;
};

type AdminLoginPageProps = {
  locale: Locale;
  labels: AdminLoginLabels;
};

function localizedValue(locale: Locale, ar?: string | null, en?: string | null, fallback = "") {
  const primary = locale === "ar" ? ar : en;
  const secondary = locale === "ar" ? en : ar;
  return primary?.trim() || secondary?.trim() || fallback;
}

export function AdminLoginPage({ locale, labels }: AdminLoginPageProps) {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [branding, setBranding] = useState<PublicBrandingSettings | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [developmentResetUrl, setDevelopmentResetUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getPublicBrandingSettings()
      .then((settings) => {
        if (isMounted) {
          setBranding(settings);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBranding(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const brandTitle = useMemo(
    () => localizedValue(locale, branding?.site_name_ar, branding?.site_name_en, labels.brand),
    [branding?.site_name_ar, branding?.site_name_en, labels.brand, locale],
  );

  const brandSubtitle = useMemo(
    () => localizedValue(locale, branding?.company_description_ar, branding?.company_description_en, labels.panel),
    [branding?.company_description_ar, branding?.company_description_en, labels.panel, locale],
  );

  const brandLogoUrl =
    branding?.logo_url ||
    branding?.favicon_url ||
    branding?.site_icon_url ||
    branding?.icon_url ||
    branding?.brand_icon_url ||
    null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await login({ username: username.trim(), password, remember_me: rememberMe });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("company-admin-session", JSON.stringify(response));
      }

      router.replace(`/${locale}/admin/dashboard`);

      window.setTimeout(() => {
        if (window.location.pathname.endsWith("/admin/login")) {
          window.location.assign(`/${locale}/admin/dashboard`);
        }
      }, 150);
    } catch (error) {
      console.error("ADMIN_LOGIN_ERROR", error);
      const message = error instanceof ApiClientError ? error.message : labels.failed;
      setError(message || labels.failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResetMessage(null);
    setDevelopmentResetUrl(null);

    try {
      const response = await requestPasswordReset(resetIdentifier.trim());
      setResetMessage(labels.resetEmailSent);
      if (response.development_reset_url) {
        setDevelopmentResetUrl(response.development_reset_url);
      }
    } catch (error) {
      console.error("ADMIN_FORGOT_PASSWORD_ERROR", error);
      const message = error instanceof ApiClientError ? error.message : labels.failed;
      setError(message || labels.failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden px-5 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 start-10 h-72 w-72 rounded-full bg-app-primary/15 blur-3xl" />
        <div className="absolute bottom-0 end-0 h-96 w-96 rounded-full bg-app-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-app-border/60" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center justify-end gap-2">
          <LanguageSwitcher locale={locale} label={labels.switchLanguage} />
          <ThemeSwitcher label={labels.switchTheme} labels={labels.themes} />
        </div>

        <section className="grid flex-1 place-items-center py-10">
          <AppCard className="w-full max-w-[470px] border-app-border/80 bg-app-surface/95 p-6 shadow-appCard sm:p-8">
            <div className="mb-8 grid gap-7">
              <AppLogo title={brandTitle} subtitle={brandSubtitle} logoUrl={brandLogoUrl} />

              <div className="grid gap-2.5 text-center sm:text-start">
                <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs font-bold text-app-primary sm:mx-0">
                  <AppIcon name="lock" size={14} />
                  {labels.secureNotice}
                </span>
                <h1 className="text-3xl font-black tracking-tight text-app-foreground sm:text-4xl">
                  {isForgotMode ? labels.forgotTitle : labels.title}
                </h1>
                <p className="text-sm font-semibold leading-6 text-app-muted">
                  {isForgotMode ? labels.forgotDescription : labels.description}
                </p>
              </div>
            </div>

            {isForgotMode ? (
              <form className="grid gap-5" onSubmit={handlePasswordResetRequest}>
                <AppInput
                  label={labels.accountEmailOrUsername}
                  placeholder={labels.accountEmailOrUsernamePlaceholder}
                  value={resetIdentifier}
                  onChange={(event) => setResetIdentifier(event.target.value)}
                  autoComplete="username"
                  startIcon={<AppIcon name="email" size={18} />}
                  className="h-12 font-semibold"
                  required
                />

                {resetMessage ? (
                  <div className="rounded-appMd border border-app-success/30 bg-app-success/10 px-4 py-3 text-sm font-semibold leading-6 text-app-success">
                    {resetMessage}
                  </div>
                ) : null}

                {developmentResetUrl ? (
                  <div className="rounded-appMd border border-app-warning/30 bg-app-warning/10 px-4 py-3 text-xs font-semibold leading-6 text-app-foreground">
                    <p className="mb-2 font-black text-app-warning">{labels.developmentResetLink}</p>
                    <a href={developmentResetUrl} className="break-all text-app-primary underline" target="_blank" rel="noreferrer">
                      {developmentResetUrl}
                    </a>
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-appMd border border-app-danger/30 bg-app-danger/10 px-4 py-3 text-sm font-semibold leading-6 text-app-danger">
                    {error}
                  </div>
                ) : null}

                <AppButton type="submit" disabled={isSubmitting || !resetIdentifier.trim()} icon={<AppIcon name={isSubmitting ? "loader" : "email"} size={18} className={isSubmitting ? "animate-spin" : undefined} />} className="min-h-12 rounded-appLg text-base">
                  {isSubmitting ? labels.sendingResetLink : labels.sendResetLink}
                </AppButton>
                <button type="button" className="text-sm font-black text-app-primary hover:underline" onClick={() => { setIsForgotMode(false); setError(null); }}>
                  {labels.backToLogin}
                </button>
              </form>
            ) : (
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <AppInput
                  label={labels.username}
                  placeholder={labels.usernamePlaceholder}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  startIcon={<AppIcon name="user" size={18} />}
                  className="h-12 font-semibold"
                  required
                />

                <AppInput
                  label={labels.password}
                  placeholder={labels.passwordPlaceholder}
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  startIcon={<AppIcon name="lock" size={18} />}
                  endAction={
                    <button
                      type="button"
                      aria-label={isPasswordVisible ? labels.hidePassword : labels.showPassword}
                      title={isPasswordVisible ? labels.hidePassword : labels.showPassword}
                      className="grid size-8 place-items-center rounded-appMd text-app-muted transition hover:bg-app-surfaceElevated hover:text-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/30"
                      onClick={() => setIsPasswordVisible((current) => !current)}
                    >
                      <AppIcon name={isPasswordVisible ? "eyeOff" : "eye"} size={18} />
                    </button>
                  }
                  className="h-12 font-semibold"
                  required
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-app-muted">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="size-4 rounded border-app-border accent-app-primary"
                    />
                    {labels.rememberMe}
                  </label>
                  <button type="button" className="text-sm font-black text-app-primary hover:underline" onClick={() => { setIsForgotMode(true); setError(null); setResetMessage(null); }}>
                    {labels.forgotPassword}
                  </button>
                </div>

                {error ? (
                  <div className="rounded-appMd border border-app-danger/30 bg-app-danger/10 px-4 py-3 text-sm font-semibold leading-6 text-app-danger">
                    {error}
                  </div>
                ) : null}

                <AppButton
                  type="submit"
                  disabled={isSubmitting}
                  icon={<AppIcon name={isSubmitting ? "loader" : "login"} size={18} className={isSubmitting ? "animate-spin" : undefined} />}
                  className="min-h-12 rounded-appLg text-base"
                >
                  {isSubmitting ? labels.loading : labels.button}
                </AppButton>
              </form>
            )}
          </AppCard>
        </section>
      </div>
    </main>
  );
}
