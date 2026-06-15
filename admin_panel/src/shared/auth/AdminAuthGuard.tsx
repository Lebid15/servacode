"use client";

/**
 * =====================================================
 * AdminAuthGuard
 * يحمي صفحات لوحة الأدمن ويعيد المستخدم لصفحة تسجيل الدخول عند غياب الجلسة
 * =====================================================
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { useAdminAuth } from "./AdminAuthProvider";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminAuthGuardProps = {
  children: React.ReactNode;
  locale: Locale;
  loadingText: string;
};

export function AdminAuthGuard({ children, locale, loadingText }: AdminAuthGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${locale}/admin/login`);
    }
  }, [isLoading, isAuthenticated, locale, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <AppLoadingState text={loadingText} />
      </main>
    );
  }

  return children;
}
