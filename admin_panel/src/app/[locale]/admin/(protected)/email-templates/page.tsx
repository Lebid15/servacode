/**
 * =====================================================
 * صفحة قوالب البريد
 * =====================================================
 */

import { AdminEmailTemplatesPage } from "@/shared/admin/components/AdminEmailTemplatesPage";
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
    <AdminEmailTemplatesPage
      title={dict.adminModules.emailTemplates.title}
      description={dict.adminModules.emailTemplates.description}
      labels={dict.adminModules.emailTemplates.labels}
      locale={locale}
    />
  );
}
