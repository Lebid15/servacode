/**
 * =====================================================
 * AboutValueCard
 * كرت قيمة/مبدأ في صفحة من نحن
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type AboutValueCardProps = {
  icon: AppIconName;
  title: string;
  description: string;
};

export function AboutValueCard({ icon, title, description }: AboutValueCardProps) {
  return (
    <AppCard className="grid h-full gap-5 p-6">
      <span className="grid h-12 w-12 place-items-center rounded-appPill border border-app-border bg-app-surfaceElevated">
        <AppIcon name={icon} className="text-app-primary" />
      </span>
      <div className="grid gap-2">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="leading-7 text-app-muted">{description}</p>
      </div>
    </AppCard>
  );
}
