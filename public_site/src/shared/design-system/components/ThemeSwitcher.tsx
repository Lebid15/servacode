"use client";

/**
 * =====================================================
 * ThemeSwitcher
 * زر تبديل بين الوضع الفاتح والغامق بأيقونة Sun/Moon
 * =====================================================
 */

import { AppButton } from "./AppButton";
import { AppIcon } from "./AppIcon";
import { useTheme, type ThemeName } from "@/shared/design-system/themes/theme-provider";

type ThemeSwitcherProps = {
  label: string;
  labels: Record<ThemeName, string>;
};

export function ThemeSwitcher({ label, labels }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const nextTheme: ThemeName = theme === "blue-tech" ? "emerald-luxury" : "blue-tech";
  const iconName = nextTheme === "emerald-luxury" ? "sun" : "moon";

  return (
    <AppButton
      variant="secondary"
      size="icon"
      className="h-10 w-10 sm:h-11 sm:w-11"
      onClick={() => setTheme(nextTheme)}
      aria-label={`${label}: ${labels[nextTheme]}`}
      title={labels[nextTheme]}
    >
      <AppIcon name={iconName} size={18} />
    </AppButton>
  );
}
