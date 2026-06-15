/**
 * =====================================================
 * AppEmptyState
 * حالة عدم وجود بيانات
 * =====================================================
 */

import { AppIcon, type IconName } from "./AppIcon";

type AppEmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconName;
};

export function AppEmptyState({ title, description, icon = "archive" }: AppEmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-appLg border border-dashed border-app-border bg-app-surface p-6 text-center">
      <div className="grid max-w-md place-items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full border border-app-border bg-app-surfaceElevated text-app-primary">
          <AppIcon name={icon} size={22} />
        </div>
        <div className="grid gap-2">
          <h3 className="font-semibold text-app-foreground">{title}</h3>
          {description ? <p className="text-sm leading-6 text-app-muted">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
