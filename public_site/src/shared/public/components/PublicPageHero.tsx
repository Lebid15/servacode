import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

export type PublicHeroMetric = {
  value: string;
  label: string;
};

type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: AppIconName;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  metrics?: readonly PublicHeroMetric[];
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  icon,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
  metrics = [],
}: PublicPageHeroProps) {
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
            <p className="max-w-3xl text-lg font-semibold leading-9 text-app-muted md:text-xl">{description}</p>
          </div>

          {(primaryCta && primaryHref) || (secondaryCta && secondaryHref) ? (
            <div className="flex flex-wrap gap-3">
              {primaryCta && primaryHref ? (
                <Link href={primaryHref}>
                  <AppButton size="lg">
                    {primaryCta}
                    <AppIcon name="arrowUpRight" size={18} />
                  </AppButton>
                </Link>
              ) : null}
              {secondaryCta && secondaryHref ? (
                <Link href={secondaryHref}>
                  <AppButton variant="secondary" size="lg">
                    {secondaryCta}
                  </AppButton>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <AppCard className="relative overflow-hidden p-6">
          <div className="absolute end-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-[hsl(var(--color-primary)/0.20)] blur-3xl" />
          <div className="absolute bottom-[-5rem] start-[-5rem] h-56 w-56 rounded-full bg-[hsl(var(--color-accent)/0.16)] blur-3xl" />
          <div className="relative grid gap-5">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-20 w-20 place-items-center rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlowSoft">
                <AppIcon name={icon} className="text-app-primary" size={32} />
              </span>
              <div className="grid gap-2 text-end">
                <div className="ms-auto h-3 w-28 rounded-appPill bg-app-surfaceElevated" />
                <div className="ms-auto h-3 w-20 rounded-appPill bg-app-surfaceElevated" />
              </div>
            </div>

            {metrics.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={`${metric.value}-${metric.label}`} className="rounded-appLg border border-app-border bg-app-surface/75 p-4">
                    <strong className="block text-2xl font-black text-app-primary">{metric.value}</strong>
                    <span className="text-xs font-bold text-app-muted">{metric.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </AppCard>
      </div>
    </section>
  );
}
