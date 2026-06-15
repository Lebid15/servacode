/**
 * =====================================================
 * Locale Layout
 * يضبط اللغة والاتجاه والثيم عبر المزودات المركزية بدون تكرار html/body
 * =====================================================
 */

import { AppProviders } from "@/shared/providers/AppProviders";
import { getPublicSettings } from "@/shared/api/public-client";
import type { ThemeName } from "@/shared/design-system/themes/theme-provider";
import { LocaleDocumentSync } from "@/shared/design-system/i18n/LocaleDocumentSync";
import { isSupportedLocale, type Locale } from "@/shared/design-system/utils/direction";
import { notFound } from "next/navigation";
import { isEnglishEnabled } from "@/shared/public/settings-utils";
import { PublicAnalyticsTracker } from "@/shared/analytics/PublicAnalyticsTracker";


export const dynamic = "force-dynamic";
function resolveThemeName(value: string | null | undefined): ThemeName {
  return value === "emerald-luxury" || value === "light" ? "emerald-luxury" : "blue-tech";
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

  const settings = await getPublicSettings().catch(() => null);

  if (locale === "en" && !isEnglishEnabled(settings)) {
    notFound();
  }

  const initialTheme = resolveThemeName(settings?.active_theme);

  return (
    <AppProviders locale={locale as Locale} initialTheme={initialTheme}>
      <LocaleDocumentSync locale={locale as Locale} />
      <PublicAnalyticsTracker locale={locale as Locale} />
      {children}
    </AppProviders>
  );
}
