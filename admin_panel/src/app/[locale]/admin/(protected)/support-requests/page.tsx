/**
 * =====================================================
 * صفحة طلبات الدعم
 * استقبال طلبات الدعم القادمة من الموقع العام ومتابعتها
 * =====================================================
 */

import { AdminCustomerTabs } from "@/shared/admin/components/AdminCustomerTabs";
import { AdminSupportRequestsPage } from "@/shared/admin/components/AdminSupportRequestsPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return (
    <div className="grid gap-5">
      <AdminCustomerTabs locale={locale} activeKey="support-requests" />
      <AdminSupportRequestsPage locale={locale} />
    </div>
  );
}
