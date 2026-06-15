/**
 * =====================================================
 * AppEmptyState
 * حالة محتوى فارغ بشكل تسويقي غير إداري
 * =====================================================
 */

import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppIcon } from "./AppIcon";

type AppEmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AppEmptyState({ title, description, actionLabel, onAction }: AppEmptyStateProps) {
  return (
    <AppCard className="grid place-items-center gap-4 p-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-appPill border border-app-border bg-app-surfaceElevated">
        <AppIcon name="sparkles" className="text-app-primary" />
      </span>
      <div className="grid max-w-xl gap-2">
        <h2 className="text-2xl font-black">{title}</h2>
        {description ? <p className="leading-7 text-app-muted">{description}</p> : null}
      </div>
      {actionLabel && onAction ? <AppButton onClick={onAction}>{actionLabel}</AppButton> : null}
    </AppCard>
  );
}
