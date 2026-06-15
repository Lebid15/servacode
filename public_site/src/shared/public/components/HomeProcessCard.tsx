/**
 * =====================================================
 * HomeProcessCard
 * كرت خطوات العمل في الصفحة الرئيسية بحجم V2
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";

type HomeProcessCardProps = {
  index: string;
  title: string;
  description: string;
};

export function HomeProcessCard({ index, title, description }: HomeProcessCardProps) {
  return (
    <AppCard className="grid h-full gap-5 p-6">
      <span className="grid h-14 w-14 place-items-center rounded-appPill border border-app-border bg-[hsl(var(--color-primary)/0.14)] text-base font-black text-app-primary">
        {index}
      </span>
      <div className="grid gap-3">
        <h3 className="text-xl font-black leading-tight">{title}</h3>
        <p className="text-sm font-semibold leading-7 text-app-muted">{description}</p>
      </div>
    </AppCard>
  );
}
