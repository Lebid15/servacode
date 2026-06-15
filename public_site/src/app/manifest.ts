/**
 * =====================================================
 * Web App Manifest
 * يقرأ اسم الموقع وأيقونته من إعدادات منطقة الإدارة عند توفرها
 * =====================================================
 */

import type { MetadataRoute } from "next";

import { getPublicSettings } from "@/shared/api/public-client";
import { siteConfig } from "@/shared/seo/seo-config";


export const dynamic = "force-dynamic";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getPublicSettings().catch(() => null);
  const name = settings?.site_name_ar || settings?.site_name_en || siteConfig.name;
  const description = settings?.seo_description_ar || settings?.seo_description_en || siteConfig.defaultDescription;
  const icon = settings?.favicon_url || "/icon.png";
  const startLocale = settings?.default_language === "en" && settings?.is_english_enabled !== false ? "en" : "ar";
  const isEmerald = settings?.active_theme === "emerald-luxury";

  return {
    name,
    short_name: name,
    description,
    start_url: `/${startLocale}`,
    display: "standalone",
    background_color: isEmerald ? "#041812" : "#061225",
    theme_color: isEmerald ? "#34d399" : "#38a8ff",
    icons: [
      {
        src: icon,
        sizes: "512x512",
        type: "image/png"
      }
    ],
    categories: ["business", "productivity", "technology"],
    lang: startLocale,
    dir: startLocale === "ar" ? "rtl" : "ltr"
  };
}
