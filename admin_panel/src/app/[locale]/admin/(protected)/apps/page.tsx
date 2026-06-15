import { AdminAppsPage } from "@/shared/admin/components/AdminAppsPage";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = { params: Promise<{ locale: string }> };

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return <AdminAppsPage locale={locale} labels={dict.adminApps} tableLabels={dict.table} />;
}
