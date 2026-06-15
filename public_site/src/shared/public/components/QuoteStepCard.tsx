/**
 * =====================================================
 * QuoteStepCard
 * بطاقة خطوة ضمن تجربة طلب عرض السعر
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";

type QuoteStepCardProps = {
  index: string;
  title: string;
  description: string;
};

export function QuoteStepCard({ index, title, description }: QuoteStepCardProps) {
  return (
    <AppCard className="grid h-full gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-appPill border border-app-border bg-[hsl(var(--color-primary)/0.12)] text-sm font-black text-app-primary">
        {index}
      </span>
      <div className="grid gap-2">
        <h3 className="text-lg font-black">{title}</h3>
        <p className="text-sm leading-7 text-app-muted">{description}</p>
      </div>
    </AppCard>
  );
}
