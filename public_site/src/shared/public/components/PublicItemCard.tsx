/**
 * =====================================================
 * PublicItemCard
 * كرت موحد لعناصر الخدمات والمنتجات والأعمال والمقالات V2
 * =====================================================
 */

import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import {
  AppIcon,
  type AppIconName,
} from "@/shared/design-system/components/AppIcon";
import { PublicOptimizedImage } from "./PublicOptimizedImage";

type PublicItemCardProps = {
  title: string;
  description?: string;
  href: string;
  cta: string;
  badge?: string;
  icon?: AppIconName;
  imageUrl?: string | null;
};

export function PublicItemCard({
  title,
  description,
  href,
  cta,
  badge,
  icon = "sparkles",
  imageUrl,
}: PublicItemCardProps) {
  return (
    <AppCard className="group grid h-full gap-6 p-6 app-hover-lift md:p-7">
      <div className="flex items-start justify-between gap-4">
        <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlowSoft transition group-hover:scale-105">
          {imageUrl ? (
            <PublicOptimizedImage
              src={imageUrl}
              alt={title}
              fill
              sizes="64px"
              className="rounded-none border-0 shadow-none"
            />
          ) : (
            <AppIcon name={icon} className="text-app-primary" size={28} />
          )}
        </span>
        {badge ? <AppBadge tone="primary">{badge}</AppBadge> : null}
      </div>

      <div className="grid gap-3">
        <h3 className="text-balance text-[var(--font-card-title)] font-black leading-tight">
          {title}
        </h3>
        {description ? (
          <p className="line-clamp-4 text-base font-semibold leading-8 text-app-muted">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-auto">
        <Link href={href}>
          <AppButton variant="secondary" size="lg">
            {cta}
            <AppIcon name="arrowUpRight" size={17} />
          </AppButton>
        </Link>
      </div>
    </AppCard>
  );
}
