import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";
import { PublicOptimizedImage } from "./PublicOptimizedImage";

type PublicShowcaseCardProps = {
  title: string;
  description?: string;
  href: string;
  cta: string;
  badge?: string;
  icon?: AppIconName;
  imageUrl?: string | null;
  features?: string[];
  meta?: string[];
  isExternal?: boolean;
  isDownload?: boolean;
  ctaIcon?: AppIconName;
};

export function PublicShowcaseCard({
  title,
  description,
  href,
  cta,
  badge,
  icon = "sparkles",
  imageUrl,
  features = [],
  meta = [],
  isExternal,
  isDownload,
  ctaIcon = "arrowUpRight",
}: PublicShowcaseCardProps) {
  const visibleFeatures = features.filter(Boolean).slice(0, 4);
  const visibleMeta = meta.filter(Boolean).slice(0, 3);

  return (
    <AppCard className="group flex h-full flex-col overflow-hidden p-0 app-hover-lift">
      <div className="relative h-44 overflow-hidden border-b border-app-border bg-app-surfaceElevated">
        {imageUrl ? (
          <PublicOptimizedImage
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="rounded-none border-0 shadow-none transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center app-grid-bg">
            <span className="grid h-20 w-20 place-items-center rounded-app2Xl border border-app-border bg-app-surface/80 shadow-appGlowSoft">
              <AppIcon name={icon} className="text-app-primary" size={32} />
            </span>
          </div>
        )}
        {badge ? (
          <div className="absolute start-4 top-4">
            <AppBadge tone="primary">{badge}</AppBadge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6 md:p-7">
        <div className="grid gap-3">
          <h3 className="text-balance text-2xl font-black leading-tight">{title}</h3>
          {description ? <p className="line-clamp-4 text-base font-semibold leading-8 text-app-muted">{description}</p> : null}
        </div>

        {visibleFeatures.length > 0 ? (
          <div className="grid gap-2">
            {visibleFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm font-bold leading-6 text-app-muted">
                <AppIcon name="check" className="mt-0.5 shrink-0 text-app-primary" size={16} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        ) : null}

        {visibleMeta.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {visibleMeta.map((item) => (
              <AppBadge key={item} tone="neutral">{item}</AppBadge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          {isExternal || isDownload ? (
            <a href={href} download={isDownload ? true : undefined} target={isExternal && !isDownload ? "_blank" : undefined} rel={isExternal && !isDownload ? "noreferrer" : undefined} aria-label={cta}>
              <AppButton variant="secondary" size="lg" className="w-full">
                {cta}
                <AppIcon name={ctaIcon} size={17} />
              </AppButton>
            </a>
          ) : (
            <Link href={href}>
              <AppButton variant="secondary" size="lg" className="w-full">
                {cta}
                <AppIcon name={ctaIcon} size={17} />
              </AppButton>
            </Link>
          )}
        </div>
      </div>
    </AppCard>
  );
}
