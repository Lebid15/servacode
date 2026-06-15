/**
 * =====================================================
 * ContactTrustCard
 * بطاقة ثقة صغيرة في صفحة التواصل
 * =====================================================
 */

import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type ContactTrustCardProps = {
  icon: AppIconName;
  title: string;
  description: string;
};

export function ContactTrustCard({ icon, title, description }: ContactTrustCardProps) {
  return (
    <div className="rounded-appXl border border-app-border bg-app-surface/70 p-4">
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
