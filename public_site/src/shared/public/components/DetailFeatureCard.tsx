/**
 * =====================================================
 * DetailFeatureCard
 * بطاقة ميزة في صفحات التفاصيل — Premium Cards V2
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";

type DetailFeatureCardProps = {
  title: string;
  description?: string;
};

export function DetailFeatureCard({ title, description }: DetailFeatureCardProps) {
  return (
    <AppCard className="group grid h-full gap-5 p-6">
      <span className="grid h-14 w-14 place-items-center rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlowSoft transition group-hover:scale-105">
        <AppIcon name="check" className="text-app-primary" size={22} />
      </span>
      <div className="grid gap-3">
        <h3 className="text-xl font-black leading-tight">{title}</h3>
        {description ? <p className="text-base font-semibold leading-8 text-app-muted">{description}</p> : null}
      </div>
    </AppCard>
  );
}
