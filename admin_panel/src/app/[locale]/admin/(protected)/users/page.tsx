/**
 * =====================================================
 * صفحة مستخدمي لوحة الأدمن
 * إدارة المستخدمين والأدوار وحالة الحسابات
 * =====================================================
 */

import { AdminUsersPage } from "@/shared/admin/components/AdminUsersPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminUsersPage locale={locale} />;
}
