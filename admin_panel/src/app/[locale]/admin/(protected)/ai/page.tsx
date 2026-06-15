/**
 * =====================================================
 * AI Assistant Page
 * =====================================================
 */

import { AdminAiSettingsPage } from "@/shared/admin/components/AdminAiSettingsPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type AiPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AiPage({ params }: AiPageProps) {
  const { locale } = await params;
  return <AdminAiSettingsPage locale={locale as Locale} />;
}
