/**
 * =====================================================
 * PremiumMetricCard
 * بطاقة رقم/مؤشر صغيرة للصفحات التسويقية
 * =====================================================
 */

import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type PremiumMetricCardProps = {
  icon: AppIconName;
  value: string;
  label: string;
};

export function PremiumMetricCard({ icon, value, label }: PremiumMetricCardProps) {
  return (
    <div className="rounded-appXl border border-app-border bg-app-surface/72 p-4 shadow-appSoft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-app2Xl bg-app-surfaceElevated shadow-appGlowSoft">
          <AppIcon name={icon} className="text-app-primary" size={21} />
        </span>
        <strong className="text-2xl font-black text-app-primary">{value}</strong>
      </div>
      <p className="text-sm font-bold leading-6 text-app-muted">{label}</p>
    </div>
  );
}
