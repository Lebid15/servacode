/**
 * =====================================================
 * AppLogo
 * شعار مركزي يدعم شعار الباكند أو أيقونة احتياطية باحتراف.
 * =====================================================
 */

import Image from "next/image";

import { buildBackendAssetUrl } from "@/shared/api/api-client";

import { AppIcon } from "./AppIcon";

type AppLogoProps = {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
};

export function AppLogo({ title, subtitle, logoUrl }: AppLogoProps) {
  const normalizedLogoUrl = buildBackendAssetUrl(logoUrl);

  return (
    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <span className="relative grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-appPill border border-app-border bg-app-surface/85 shadow-appGlow sm:h-[5.5rem] sm:w-[5.5rem] lg:h-[6.5rem] lg:w-[6.5rem]">
        {normalizedLogoUrl ? (
          <Image
            src={normalizedLogoUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 104px, (min-width: 640px) 88px, 72px"
            className="object-contain p-1 scale-[1.22] sm:p-1.5"
            priority
          />
        ) : (
          <AppIcon name="sparkles" size={38} className="text-app-primary sm:size-11" />
        )}
      </span>
      <span className="grid min-w-0 gap-0.5 xl:min-w-[13rem] 2xl:min-w-[16rem]">
        <strong className="truncate text-base font-black leading-none tracking-tight sm:text-lg lg:text-xl">
          {title}
        </strong>
        {subtitle ? (
          <span className="hidden max-w-[18rem] whitespace-nowrap text-xs font-semibold leading-5 text-app-muted md:block 2xl:max-w-[22rem]">
            {subtitle}
          </span>
        ) : null}
      </span>
    </div>
  );
}
