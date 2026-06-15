/**
 * =====================================================
 * PublicUnavailable
 * حالة احترافية للمحتوى غير المنشور أو غير المتاح حاليًا.
 * =====================================================
 */

import Link from "next/link";

import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";

type PublicUnavailableProps = {
  locale: Locale;
  badge: string;
  title: string;
  description: string;
  homeLabel: string;
  quoteLabel: string;
};

export function PublicUnavailable({
  locale,
  badge,
  title,
  description,
  homeLabel,
  quoteLabel
}: PublicUnavailableProps) {
  return (
    <section className="app-container app-section">
      <AppCard className="relative overflow-hidden p-8 md:p-12">
        <div className="absolute end-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-[hsl(var(--color-primary)/0.12)] blur-3xl" />
        <div className="absolute bottom-[-6rem] start-[-6rem] h-64 w-64 rounded-full bg-[hsl(var(--color-accent)/0.10)] blur-3xl" />

        <div className="relative grid max-w-3xl gap-7">
          <AppBadge tone="primary" className="gap-2">
            <AppIcon name="sparkles" size={15} />
            {badge}
          </AppBadge>

          <div className="grid gap-4">
            <h1 className="text-balance text-4xl font-black leading-tight md:text-6xl">{title}</h1>
            <p className="text-lg leading-8 text-app-muted md:text-xl">{description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}`}>
              <AppButton variant="secondary">{homeLabel}</AppButton>
            </Link>
            <Link href={`/${locale}/quote-request`}>
              <AppButton>
                {quoteLabel}
                <AppIcon name="arrowUpRight" size={17} />
              </AppButton>
            </Link>
          </div>
        </div>
      </AppCard>
    </section>
  );
}
