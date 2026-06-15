/**
 * =====================================================
 * AppToast
 * مكون أساس للتنبيهات الخفيفة
 * سيتم تطويره لاحقًا بنظام Toast Provider
 * =====================================================
 */

import { AppBadge } from "./AppBadge";

type AppToastProps = {
  title: string;
  description?: string;
};

export function AppToast({ title, description }: AppToastProps) {
  return (
    <div className="rounded-appLg border border-app-border bg-app-surface p-4 shadow-appCard">
      <AppBadge tone="primary">{title}</AppBadge>
      {description ? <p className="mt-2 text-sm text-app-muted">{description}</p> : null}
    </div>
  );
}
