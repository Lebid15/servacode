/**
 * =====================================================
 * صفحة استعادة كلمة مرور لوحة الأدمن
 * =====================================================
 */

export const dynamic = "force-dynamic";

import { AdminResetPasswordPage } from "./AdminResetPasswordPage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return (
    <AdminResetPasswordPage
      locale={locale}
      labels={{
        title: dict.auth.resetPasswordTitle,
        description: dict.auth.resetPasswordDescription,
        newPassword: dict.auth.newPassword,
        confirmPassword: dict.auth.confirmPassword,
        save: dict.auth.saveNewPassword,
        saving: dict.auth.savingNewPassword,
        success: dict.auth.resetPasswordSuccess,
        mismatch: dict.auth.passwordMismatch,
        invalidToken: dict.auth.invalidResetToken,
        backToLogin: dict.auth.backToLogin
      }}
    />
  );
}
