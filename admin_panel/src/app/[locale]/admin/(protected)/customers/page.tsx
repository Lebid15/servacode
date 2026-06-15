/**
 * =====================================================
 * صفحة مركز الطلبات والعملاء
 * نظرة عامة عملية بدل التحويل المباشر إلى طلبات المشاريع.
 * =====================================================
 */

import { AdminCustomerTabs } from "@/shared/admin/components/AdminCustomerTabs";
import { AdminCustomersOverviewPage } from "@/shared/admin/components/AdminCustomersOverviewPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type AdminCustomersPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminCustomersPage({ params }: AdminCustomersPageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return (
    <div className="grid gap-5">
      <AdminCustomerTabs locale={locale} activeKey="customers" />
      <AdminCustomersOverviewPage locale={locale} />
    </div>
  );
}
