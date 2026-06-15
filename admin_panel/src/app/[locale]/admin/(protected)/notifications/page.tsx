/**
 * =====================================================
 * صفحة الإشعارات
 * =====================================================
 */

import { AdminNotificationsPage } from "@/shared/admin/components/AdminNotificationsPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminNotificationsPage locale={locale} />;
}
