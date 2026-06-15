/**
 * =====================================================
 * AppButton
 * زر مركزي احترافي بأحجام أوضح للهوية البصرية V2
 * =====================================================
 */

import { cn } from "@/shared/design-system/utils/cn";

type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
};

const variants = {
  primary:
    "app-shine border-transparent bg-[image:var(--gradient-primary)] text-app-primaryForeground shadow-appGlow hover:brightness-110",
  secondary:
    "border-app-border bg-app-surface/78 text-app-foreground shadow-appSoft hover:border-app-borderStrong hover:bg-app-surfaceElevated",
  ghost:
    "border-transparent bg-transparent text-app-muted hover:bg-app-surface/70 hover:text-app-foreground",
  danger:
    "border-transparent bg-app-danger text-white shadow-appSoft hover:brightness-110"
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-[3.25rem] px-7 text-base",
  xl: "min-h-[3.5rem] px-8 text-[1.05rem]",
  icon: "h-11 w-11 px-0"
};

export function AppButton({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-appPill border font-black transition-all duration-200 text-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-background))]",
        "disabled:pointer-events-none disabled:opacity-55",
        "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
