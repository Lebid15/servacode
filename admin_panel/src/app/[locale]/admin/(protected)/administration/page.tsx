/**
 * =====================================================
 * Administration Overview Page
 * مركز الإدارة: المستخدمون، الأدوار، الصلاحيات، وسجل التدقيق.
 * =====================================================
 */

import { AdminAdministrationOverviewPage } from "@/shared/admin/components/AdminAdministrationOverviewPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  return <AdminAdministrationOverviewPage locale={rawLocale as Locale} />;
}
