/**
 * =====================================================
 * Communication Section Overview
 * مركز الإشعارات والتواصل داخل لوحة التحكم.
 * =====================================================
 */

import { AdminCommunicationOverviewPage } from "@/shared/admin/components/AdminCommunicationOverviewPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminCommunicationPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminCommunicationPage({ params }: AdminCommunicationPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminCommunicationOverviewPage locale={locale} />;
}
