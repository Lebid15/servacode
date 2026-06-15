/**
 * =====================================================
 * QuoteProjectTypeCard
 * بطاقة نوع مشروع في صفحة طلب عرض السعر
 * =====================================================
 */

import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type QuoteProjectTypeCardProps = {
  icon: AppIconName;
  title: string;
  description: string;
};

export function QuoteProjectTypeCard({ icon, title, description }: QuoteProjectTypeCardProps) {
  return (
    <div className="rounded-appXl border border-app-border bg-app-surface/72 p-4 shadow-appSoft">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-appPill bg-[hsl(var(--color-primary)/0.12)]">
          <AppIcon name={icon} className="text-app-primary" size={18} />
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      <p className="text-sm leading-6 text-app-muted">{description}</p>
    </div>
  );
}
