/**
 * =====================================================
 * صفحة الأسئلة الشائعة المستقلة
 * =====================================================
 */

import { AdminStaticPagesPage } from "@/shared/admin/components/AdminStaticPagesPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return <AdminStaticPagesPage locale={locale} initialPanel="faqs" />;
}
