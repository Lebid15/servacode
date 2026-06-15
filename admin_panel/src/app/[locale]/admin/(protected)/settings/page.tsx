/**
 * =====================================================
 * مركز إعدادات لوحة الإدارة
 * =====================================================
 */

import { AdminSettingsOverviewPage } from "@/shared/admin/components/AdminSettingsOverviewPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type SettingsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale: rawLocale } = await params;

  return <AdminSettingsOverviewPage locale={rawLocale as Locale} />;
}
