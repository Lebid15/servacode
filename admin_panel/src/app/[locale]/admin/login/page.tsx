/**
 * =====================================================
 * صفحة تسجيل دخول لوحة الأدمن
 * تجمع النصوص من ملفات الترجمة وتستدعي Client Component
 * =====================================================
 */

export const dynamic = "force-dynamic";

import { AdminLoginPage } from "./AdminLoginPage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type LoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return (
    <AdminLoginPage
      locale={locale}
      labels={{
        brand: dict.admin.brand,
        panel: dict.admin.panel,
        title: dict.auth.loginTitle,
        description: dict.auth.loginDescription,
        username: dict.auth.username,
        password: dict.auth.password,
        usernamePlaceholder: dict.auth.usernamePlaceholder,
        passwordPlaceholder: dict.auth.passwordPlaceholder,
        button: dict.auth.loginButton,
        loading: dict.auth.loginLoading,
        failed: dict.auth.loginFailed,
        showPassword: dict.auth.showPassword,
        hidePassword: dict.auth.hidePassword,
        secureNotice: dict.auth.secureNotice,
        rememberMe: dict.auth.rememberMe,
        forgotPassword: dict.auth.forgotPassword,
        backToLogin: dict.auth.backToLogin,
        forgotTitle: dict.auth.forgotTitle,
        forgotDescription: dict.auth.forgotDescription,
        accountEmailOrUsername: dict.auth.accountEmailOrUsername,
        accountEmailOrUsernamePlaceholder: dict.auth.accountEmailOrUsernamePlaceholder,
        sendResetLink: dict.auth.sendResetLink,
        sendingResetLink: dict.auth.sendingResetLink,
        resetEmailSent: dict.auth.resetEmailSent,
        developmentResetLink: dict.auth.developmentResetLink,
        switchLanguage: dict.actions.switchLanguage,
        switchTheme: dict.actions.switchTheme,
        themes: dict.themes
      }}
    />
  );
}
