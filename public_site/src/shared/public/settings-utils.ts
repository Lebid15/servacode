/**
 * =====================================================
 * Public Settings Utils
 * أدوات مركزية للتعامل مع إعدادات الموقع القادمة من منطقة الإدارة
 * =====================================================
 */

import type { PublicSettings } from "@/shared/api/public-client";
import type { Locale } from "@/shared/design-system/utils/direction";

export type PublicSectionKey =
  | "build"
  | "composition"
  | "architecture"
  | "why"
  | "process"
  | "technologies"
  | "services"
  | "products"
  | "apps"
  | "portfolio"
  | "testimonials"
  | "faqs"
  | "cta";

export const publicSectionKeys: PublicSectionKey[] = [
  "build",
  "composition",
  "architecture",
  "why",
  "process",
  "technologies",
  "services",
  "products",
  "apps",
  "portfolio",
  "testimonials",
  "faqs",
  "cta"
];

export function localizedSetting(
  locale: Locale,
  arValue?: string | null,
  enValue?: string | null,
  fallback = ""
) {
  const value = locale === "ar" ? arValue : enValue;
  return value?.trim() || fallback;
}

export function getPublicBrandName(settings: PublicSettings | null | undefined, locale: Locale, fallback: string) {
  return localizedSetting(locale, settings?.site_name_ar, settings?.site_name_en, fallback);
}

export function getPublicSeoTitle(settings: PublicSettings | null | undefined, locale: Locale, fallback: string) {
  return localizedSetting(locale, settings?.seo_title_ar, settings?.seo_title_en, fallback);
}

export function getPublicSeoDescription(settings: PublicSettings | null | undefined, locale: Locale, fallback: string) {
  return localizedSetting(locale, settings?.seo_description_ar, settings?.seo_description_en, fallback);
}

export function getPublicFooterText(settings: PublicSettings | null | undefined, locale: Locale, fallback: string) {
  return localizedSetting(locale, settings?.footer_text_ar, settings?.footer_text_en, fallback);
}

export function getPublicMaintenanceMessage(settings: PublicSettings | null | undefined, locale: Locale, fallback: string) {
  return localizedSetting(locale, settings?.maintenance_message_ar, settings?.maintenance_message_en, fallback);
}


function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getPublicExtraSettings(settings: PublicSettings | null | undefined) {
  return readRecord(settings?.extra_settings);
}

export function getPublicHomeSettings(settings: PublicSettings | null | undefined) {
  return readRecord(getPublicExtraSettings(settings).home);
}

export function getPublicHomeText(
  settings: PublicSettings | null | undefined,
  locale: Locale,
  key: string,
  fallback: string,
) {
  const home = getPublicHomeSettings(settings);
  const localizedKey = `${key}_${locale}`;
  const alternativeKey = locale === "ar" ? `${key}_en` : `${key}_ar`;
  return readText(home[localizedKey]) ?? readText(home[key]) ?? readText(home[alternativeKey]) ?? fallback;
}

export function getPublicHomeStringList(
  settings: PublicSettings | null | undefined,
  key: string,
  fallback: string[],
) {
  const value = getPublicHomeSettings(settings)[key];
  if (!Array.isArray(value)) {
    return fallback;
  }

  const list = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return list.length ? list : fallback;
}

const defaultPublicSectionVisibility: Record<PublicSectionKey, boolean> = {
  build: true,
  composition: false,
  architecture: false,
  why: true,
  process: false,
  technologies: false,
  services: true,
  products: true,
  apps: true,
  portfolio: true,
  testimonials: false,
  faqs: false,
  cta: true
};

export function isPublicSectionVisible(settings: PublicSettings | null | undefined, key: PublicSectionKey) {
  const value = settings?.visible_sections?.[key];
  return value === undefined ? defaultPublicSectionVisibility[key] : Boolean(value);
}

export function isEnglishEnabled(settings: PublicSettings | null | undefined) {
  return settings?.is_english_enabled === undefined ? true : Boolean(settings.is_english_enabled);
}
