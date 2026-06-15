/**
 * =====================================================
 * AppLogo
 * شعار مركزي يدعم شعار الهوية من الباكند أو أيقونة احتياطية احترافية.
 * =====================================================
 */

"use client";

import { useMemo, useState } from "react";

import { cn } from "@/shared/design-system/utils/cn";

import { AppIcon } from "./AppIcon";

type AppLogoProps = {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

function getBackendOrigin() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

function normalizeLogoUrl(url?: string | null) {
  const value = url?.trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/uploads/") || value.startsWith("/media/")) {
    return `${getBackendOrigin()}${value}`;
  }

  if (value.startsWith("/")) {
    return `${getBackendOrigin()}${value}`;
  }

  return `${getBackendOrigin()}/${value}`;
}

export function AppLogo({ title, subtitle, logoUrl, className, markClassName, textClassName }: AppLogoProps) {
  const normalizedLogoUrl = useMemo(() => normalizeLogoUrl(logoUrl), [logoUrl]);
  const [hasLogoError, setHasLogoError] = useState(false);
  const shouldShowLogo = Boolean(normalizedLogoUrl) && !hasLogoError;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <span
        className={cn(
          "relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-app-primary/25 bg-app-surface/90 text-app-primary shadow-appGlow ring-1 ring-app-primary/15",
          markClassName,
        )}
      >
        {shouldShowLogo ? (
          <img
            src={normalizedLogoUrl!}
            alt={title}
            className="h-full w-full rounded-full object-contain p-0.5"
            loading="eager"
            decoding="async"
            onError={() => setHasLogoError(true)}
          />
        ) : (
          <span className="grid h-full w-full place-items-center rounded-full bg-app-primary/10">
            <AppIcon name="sparkles" size={22} />
          </span>
        )}
      </span>
      <span className={cn("grid min-w-0 gap-0.5", textClassName)}>
        <strong className="truncate text-base font-black leading-tight text-app-foreground">{title}</strong>
        {subtitle ? <span className="line-clamp-2 text-xs font-semibold leading-5 text-app-muted">{subtitle}</span> : null}
      </span>
    </div>
  );
}
