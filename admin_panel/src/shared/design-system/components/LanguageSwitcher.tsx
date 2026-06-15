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
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale: Locale = locale === "ar" ? "en" : "ar";

  const switchLanguage = () => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  };

  return (
    <AppButton
      variant="secondary"
      onClick={switchLanguage}
      aria-label={label}
      title={label}
      className="min-h-11 gap-2 rounded-full px-3"
    >
      <AppIcon name="languages" size={18} />
      <span className="text-xs font-black tracking-wide">{nextLocale.toUpperCase()}</span>
    </AppButton>
  );
}
