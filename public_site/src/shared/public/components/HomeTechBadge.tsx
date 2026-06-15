/**
 * =====================================================
 * HomeTechBadge
 * شارة تقنية للرئيسية — Premium V2
 * =====================================================
 */

import { AppIcon } from "@/shared/design-system/components/AppIcon";

type HomeTechBadgeProps = {
  label: string;
};

export function HomeTechBadge({ label }: HomeTechBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-appPill border border-app-border bg-app-surface/78 px-5 py-3 text-base font-black text-app-muted shadow-appSoft transition hover:-translate-y-0.5 hover:border-app-borderStrong hover:text-app-foreground">
      <AppIcon name="code" size={17} className="text-app-primary" />
      {label}
    </span>
  );
}
