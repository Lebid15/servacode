"use client";

/**
 * =====================================================
 * ThemeSwitcher
 * يبدل بين الوضع الفاتح والغامق بأيقونة واضحة
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
      onClick={() => setTheme(nextTheme)}
      aria-label={`${label}: ${labels[nextTheme]}`}
      title={labels[nextTheme]}
      className="min-h-11 w-11 rounded-full px-0"
    >
      <AppIcon name={iconName} size={18} />
    </AppButton>
  );
}
