"use client";

/**
 * =====================================================
 * AppButton
 * زر مركزي يستخدم في كل الموقع ولوحة الأدمن
 * =====================================================
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/design-system/utils/cn";

type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AppButtonVariant;
  icon?: ReactNode;
};

const variantClasses: Record<AppButtonVariant, string> = {
  primary: "bg-app-primary text-app-primaryForeground shadow-appGlow hover:opacity-95",
  secondary: "border border-app-border bg-app-surfaceElevated text-app-foreground hover:bg-app-surface",
  ghost: "bg-transparent text-app-foreground hover:bg-app-surface",
  danger: "bg-app-danger text-white hover:opacity-95"
};

export function AppButton({ children, className, icon, variant = "primary", type = "button", ...props }: AppButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-appMd px-5 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
