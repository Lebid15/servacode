/**
 * =====================================================
 * AppBadge
 * بادج مركزي للحالات والشارات التسويقية — Premium V2
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
};

const tones = {
  primary:
    "border-[hsl(var(--color-primary)/0.38)] bg-[hsl(var(--color-primary)/0.14)] text-app-primary shadow-appGlowSoft",
  success:
    "border-[hsl(var(--color-success)/0.34)] bg-[hsl(var(--color-success)/0.13)] text-app-success",
  warning:
    "border-[hsl(var(--color-warning)/0.36)] bg-[hsl(var(--color-warning)/0.13)] text-[hsl(var(--color-warning))]",
  danger:
    "border-[hsl(var(--color-danger)/0.36)] bg-[hsl(var(--color-danger)/0.13)] text-app-danger",
  neutral: "border-app-border bg-app-surface/74 text-app-muted"
};

export function AppBadge({ className, tone = "neutral", ...props }: AppBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-appPill border px-3.5 py-1.5 text-xs font-black tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
