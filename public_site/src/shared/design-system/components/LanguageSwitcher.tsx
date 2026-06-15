"use client";

/**
 * =====================================================
 * LanguageSwitcher
 * زر لغة صغير ومرتب بأيقونة واضحة مع الحفاظ على المسار الحالي
 * =====================================================
 */

import { usePathname, useRouter } from "next/navigation";

import { AppButton } from "./AppButton";
import { AppIcon } from "./AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  enabled?: boolean;
};

export function LanguageSwitcher({ locale, label, enabled = true }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale: Locale = locale === "ar" ? "en" : "ar";

  if (!enabled) {
    return null;
  }

  const switchLanguage = () => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  };

  return (
    <AppButton
      variant="secondary"
      size="icon"
      onClick={switchLanguage}
      aria-label={label}
      title={label}
      className="h-11 w-11 rounded-full border border-app-border/80 bg-app-surface/80 shadow-appSoft hover:bg-app-surface"
    >
      <AppIcon name="globe" size={19} />
    </AppButton>
  );
}
