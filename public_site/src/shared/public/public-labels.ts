/**
 * =====================================================
 * public-labels
 * تسميات مركزية لقيم الحالة والنوع والمنصة في الموقع العام.
 *
 * الهدف: عدم عرض القيم التقنية مثل coming_soon أو cross_platform للزائر،
 * وإبقاء النصوص مفهومة بالعربية والإنجليزية بدون تكرار داخل الصفحات.
 * =====================================================
 */

import type { Locale } from "@/shared/design-system/utils/direction";

const LABELS: Record<string, { ar: string; en: string }> = {
  available: { ar: "متاح", en: "Available" },
  coming_soon: { ar: "قريبًا", en: "Coming soon" },
  in_development: { ar: "قيد التطوير", en: "In development" },
  beta: { ar: "نسخة تجريبية", en: "Beta" },
  hidden: { ar: "مخفي", en: "Hidden" },
  published: { ar: "منشور", en: "Published" },
  draft: { ar: "مسودة", en: "Draft" },

  free: { ar: "مجاني", en: "Free" },
  paid: { ar: "مدفوع", en: "Paid" },
  freemium: { ar: "مجاني جزئيًا", en: "Freemium" },
  contact: { ar: "حسب الطلب", en: "Contact us" },

  web: { ar: "ويب", en: "Web" },
  desktop: { ar: "سطح مكتب", en: "Desktop" },
  mobile: { ar: "موبايل", en: "Mobile" },
  saas: { ar: "SaaS", en: "SaaS" },
  api: { ar: "API", en: "API" },
  tool: { ar: "أداة", en: "Tool" },
  other: { ar: "أخرى", en: "Other" },

  windows: { ar: "Windows", en: "Windows" },
  macos: { ar: "macOS", en: "macOS" },
  linux: { ar: "Linux", en: "Linux" },
  android: { ar: "Android", en: "Android" },
  ios: { ar: "iOS", en: "iOS" },
  cross_platform: { ar: "متعدد المنصات", en: "Cross-platform" },
};

export function formatPublicLabel(locale: Locale, value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return "";
  }

  const entry = LABELS[normalized];
  if (entry) {
    return locale === "ar" ? entry.ar : entry.en;
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatPublicLabels(locale: Locale, values: Array<string | null | undefined>) {
  return values.map((value) => formatPublicLabel(locale, value)).filter(Boolean);
}
