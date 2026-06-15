/**
 * =====================================================
 * صفحة إدارة الخدمات
 * تعرض صفحة مخصصة بدل CRUD عام لأن الخدمات تؤثر مباشرة على الموقع العام
 * =====================================================
 */

import { AdminServicesPage } from "@/shared/admin/components/AdminServicesPage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return <AdminServicesPage locale={locale} labels={dict.adminServices} tableLabels={dict.table} />;
}
