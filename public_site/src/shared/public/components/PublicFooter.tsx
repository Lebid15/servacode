/**
 * =====================================================
 * PublicFooter
 * فوتر الموقع العام بهوية تقنية هادئة
 * =====================================================
 */

import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppLogo } from "@/shared/design-system/components/AppLogo";
import type { Locale } from "@/shared/design-system/utils/direction";
import type { PublicSettings } from "@/shared/api/public-client";
import { localizedSetting } from "@/shared/public/settings-utils";

type PublicFooterLabels = {
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
};

type PublicFooterAvailability = {
  services: boolean;
  products: boolean;
  apps: boolean;
  portfolio: boolean;
  testimonials: boolean;
};

type PublicFooterProps = {
  locale: Locale;
  labels: PublicFooterLabels;
  availability: PublicFooterAvailability;
  settings?: PublicSettings | null;
};

function normalizeUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function PublicFooter({ locale, labels, availability, settings }: PublicFooterProps) {
  const year = new Date().getFullYear();

  const brandTitle = locale === "ar" ? settings?.site_name_ar || labels.brand : settings?.site_name_en || labels.brand;
  const footerText = locale === "ar" ? settings?.footer_text_ar || labels.description : settings?.footer_text_en || labels.description;
  const address = localizedSetting(locale, settings?.address_ar, settings?.address_en);
  const workingHours = localizedSetting(locale, settings?.working_hours_ar, settings?.working_hours_en);
  const addressLabel = labels.address;
  const hoursLabel = labels.workingHours;
  const mapLabel = labels.openMap;
  const contactLinks = [
    settings?.email ? { href: `mailto:${settings.email}`, label: settings.email, icon: "mail" as const } : null,
    settings?.phone ? { href: `tel:${settings.phone}`, label: settings.phone, icon: "phone" as const } : null,
    settings?.whatsapp ? { href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`, label: settings.whatsapp, icon: "phone" as const } : null,
    settings?.support_email ? { href: `mailto:${settings.support_email}`, label: settings.support_email, icon: "mail" as const } : null,
    settings?.support_phone ? { href: `tel:${settings.support_phone}`, label: settings.support_phone, icon: "phone" as const } : null
  ].filter(Boolean) as Array<{ href: string; label: string; icon: "mail" | "phone" }>;

  const socialLinks = Object.entries(settings?.social_links ?? {}).filter(([, value]) => Boolean(value));

  const links = [
    { href: `/${locale}`, label: labels.home, visible: true },
    { href: `/${locale}/services`, label: labels.services, visible: availability.services },
    { href: `/${locale}/apps`, label: labels.apps, visible: availability.apps },
    { href: `/${locale}/products`, label: labels.products, visible: availability.products },
    { href: `/${locale}/portfolio`, label: labels.portfolio, visible: availability.portfolio },
    { href: `/${locale}/testimonials`, label: labels.testimonials, visible: availability.testimonials },
    { href: `/${locale}/about`, label: labels.about, visible: true },
    { href: `/${locale}/contact`, label: labels.contact, visible: true },
    { href: `/${locale}/quote-request`, label: labels.quote, visible: true },
    { href: `/${locale}/downloads`, label: labels.downloads, visible: availability.apps },
    { href: `/${locale}/support`, label: labels.support, visible: true }
  ].filter((item) => item.visible);

  const capabilities = [
    { icon: "panels" as const, label: labels.webApps },
    { icon: "monitor" as const, label: labels.desktopApps },
    { icon: "dashboard" as const, label: labels.adminPanels },
    { icon: "network" as const, label: labels.apiIntegrations }
  ];

  return (
    <footer className="relative overflow-hidden border-t border-app-border bg-app-surface/48">
      <div className="absolute inset-0 app-grid-bg opacity-30" aria-hidden="true" />
      <div className="app-container relative grid gap-8 py-10 lg:grid-cols-[1.2fr_0.7fr_0.9fr] xl:gap-10">
        <div className="release-surface grid gap-5 rounded-app2Xl p-6">
          <AppLogo title={brandTitle} subtitle={labels.tagline} logoUrl={settings?.logo_url} />
          <p className="max-w-xl text-sm leading-7 text-app-muted">{footerText}</p>
          <div className="flex flex-wrap gap-2">
            <AppBadge tone="primary">{labels.systems}</AppBadge>
            <AppBadge tone="neutral">{labels.build}</AppBadge>
          </div>
          {contactLinks.length > 0 ? (
            <div className="grid gap-2 text-sm font-bold text-app-muted">
              {contactLinks.map((item) => (
                <a key={item.href} href={item.href} className="flex w-fit items-center gap-2 transition hover:text-app-primary">
                  <AppIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          ) : null}
          {address || workingHours || settings?.map_url ? (
            <div className="grid gap-2 rounded-appXl border border-app-border bg-app-surface/46 p-4 text-sm font-bold text-app-muted">
              {address ? (
                <div className="flex items-start gap-2">
                  <AppIcon name="globe" className="mt-0.5 shrink-0 text-app-primary" size={16} />
                  <span><span className="text-app-foreground">{addressLabel}: </span>{address}</span>
                </div>
              ) : null}
              {workingHours ? (
                <div className="flex items-start gap-2">
                  <AppIcon name="gauge" className="mt-0.5 shrink-0 text-app-primary" size={16} />
                  <span><span className="text-app-foreground">{hoursLabel}: </span>{workingHours}</span>
                </div>
              ) : null}
              {settings?.map_url ? (
                <a href={normalizeUrl(settings.map_url)} target="_blank" rel="noreferrer" className="flex w-fit items-center gap-2 text-app-primary transition hover:text-app-foreground">
                  <AppIcon name="external" size={16} />
                  <span>{mapLabel}</span>
                </a>
              ) : null}
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {socialLinks.map(([key, value]) => (
                <a
                  key={key}
                  href={normalizeUrl(value)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-appPill border border-app-border px-3 py-1.5 text-xs font-black text-app-muted transition hover:border-app-primary hover:text-app-primary"
                >
                  {key}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="release-surface grid content-start gap-4 rounded-app2Xl p-6">
          <h3 className="text-base font-black">{labels.build}</h3>
          <nav className="grid gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                className="w-fit text-sm font-bold text-app-muted transition hover:text-app-primary"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="release-surface grid content-start gap-4 rounded-app2Xl p-6">
          <h3 className="text-base font-black">{labels.systems}</h3>
          <div className="grid gap-3">
            {capabilities.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm font-bold text-app-muted">
                <span className="grid h-9 w-9 place-items-center rounded-appPill border border-app-border bg-app-surfaceElevated">
                  <AppIcon name={item.icon} className="text-app-primary" size={17} />
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-app-border">
        <div className="app-container flex flex-col gap-3 py-5 text-sm text-app-muted md:flex-row md:items-center md:justify-between">
          <span>
            © {year} {brandTitle}. {labels.rights}
          </span>
          <div className="flex flex-wrap gap-4">
            <Link className="transition hover:text-app-primary" href={`/${locale}/support`}>
              {labels.support}
            </Link>
            <Link className="transition hover:text-app-primary" href={`/${locale}/privacy`}>
              {labels.privacy}
            </Link>
            <Link className="transition hover:text-app-primary" href={`/${locale}/terms`}>
              {labels.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
