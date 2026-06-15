/**
 * =====================================================
 * تحويل صفحة admin إلى dashboard
 * =====================================================
 */

import { redirect } from "next/navigation";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminIndexPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminIndexPage({ params }: AdminIndexPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  redirect(`/${locale}/admin/dashboard`);
}
