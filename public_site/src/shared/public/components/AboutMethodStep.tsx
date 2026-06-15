/**
 * =====================================================
 * AboutMethodStep
 * خطوة من منهجية العمل في صفحة من نحن
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";

type AboutMethodStepProps = {
  index: string;
  title: string;
  description: string;
};

export function AboutMethodStep({ index, title, description }: AboutMethodStepProps) {
  return (
    <AppCard className="relative grid h-full gap-4 p-6">
      <span className="grid h-12 w-12 place-items-center rounded-appPill border border-app-border bg-[hsl(var(--color-primary)/0.12)] text-sm font-black text-app-primary">
        {index}
      </span>
      <div className="grid gap-2">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="leading-7 text-app-muted">{description}</p>
      </div>
    </AppCard>
  );
}
