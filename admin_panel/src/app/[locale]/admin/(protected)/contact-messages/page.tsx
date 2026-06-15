/**
 * =====================================================
 * صفحة رسائل التواصل
 * استقبال رسائل نموذج التواصل من الموقع العام ومتابعتها
 * =====================================================
 */

import { AdminContactMessagesPage } from "@/shared/admin/components/AdminContactMessagesPage";
import { AdminCustomerTabs } from "@/shared/admin/components/AdminCustomerTabs";
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
      <AdminCustomerTabs locale={locale} activeKey="contact-messages" />
      <AdminContactMessagesPage locale={locale} />
    </div>
  );
}
