/**
 * =====================================================
 * HomeFeatureCard
 * كرت ميزة مركزي للرئيسية — Premium Cards V2
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type HomeFeatureCardProps = {
  icon: AppIconName;
  title: string;
  description: string;
};

export function HomeFeatureCard({ icon, title, description }: HomeFeatureCardProps) {
  return (
    <AppCard className="group relative grid h-full gap-6 overflow-hidden p-7">
      <div className="absolute end-[-3.5rem] top-[-3.5rem] h-32 w-32 rounded-full bg-[hsl(var(--color-primary)/0.10)] blur-2xl transition group-hover:bg-[hsl(var(--color-primary)/0.18)]" />
      <span className="relative grid h-16 w-16 place-items-center rounded-app2Xl border border-app-border bg-app-surfaceElevated shadow-appGlowSoft transition group-hover:scale-105">
        <AppIcon name={icon} className="text-app-primary" size={28} />
      </span>
      <div className="relative grid gap-3">
        <h3 className="text-[var(--font-card-title)] font-black leading-tight">{title}</h3>
        <p className="text-base font-semibold leading-8 text-app-muted">{description}</p>
      </div>
    </AppCard>
  );
}
