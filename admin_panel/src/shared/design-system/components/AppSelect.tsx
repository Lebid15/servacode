"use client";

/**
 * =====================================================
 * AppSelect
 * قائمة اختيار مركزية
 * =====================================================
 */

import type { SelectHTMLAttributes } from "react";

import { cn } from "@/shared/design-system/utils/cn";

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function AppSelect({ className, label, error, children, ...props }: AppSelectProps) {
  return (
    <label className="grid gap-2">
      {label ? <span className="text-sm font-medium text-app-foreground">{label}</span> : null}
      <select
        className={cn(
          "min-h-11 rounded-appMd border border-app-border bg-app-surface px-4 text-app-foreground outline-none transition focus:border-app-primary",
          error && "border-app-danger",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-sm text-app-danger">{error}</span> : null}
    </label>
  );
}
