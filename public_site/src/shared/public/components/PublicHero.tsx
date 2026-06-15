/**
 * =====================================================
 * PublicHero
 * Hero V2 احترافي بخطوط أكبر ومشهد Dashboard/Architecture
 * =====================================================
 */

import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { PremiumHeroVisual } from "./PremiumHeroVisual";
import type { Locale } from "@/shared/design-system/utils/direction";

type PublicHeroProps = {
  locale: Locale;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryHref?: string;
  visualLabels: {
    systemCore: string;
    apiLayer: string;
    dashboard: string;
    database: string;
    security: string;
    uptime: string;
    response: string;
    scalable: string;
    frontend: string;
    backend: string;
    deploy: string;
    reports: string;
  };
};

export function PublicHero({
  locale,
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  secondaryHref,
  visualLabels
}: PublicHeroProps) {
  const proofPills = locale === "ar"
    ? [
        { value: "ويب", label: "واجهات جاهزة للإطلاق" },
        { value: "تطبيقات", label: "أدوات قابلة للتوسع" },
        { value: "أنظمة", label: "حلول أعمال مترابطة" },
      ]
    : [
        { value: "Web", label: "Launch-ready interfaces" },
        { value: "Apps", label: "Scalable utility tools" },
        { value: "Systems", label: "Connected business solutions" },
      ];

  return (
    <section className="relative overflow-hidden lg:min-h-[760px]">
      <div className="absolute inset-0 app-grid-bg opacity-40" aria-hidden="true" />
      <div className="absolute left-[10%] top-24 h-44 w-44 rounded-full bg-[hsl(var(--color-accent)/0.12)] blur-3xl" />
      <div className="absolute right-[8%] top-16 h-64 w-64 rounded-full bg-[hsl(var(--color-primary)/0.18)] blur-3xl" />

      <div className="app-container relative grid items-center gap-10 py-12 sm:py-14 lg:min-h-[760px] lg:grid-cols-[0.96fr_1.04fr] lg:gap-14 xl:gap-16">
        <div className="app-fade-up grid gap-7 sm:gap-8">
          <AppBadge tone="primary" className="gap-2 px-3.5 py-1.5 text-xs sm:px-4 sm:text-sm">
            <AppIcon name="sparkles" size={16} />
            {eyebrow}
          </AppBadge>

          <div className="grid gap-5 sm:gap-6">
            <h1 className="text-balance text-[var(--font-hero)] font-black leading-[0.98] text-gradient">
              {title}
            </h1>
            <p className="max-w-3xl text-[var(--font-body-lg)] font-semibold leading-9 text-app-muted md:leading-10">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link href={`/${locale}/quote-request`}>
              <AppButton size="xl" className="w-full sm:w-auto">
                {primaryCta}
                <AppIcon name="arrowUpRight" size={19} />
              </AppButton>
            </Link>
            <Link href={secondaryHref ?? `/${locale}/contact`}>
              <AppButton variant="secondary" size="xl" className="w-full sm:w-auto">
                {secondaryCta}
              </AppButton>
            </Link>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
            {proofPills.map((item) => (
              <div key={item.value} className="release-surface rounded-appXl px-4 py-3 text-center">
                <strong className="block text-lg font-black text-app-primary">{item.value}</strong>
                <span className="text-xs font-bold leading-5 text-app-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <PremiumHeroVisual labels={visualLabels} />
      </div>
    </section>
  );
}
