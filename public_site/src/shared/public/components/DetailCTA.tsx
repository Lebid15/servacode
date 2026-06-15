/**
 * =====================================================
 * DetailCTA
 * CTA موحد في نهاية صفحات التفاصيل
 * =====================================================
 */

import Link from "next/link";

import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";

type DetailCTAProps = {
  locale: Locale;
  title: string;
  description: string;
  button: string;
};

export function DetailCTA({ locale, title, description, button }: DetailCTAProps) {
  return (
    <AppCard className="relative overflow-hidden p-8 text-center md:p-10">
      <div className="absolute inset-0 app-grid-bg opacity-20" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-3xl gap-5">
        <h2 className="text-balance text-3xl font-black md:text-4xl">{title}</h2>
        <p className="text-lg leading-8 text-app-muted">{description}</p>
        <div className="flex justify-center">
          <Link href={`/${locale}/quote-request`}>
            <AppButton size="lg">
              {button}
              <AppIcon name="arrowUpRight" size={18} />
            </AppButton>
          </Link>
        </div>
      </div>
    </AppCard>
  );
}
