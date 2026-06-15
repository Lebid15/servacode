"use client";

/**
 * =====================================================
 * ThemeProvider
 * يدير الثيم النشط ويطبقه مركزيًا على html[data-theme].
 * أسماء الثيمات مطابقة للباكند، مع دعم قيم light/dark القديمة للتوافق.
 * =====================================================
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { ThemeName } from "./theme-types";

const themes = {
  "blue-tech": {
    name: "blue-tech",
    labelAr: "الأزرق التقني",
    labelEn: "Blue Tech"
  },
  "emerald-luxury": {
    name: "emerald-luxury",
    labelAr: "الزمردي الفاخر",
    labelEn: "Emerald Luxury"
  }
} as const;

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: typeof themes;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme: ThemeName;
};

function resolveTheme(value: string | null, fallback: ThemeName): ThemeName {
  if (value === "blue-tech" || value === "dark") {
    return "blue-tech";
  }

  if (value === "emerald-luxury" || value === "light") {
    return "emerald-luxury";
  }

  return fallback;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  const setTheme = useCallback((nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    window.localStorage.setItem("company-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("company-theme");
    const resolvedTheme = resolveTheme(savedTheme, initialTheme);
    setThemeState(resolvedTheme);
    document.documentElement.dataset.theme = resolvedTheme;
  }, [initialTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      availableThemes: themes
    }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export type { ThemeName };
