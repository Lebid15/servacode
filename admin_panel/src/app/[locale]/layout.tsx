/**
 * =====================================================
 * Locale Layout
 * يضبط اللغة والاتجاه والثيم عبر المزودات المركزية بدون تكرار html/body
 * =====================================================
 */

import { AppProviders } from "@/shared/providers/AppProviders";
import { LocaleDocumentSync } from "@/shared/design-system/i18n/LocaleDocumentSync";
import { isSupportedLocale, type Locale } from "@/shared/design-system/utils/direction";
import { notFound } from "next/navigation";


export function generateStaticParams() {
  return [
    { locale: "ar" },
    { locale: "en" },
  ];
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <AppProviders locale={locale as Locale} initialTheme="blue-tech">
      <LocaleDocumentSync locale={locale as Locale} />
      {children}
    </AppProviders>
  );
}
