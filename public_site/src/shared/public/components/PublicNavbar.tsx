"use client";

/**
 * =====================================================
 * PublicNavbar
 * هيدر الموقع العام الاحترافي
 * لا يظهر أي رابط ديناميكي إلا عند وجود محتوى فعلي.
 * =====================================================
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppLogo } from "@/shared/design-system/components/AppLogo";
import { LanguageSwitcher } from "@/shared/design-system/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/shared/design-system/components/ThemeSwitcher";
import { cn } from "@/shared/design-system/utils/cn";
import type { Locale } from "@/shared/design-system/utils/direction";
import type { ThemeName } from "@/shared/design-system/themes/theme-provider";
import type { PublicSettings } from "@/shared/api/public-client";

type PublicNavAvailability = {
  services: boolean;
  products: boolean;
  apps: boolean;
  portfolio: boolean;
  testimonials: boolean;
};

type PublicNavbarLabels = {
  brand: string;
  tagline: string;
  home: string;
  about: string;
  services: string;
  products: string;
  apps: string;
  portfolio: string;
  testimonials: string;
  contact: string;
  quote: string;
  menu: string;
  close: string;
  switchLanguage: string;
  switchTheme: string;
  themes: Record<ThemeName, string>;
};

type PublicNavbarProps = {
  locale: Locale;
  labels: PublicNavbarLabels;
  availability: PublicNavAvailability;
  settings?: PublicSettings | null;
};

export function PublicNavbar({ locale, labels, availability, settings }: PublicNavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const brandTitle = locale === "ar" ? settings?.site_name_ar || labels.brand : settings?.site_name_en || labels.brand;
  const canSwitchLanguage = settings?.is_english_enabled !== false;

  const navItems = [
    { href: `/${locale}`, label: labels.home, visible: true },
    { href: `/${locale}/services`, label: labels.services, visible: availability.services },
    { href: `/${locale}/apps`, label: labels.apps, visible: availability.apps },
    { href: `/${locale}/products`, label: labels.products, visible: availability.products },
    { href: `/${locale}/portfolio`, label: labels.portfolio, visible: availability.portfolio },
    { href: `/${locale}/testimonials`, label: labels.testimonials, visible: availability.testimonials },
    { href: `/${locale}/about`, label: labels.about, visible: true },
    { href: `/${locale}/contact`, label: labels.contact, visible: true }
  ].filter((item) => item.visible);

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-app-border/70 bg-app-background/86 backdrop-blur-2xl supports-[backdrop-filter]:bg-app-background/70">
      <div className="app-container flex min-h-[6.4rem] items-center justify-between gap-3 py-2">
        <Link href={`/${locale}`} aria-label={labels.home} className="min-w-0 shrink">
          <AppLogo title={brandTitle} subtitle={labels.tagline} logoUrl={settings?.logo_url} />
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex 2xl:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "whitespace-nowrap rounded-appPill px-3 py-2 text-[0.9rem] font-black transition 2xl:px-3.5 2xl:text-[0.94rem]",
                "hover:bg-app-surface/80 hover:text-app-foreground",
                isActive(item.href)
                  ? "release-link-active text-app-foreground"
                  : "text-app-muted"
              )}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <Link href={`/${locale}/quote-request`}>
            <AppButton size="md">
              <span>{labels.quote}</span>
              <AppIcon name="arrowUpRight" size={17} />
            </AppButton>
          </Link>
          <LanguageSwitcher locale={locale} label={labels.switchLanguage} enabled={canSwitchLanguage} />
          <ThemeSwitcher label={labels.switchTheme} labels={labels.themes} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
          <LanguageSwitcher locale={locale} label={labels.switchLanguage} enabled={canSwitchLanguage} />
          <ThemeSwitcher label={labels.switchTheme} labels={labels.themes} />
          <AppButton
            variant="secondary"
            size="icon"
            aria-label={isOpen ? labels.close : labels.menu}
            aria-expanded={isOpen}
            aria-controls="public-mobile-navigation"
            onClick={() => setIsOpen((value) => !value)}
          >
            <AppIcon name={isOpen ? "x" : "menu"} size={19} />
          </AppButton>
        </div>
      </div>

      {isOpen ? (
        <div id="public-mobile-navigation" className="max-h-[calc(100vh-6.4rem)] overflow-y-auto border-t border-app-border bg-app-background/96 p-4 shadow-appCard backdrop-blur-2xl xl:hidden">
          <nav className="app-container grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-appLg px-4 py-3 text-[0.96rem] font-black transition app-hover-lift",
                  isActive(item.href)
                    ? "release-link-active text-app-foreground"
                    : "text-app-muted hover:bg-app-surface/80 hover:text-app-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}

            <Link href={`/${locale}/quote-request`} onClick={() => setIsOpen(false)} className="mt-2">
              <AppButton className="w-full">
                <span>{labels.quote}</span>
                <AppIcon name="arrowUpRight" size={17} />
              </AppButton>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
