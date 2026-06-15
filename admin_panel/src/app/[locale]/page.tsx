/**
 * =====================================================
 * صفحة اللغة في لوحة الأدمن
 * تحول المستخدم إلى تسجيل الدخول
 * =====================================================
 */

import { redirect } from "next/navigation";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleIndexPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  redirect(`/${locale}/admin/login`);
}
