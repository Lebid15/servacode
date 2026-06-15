/**
 * =====================================================
 * أدوات تنسيق عامة
 * تستخدم لاحقًا في الجداول والبطاقات
 * =====================================================
 */

import type { Locale } from "./direction";

export function formatDate(value: string | Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en").format(value);
}
