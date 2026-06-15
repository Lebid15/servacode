/**
 * =====================================================
 * PublicShell
 * غلاف الموقع العام: Navbar + Main + Footer
 * =====================================================
 */

import { PublicFooter } from "./PublicFooter";
import { PublicNavbar } from "./PublicNavbar";
import type { Locale } from "@/shared/design-system/utils/direction";
import type { ThemeName } from "@/shared/design-system/themes/theme-provider";
import type { PublicSettings } from "@/shared/api/public-client";

type PublicContentAvailability = {
  services: boolean;
  products: boolean;
  apps: boolean;
  portfolio: boolean;
  testimonials: boolean;
};

type PublicShellProps = {
  children: React.ReactNode;
  locale: Locale;
  availability: PublicContentAvailability;
  settings?: PublicSettings | null;
  labels: {
    brand: string;
    tagline: string;
    description: string;
    home: string;
    about: string;
    services: string;
    apps: string;
    products: string;
    portfolio: string;
    testimonials: string;
    contact: string;
    quote: string;
    downloads: string;
    support: string;
    privacy: string;
    terms: string;
    menu: string;
    close: string;
    switchLanguage: string;
    switchTheme: string;
    build: string;
    systems: string;
    webApps: string;
    desktopApps: string;
    adminPanels: string;
    apiIntegrations: string;
    address: string;
    workingHours: string;
    openMap: string;
    rights: string;
    themes: Record<ThemeName, string>;
  };
};

export function PublicShell({ children, locale, availability, settings, labels }: PublicShellProps) {
  return (
    <div className="min-h-screen">
      <PublicNavbar locale={locale} labels={labels} availability={availability} settings={settings} />
      <div>{children}</div>
      <PublicFooter locale={locale} labels={labels} availability={availability} settings={settings} />
    </div>
  );
}
