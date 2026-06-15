"use client";

/**
 * =====================================================
 * AdminResetPasswordPage
 * صفحة تعيين كلمة مرور جديدة عبر رابط الاستعادة.
 * =====================================================
 */

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { resetPassword } from "@/shared/api/auth-client";
import { ApiClientError } from "@/shared/api/api-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminResetPasswordPageProps = {
  locale: Locale;
  labels: {
    title: string;
    description: string;
    newPassword: string;
    confirmPassword: string;
    save: string;
    saving: string;
    success: string;
    mismatch: string;
    invalidToken: string;
    backToLogin: string;
  };
};

export function AdminResetPasswordPage({ locale, labels }: AdminResetPasswordPageProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError(labels.invalidToken);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(labels.mismatch);
      return;
    }

    setIsSaving(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : labels.invalidToken);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 start-10 h-72 w-72 rounded-full bg-app-primary/15 blur-3xl" />
        <div className="absolute bottom-0 end-0 h-96 w-96 rounded-full bg-app-accent/10 blur-3xl" />
      </div>
      <AppCard className="relative z-10 w-full max-w-[460px] border-app-border/80 bg-app-surface/95 p-6 shadow-appCard sm:p-8">
        <div className="mb-7 grid gap-3 text-center sm:text-start">
          <span className="mx-auto grid size-12 place-items-center rounded-appLg border border-app-primary/30 bg-app-primary/12 text-app-primary sm:mx-0">
            <AppIcon name="lock" size={22} />
          </span>
          <h1 className="text-3xl font-black text-app-foreground">{labels.title}</h1>
          <p className="text-sm font-semibold leading-6 text-app-muted">{labels.description}</p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <AppInput
            label={labels.newPassword}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            startIcon={<AppIcon name="lock" size={18} />}
            required
            minLength={8}
          />
          <AppInput
            label={labels.confirmPassword}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            startIcon={<AppIcon name="lock" size={18} />}
            required
            minLength={8}
          />

          {error ? <p className="rounded-appMd border border-app-danger/30 bg-app-danger/10 p-3 text-sm font-bold text-app-danger">{error}</p> : null}
          {success ? <p className="rounded-appMd border border-app-success/30 bg-app-success/10 p-3 text-sm font-bold text-app-success">{labels.success}</p> : null}

          <AppButton type="submit" disabled={isSaving || success} icon={<AppIcon name={isSaving ? "loader" : "save"} size={18} className={isSaving ? "animate-spin" : undefined} />}>
            {isSaving ? labels.saving : labels.save}
          </AppButton>
          <Link href={`/${locale}/admin/login`} className="text-center text-sm font-black text-app-primary hover:underline">
            {labels.backToLogin}
          </Link>
        </form>
      </AppCard>
    </main>
  );
}
