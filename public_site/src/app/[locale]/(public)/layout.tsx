/**
 * =====================================================
 * Public Route Group Layout
 * يطبق PublicShell على صفحات الموقع العام ويحدد الروابط الديناميكية حسب وجود المحتوى
 * =====================================================
 */

import type { Metadata } from "next";

import { getPublicSettings } from "@/shared/api/public-client";
import { PublicShell } from "@/shared/public/components/PublicShell";
import { PublicMaintenanceNotice } from "@/shared/public/components/PublicMaintenanceNotice";
import { getDictionary } from "@/shared/design-system/i18n/get-dictionary";
import { buildLocalizedMetadata } from "@/shared/seo/metadata";
import type { Locale } from "@/shared/design-system/utils/direction";
import {
  getPublicBrandName,
  getPublicFooterText,
  getPublicMaintenanceMessage,
  getPublicSeoDescription,
  getPublicSeoTitle,
  isEnglishEnabled,
  isPublicSectionVisible
} from "@/shared/public/settings-utils";


export const dynamic = "force-dynamic";
type PublicLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params
}: Omit<PublicLayoutProps, "children">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getPublicSettings().catch(() => null)]);

  return buildLocalizedMetadata(locale, {
    title: getPublicSeoTitle(settings, locale, dict.public.home.title),
    description: getPublicSeoDescription(settings, locale, dict.public.home.description),
    path: `/${locale}`,
    siteName: getPublicBrandName(settings, locale, dict.admin.brand),
    faviconUrl: settings?.favicon_url,
    englishEnabled: isEnglishEnabled(settings)
  });
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const [dict, settings] = await Promise.all([
    getDictionary(locale),
    getPublicSettings().catch(() => null)
  ]);
  const brand = getPublicBrandName(settings, locale, dict.admin.brand);
  const footerDescription = getPublicFooterText(settings, locale, dict.publicIdentity.description);
  const maintenanceDescription = getPublicMaintenanceMessage(
    settings,
    locale,
    dict.public.system.maintenanceDescription
  );
  const filteredAvailability = {
    // الروابط الأساسية تظهر في الشريط العلوي طالما القسم مفعل من لوحة التحكم،
    // حتى لو لم يُنشر محتوى بعد. الصفحات نفسها تعرض حالة احترافية عند الفراغ.
    services: isPublicSectionVisible(settings, "services"),
    apps: isPublicSectionVisible(settings, "apps"),
    products: isPublicSectionVisible(settings, "products"),
    portfolio: isPublicSectionVisible(settings, "portfolio"),
    testimonials: isPublicSectionVisible(settings, "testimonials")
  };

  return (
    <PublicShell
      locale={locale}
      availability={filteredAvailability}
      settings={settings}
      labels={{
        brand,
        tagline: dict.publicIdentity.tagline,
        description: footerDescription,
        home: dict.publicNav.home,
        about: dict.publicNav.about,
        services: dict.publicNav.services,
        products: dict.publicNav.products,
        apps: dict.publicNav.apps,
        portfolio: dict.publicNav.portfolio,
        testimonials: dict.publicNav.testimonials,
        contact: dict.publicNav.contact,
        quote: dict.publicNav.quote,
        downloads: dict.publicNav.downloads,
        support: dict.publicNav.support,
        privacy: dict.public.legal.privacyTitle,
        terms: dict.public.legal.termsTitle,
        menu: dict.actions.menu,
        close: dict.actions.close,
        switchLanguage: dict.actions.switchLanguage,
        switchTheme: dict.actions.switchTheme,
        build: dict.publicIdentity.build,
        systems: dict.publicIdentity.systems,
        webApps: dict.publicIdentity.webApps,
        desktopApps: dict.publicIdentity.desktopApps,
        adminPanels: dict.publicIdentity.adminPanels,
        apiIntegrations: dict.publicIdentity.apiIntegrations,
        address: dict.publicIdentity.address,
        workingHours: dict.publicIdentity.workingHours,
        openMap: dict.publicIdentity.openMap,
        rights: dict.publicIdentity.rights,
        themes: dict.themes
      }}
    >
      {settings?.maintenance_mode ? (
        <PublicMaintenanceNotice
          locale={locale}
          title={dict.public.system.maintenanceTitle}
          description={maintenanceDescription}
          backHome={dict.public.system.backHome}
        />
      ) : (
        children
      )}
    </PublicShell>
  );
}
