/**
 * =====================================================
 * AppCard
 * بطاقة مركزية لكل الموقع ولوحة الأدمن
 * =====================================================
 */

import type { HTMLAttributes } from "react";

import { cn } from "@/shared/design-system/utils/cn";

type AppCardProps = HTMLAttributes<HTMLDivElement>;

export function AppCard({ className, ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        "rounded-appXl border border-app-border bg-app-surface/85 shadow-appCard backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
