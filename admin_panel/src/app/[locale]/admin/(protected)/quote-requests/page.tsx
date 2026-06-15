/**
 * =====================================================
 * صفحة طلبات المشاريع
 * استقبال الطلبات الجديدة القادمة من نموذج الموقع العام ومتابعتها كـ CRM مصغّر
 * =====================================================
 */

import { AdminCustomerTabs } from "@/shared/admin/components/AdminCustomerTabs";
import { AdminProjectRequestsPage } from "@/shared/admin/components/AdminProjectRequestsPage";
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

  return (
    <div className="grid gap-5">
      <AdminCustomerTabs locale={locale} activeKey="quote-requests" />
      <AdminProjectRequestsPage locale={locale} labels={dict.adminProjectRequests} />
    </div>
  );
}
