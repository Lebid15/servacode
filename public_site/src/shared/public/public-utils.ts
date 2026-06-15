/**
 * =====================================================
 * أدوات الموقع العام
 * تختار النص المناسب حسب اللغة وتحافظ على بساطة الصفحات
 * =====================================================
 */

import type { Locale } from "@/shared/design-system/utils/direction";

export function pickLocalized(locale: Locale, ar?: string | null, en?: string | null) {
  return locale === "ar" ? ar || en || "" : en || ar || "";
}

export function pickSlug(locale: Locale, slugAr?: string | null, slugEn?: string | null) {
  return locale === "ar" ? slugAr || slugEn || "" : slugEn || slugAr || "";
}
