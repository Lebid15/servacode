/**
 * =====================================================
 * تحميل ملفات الترجمة
 * لا يتم كتابة نصوص واجهة مباشرة داخل الصفحات
 * =====================================================
 */

import ar from "./ar.json";
import en from "./en.json";
import type { Locale } from "@/shared/design-system/utils/direction";

const dictionaries = {
  ar,
  en
} as const;

export type Dictionary = typeof ar;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] ?? dictionaries.ar;
}
