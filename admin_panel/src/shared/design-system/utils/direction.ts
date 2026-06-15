/**
 * =====================================================
 * أدوات اللغة والاتجاه
 * تحدد RTL/LTR حسب اللغة
 * =====================================================
 */

export type Locale = "ar" | "en";
export type Direction = "rtl" | "ltr";

export const supportedLocales: Locale[] = ["ar", "en"];

export function isSupportedLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export function localeToDirection(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}
