/**
 * =====================================================
 * صفحة سجل العمليات
 * =====================================================
 */

import { AdminAuditLogsPage } from "@/shared/admin/components/AdminAuditLogsPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminAuditLogsPage locale={locale} />;
}
