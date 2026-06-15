/**
 * =====================================================
 * ContactInfoCard
 * بطاقة معلومات تواصل احترافية
 * =====================================================
 */

import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon, type AppIconName } from "@/shared/design-system/components/AppIcon";

type ContactInfoCardProps = {
  icon: AppIconName;
  label: string;
  value: string;
  hint?: string;
  href?: string;
};

export function ContactInfoCard({ icon, label, value, hint, href }: ContactInfoCardProps) {
  const content = (
    <AppCard className="grid h-full gap-4 p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-appPill border border-app-border bg-app-surfaceElevated">
          <AppIcon name={icon} className="text-app-primary" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black text-app-muted">{label}</p>
          <p className="mt-1 break-words text-base font-black">{value}</p>
          {hint ? <p className="mt-2 text-sm leading-6 text-app-muted">{hint}</p> : null}
        </div>
      </div>
    </AppCard>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} className="block transition hover:-translate-y-1">
      {content}
    </a>
  );
}
