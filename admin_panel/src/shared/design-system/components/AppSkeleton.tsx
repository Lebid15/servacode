/**
 * =====================================================
 * AppSkeleton
 * هيكل تحميل بسيط
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppSkeletonProps = {
  className?: string;
};

export function AppSkeleton({ className }: AppSkeletonProps) {
  return <div className={cn("animate-pulse rounded-appMd bg-app-surfaceElevated", className)} />;
}
