/**
 * =====================================================
 * PublicServiceCard
 * كرت بصري احترافي للخدمات: عنوان، وصف، مميزات، وصورتان/أزرار.
 * =====================================================
 */

import Link from "next/link";

import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import type { ServiceCardView } from "@/shared/public/service-utils";
import { PublicOptimizedImage } from "./PublicOptimizedImage";

type PublicServiceCardProps = {
  service: ServiceCardView;
  detailsLabel: string;
  quoteLabel: string;
  featuresLabel: string;
  quoteHref: string;
};

export function PublicServiceCard({
  service,
  detailsLabel,
  quoteLabel,
  featuresLabel,
  quoteHref,
}: PublicServiceCardProps) {
  const visibleFeatures = service.features.slice(0, 4);

  return (
    <AppCard className="group relative grid h-full overflow-hidden p-0 app-hover-lift">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-app-primary via-app-accent to-transparent opacity-80" />
      <div className="grid gap-6 p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlowSoft transition group-hover:scale-105">
            {service.imageUrl ? (
              <PublicOptimizedImage
                src={service.imageUrl}
                alt={service.title}
                fill
                sizes="64px"
                className="rounded-none border-0 shadow-none"
              />
            ) : (
              <AppIcon name={service.icon} className="text-app-primary" size={28} />
            )}
          </span>
          <span className="rounded-full border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs font-black text-app-muted">
            {featuresLabel}
          </span>
        </div>

        <div className="grid gap-3">
          <h3 className="text-balance text-[var(--font-card-title)] font-black leading-tight">
            {service.title}
          </h3>
          <p className="text-base font-semibold leading-8 text-app-muted">
            {service.description}
          </p>
        </div>

        {visibleFeatures.length > 0 ? (
          <ul className="grid gap-2.5">
            {visibleFeatures.map((feature) => (
              <li key={feature.title} className="flex items-start gap-2.5 text-sm font-bold leading-7 text-app-foreground/90">
                <AppIcon name="check" className="mt-1 shrink-0 text-app-primary" size={17} />
                <span>{feature.title}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-3 pt-1">
          <Link href={service.href}>
            <AppButton variant="secondary" size="lg">
              {detailsLabel}
              <AppIcon name="arrowUpRight" size={17} />
            </AppButton>
          </Link>
          <Link href={quoteHref}>
            <AppButton size="lg">{quoteLabel}</AppButton>
          </Link>
        </div>
      </div>
    </AppCard>
  );
}
