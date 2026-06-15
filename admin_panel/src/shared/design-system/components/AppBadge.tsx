/**
 * =====================================================
 * AppBadge
 * شارة مركزية للحالات والقيم المختصرة
 * =====================================================
 */

import type { HTMLAttributes } from "react";

import { cn } from "@/shared/design-system/utils/cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

type AppBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-app-border bg-app-surfaceElevated text-app-foreground",
  success: "border-app-success/30 bg-app-success/15 text-app-success",
  warning: "border-app-warning/30 bg-app-warning/15 text-app-warning",
  danger: "border-app-danger/30 bg-app-danger/15 text-app-danger",
  primary: "border-app-primary/30 bg-app-primary/15 text-app-primary"
};

export function AppBadge({ className, tone = "neutral", ...props }: AppBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
