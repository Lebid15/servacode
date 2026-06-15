/**
 * =====================================================
 * صفحة إدارة أعمالنا
 * تعرض صفحة مخصصة لإدارة مشاريع الأعمال السابقة بدل CRUD العام
 * =====================================================
 */

import { AdminPortfolioPage } from "@/shared/admin/components/AdminPortfolioPage";
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

  return <AdminPortfolioPage locale={locale} labels={dict.adminPortfolio} tableLabels={dict.table} />;
}
