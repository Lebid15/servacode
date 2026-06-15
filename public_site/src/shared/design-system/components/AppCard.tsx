/**
 * =====================================================
 * AppCard
 * كرت مركزي بزجاجية أعمق وهوية تقنية V2
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppCardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "elevated" | "flat";
};

const tones = {
  default: "glass-panel",
  elevated: "glass-panel shadow-appGlow",
  flat: "border border-app-border bg-app-surface/84 shadow-appSoft"
};

export function AppCard({ className, tone = "default", ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        "premium-border rounded-app2Xl transition-all duration-300",
        "motion-safe:hover:-translate-y-1 hover:border-app-borderStrong",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
