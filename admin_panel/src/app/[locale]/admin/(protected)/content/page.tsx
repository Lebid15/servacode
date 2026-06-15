/**
 * =====================================================
 * Content Management Overview
 * مركز إدارة المحتوى بدل التحويل المباشر إلى الخدمات.
 * =====================================================
 */

import { AdminContentManagementPage } from "@/shared/admin/components/AdminContentManagementPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminContentPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminContentPage({ params }: AdminContentPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminContentManagementPage locale={locale} />;
}
