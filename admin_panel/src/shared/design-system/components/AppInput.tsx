"use client";

/**
 * =====================================================
 * AppInput
 * حقل إدخال مركزي موحد
 * =====================================================
 */

import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/design-system/utils/cn";

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  labelAction?: ReactNode;
  startIcon?: ReactNode;
  endAction?: ReactNode;
};

const HIDE_TRANSLATION_FIELDS = process.env.NEXT_PUBLIC_ADMIN_HIDE_TRANSLATION_FIELDS !== "false";

function normalizeLabel(value?: string) {
  return String(value ?? "").trim().toLowerCase();
}

function isEnglishTranslationLabel(label?: string) {
  const value = normalizeLabel(label);
  if (!value) {
    return false;
  }

  if (/اللغة\s+الإنجليزية|اللغة\s+الانجليزية|english\s+language|enable\s+english|english\s+enabled/i.test(value)) {
    return false;
  }

  return /بالإنجليزية|بالانجليزية|إنجليزي|انجليزي|\benglish\b|\ben\b/i.test(value);
}

function isArabicPrimaryLabel(label?: string) {
  const value = normalizeLabel(label);
  if (!value) {
    return false;
  }

  if (/اللغة\s+العربية|arabic\s+language/i.test(value)) {
    return false;
  }

  return /بالعربية|بالعربي|عربي|العربية|\barabic\b|\bar\b/i.test(value);
}

export function AppInput({ className, label, error, id, type, labelAction, startIcon, endAction, ...props }: AppInputProps) {
  const shouldHideTranslationField = HIDE_TRANSLATION_FIELDS && type !== "checkbox" && isEnglishTranslationLabel(label);
  const shouldExpandPrimaryField = HIDE_TRANSLATION_FIELDS && isArabicPrimaryLabel(label);

  if (shouldHideTranslationField) {
    return null;
  }

  return (
    <label className={cn("grid gap-2", shouldExpandPrimaryField && "md:col-span-2")}>
      {label || labelAction ? (
        <span className="flex min-h-6 items-center justify-between gap-2 text-sm font-medium text-app-foreground">
          <span>{label}</span>
          {labelAction ? <span className="shrink-0">{labelAction}</span> : null}
        </span>
      ) : null}
      <div className="relative">
        {startIcon ? (
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-app-muted">
            {startIcon}
          </span>
        ) : null}
        <input
          id={id}
          type={type}
          className={cn(
            "min-h-11 w-full rounded-appMd border border-app-border bg-app-surface px-4 text-app-foreground outline-none transition focus:border-app-primary",
            startIcon && "ps-11",
            endAction && "pe-11",
            error && "border-app-danger",
            className,
          )}
          {...props}
        />
        {endAction ? (
          <span className="absolute inset-y-0 end-3 flex items-center">
            {endAction}
          </span>
        ) : null}
      </div>
      {error ? <span className="text-sm text-app-danger">{error}</span> : null}
    </label>
  );
}
