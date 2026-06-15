/**
 * =====================================================
 * صفحة الأدوار والصلاحيات
 * إدارة الأدوار وتوزيع صلاحيات لوحة الأدمن
 * =====================================================
 */

import { AdminRolesPage } from "@/shared/admin/components/AdminRolesPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminRolesPage locale={locale} />;
}
