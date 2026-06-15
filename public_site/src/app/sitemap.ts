/**
 * =====================================================
 * sitemap.xml ديناميكي
 * يحترم إعدادات الأدمن: اللغة الإنكليزية والأقسام الظاهرة والمحتوى الفعلي
 * =====================================================
 */

import type { MetadataRoute } from "next";

import {
  getPublicApps,
  getPublicPortfolio,
  getPublicProducts,
  getPublicServices,
  getPublicSettings
} from "@/shared/api/public-client";
import { pickSlug } from "@/shared/public/public-utils";
import { getAppDownloads } from "@/shared/public/app-utils";
import { getSiteUrl } from "@/shared/seo/seo-config";
import type { Locale } from "@/shared/design-system/utils/direction";
import { isEnglishEnabled, isPublicSectionVisible } from "@/shared/public/settings-utils";


export const dynamic = "force-dynamic";
const alwaysStaticRoutes = ["", "/about", "/contact", "/quote-request", "/support", "/privacy", "/terms"];

function entry(
  url: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  priority = 0.7
): MetadataRoute.Sitemap[number] {
  return {
    url,
    lastModified: new Date(),
    changeFrequency,
    priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const settings = await getPublicSettings().catch(() => null);
  const locales: Locale[] = isEnglishEnabled(settings) ? ["ar", "en"] : ["ar"];
  const items: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of alwaysStaticRoutes) {
      items.push(entry(`${siteUrl}/${locale}${route}`, route === "" ? "daily" : "weekly", route === "" ? 1 : 0.78));
    }
  }

  const [services, products, apps, portfolio] = await Promise.all([
    getPublicServices().catch(() => []),
    getPublicProducts().catch(() => []),
    getPublicApps().catch(() => []),
    getPublicPortfolio().catch(() => [])
  ]);

  for (const locale of locales) {
    if (services.length > 0 && isPublicSectionVisible(settings, "services")) {
      items.push(entry(`${siteUrl}/${locale}/services`, "weekly", 0.72));
      services.forEach((item) => {
        items.push(entry(`${siteUrl}/${locale}/services/${pickSlug(locale, item.slug_ar, item.slug_en)}`, "weekly", 0.68));
      });
    }

    if (products.length > 0 && isPublicSectionVisible(settings, "products")) {
      items.push(entry(`${siteUrl}/${locale}/products`, "weekly", 0.72));
      products.forEach((item) => {
        items.push(entry(`${siteUrl}/${locale}/products/${pickSlug(locale, item.slug_ar, item.slug_en)}`, "weekly", 0.7));
      });
    }

    if (apps.length > 0 && isPublicSectionVisible(settings, "apps")) {
      items.push(entry(`${siteUrl}/${locale}/apps`, "weekly", 0.72));
      if (apps.some((item) => getAppDownloads(item, locale).length > 0)) {
        items.push(entry(`${siteUrl}/${locale}/downloads`, "weekly", 0.68));
      }
      apps.forEach((item) => {
        items.push(entry(`${siteUrl}/${locale}/apps/${pickSlug(locale, item.slug_ar, item.slug_en)}`, "weekly", 0.7));
      });
    }

    if (portfolio.length > 0 && isPublicSectionVisible(settings, "portfolio")) {
      items.push(entry(`${siteUrl}/${locale}/portfolio`, "monthly", 0.65));
      portfolio.forEach((item) => {
        items.push(entry(`${siteUrl}/${locale}/portfolio/${pickSlug(locale, item.slug_ar, item.slug_en)}`, "monthly", 0.62));
      });
    }
  }

  return items;
}
