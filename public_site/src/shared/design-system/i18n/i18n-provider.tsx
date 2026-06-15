"use client";

/**
 * =====================================================
 * I18n Provider
 * يوفر اللغة الحالية للمكونات العميلة
 * =====================================================
 */

import { createContext, useContext } from "react";

import type { Locale } from "@/shared/design-system/utils/direction";

type I18nContextValue = {
  locale: Locale;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: React.ReactNode;
  locale: Locale;
};

export function I18nProvider({ children, locale }: I18nProviderProps) {
  return <I18nContext.Provider value={{ locale }}>{children}</I18nContext.Provider>;
}

export function useLocale() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useLocale must be used inside I18nProvider");
  }

  return context.locale;
}
