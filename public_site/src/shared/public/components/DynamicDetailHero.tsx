/**
 * =====================================================
 * DynamicDetailHero
 * Hero موحد لتفاصيل الخدمات/المنتجات/الأعمال/المقالات
 * =====================================================
 */

import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";

type DynamicDetailHeroProps = {
  locale: Locale;
  eyebrow: string;
  title: string;
  description?: string;
  icon: AppIconName;
  primaryCta: string;
  primaryHref?: string;
  primaryIsDownload?: boolean;
  primaryIcon?: AppIconName;
  secondaryHref?: string;
  secondaryCta: string;
  badges?: string[];
};

export function DynamicDetailHero({
  locale,
  eyebrow,
  title,
  description,
  icon,
  primaryCta,
  primaryHref,
  primaryIsDownload,
  primaryIcon = "arrowUpRight",
  secondaryCta,
  secondaryHref,
  badges = []
}: DynamicDetailHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 app-grid-bg opacity-25" aria-hidden="true" />
      <div className="app-container relative grid gap-10 py-16 lg:grid-cols-[1fr_0.78fr] lg:items-center">
        <div className="grid gap-7">
          <AppBadge tone="primary" className="gap-2">
            <AppIcon name={icon} size={15} />
            {eyebrow}
          </AppBadge>

          <div className="grid gap-4">
            <h1 className="text-balance text-4xl font-black leading-tight md:text-6xl">{title}</h1>
            {description ? <p className="max-w-3xl text-lg leading-9 text-app-muted md:text-xl">{description}</p> : null}
          </div>

          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.filter(Boolean).map((badge) => (
                <AppBadge key={badge} tone="neutral">
                  {badge}
                </AppBadge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {primaryIsDownload ? (
              <a href={primaryHref ?? `/${locale}/quote-request`} download>
                <AppButton size="lg">
                  {primaryCta}
                  <AppIcon name={primaryIcon} size={18} />
                </AppButton>
              </a>
            ) : (
              <Link href={primaryHref ?? `/${locale}/quote-request`}>
                <AppButton size="lg">
                  {primaryCta}
                  <AppIcon name={primaryIcon} size={18} />
                </AppButton>
              </Link>
            )}
            <Link href={secondaryHref ?? `/${locale}/contact`}>
              <AppButton variant="secondary" size="lg">
                {secondaryCta}
              </AppButton>
            </Link>
          </div>
        </div>

        <AppCard className="app-float relative overflow-hidden p-6">
          <div className="absolute end-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-[hsl(var(--color-primary)/0.20)] blur-3xl" />
          <div className="absolute bottom-[-5rem] start-[-5rem] h-56 w-56 rounded-full bg-[hsl(var(--color-accent)/0.16)] blur-3xl" />
          <div className="relative grid gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-app2Xl border border-app-border bg-app-surfaceElevated">
              <AppIcon name={icon} className="text-app-primary" size={32} />
            </div>
            <div className="grid gap-3">
              <div className="h-3 w-4/5 rounded-appPill bg-app-surfaceElevated" />
              <div className="h-3 w-3/5 rounded-appPill bg-app-surfaceElevated" />
              <div className="h-3 w-2/3 rounded-appPill bg-app-surfaceElevated" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="h-24 rounded-appLg bg-[hsl(var(--color-primary)/0.16)]" />
              <div className="h-24 rounded-appLg bg-[hsl(var(--color-accent)/0.14)]" />
              <div className="h-24 rounded-appLg bg-[hsl(var(--color-success)/0.12)]" />
            </div>
          </div>
        </AppCard>
      </div>
    </section>
  );
}
