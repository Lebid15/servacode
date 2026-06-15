/**
 * =====================================================
 * Metadata Helpers
 * أدوات مركزية لبناء Metadata لكل صفحات الموقع
 * =====================================================
 */

import type { Metadata } from "next";

import { buildBackendAssetUrl } from "@/shared/api/api-client";
import type { Locale } from "@/shared/design-system/utils/direction";
import { getAbsoluteUrl, getSiteUrl, siteConfig } from "./seo-config";

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  siteName?: string;
  faviconUrl?: string | null;
  noIndex?: boolean;
  englishEnabled?: boolean;
};

function stripLocaleFromPath(path: string) {
  return path.replace(/^\/(ar|en)/, "") || "/";
}

function isEnglishAlternateEnabled(input: MetadataInput) {
  if (typeof input.englishEnabled === "boolean") {
    return input.englishEnabled;
  }

  return process.env.NEXT_PUBLIC_ENGLISH_ENABLED !== "false";
}

function isIndexingAllowed() {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}

export function buildLocalizedMetadata(locale: Locale, input: MetadataInput = {}): Metadata {
  const siteUrl = getSiteUrl();
  const siteName = input.siteName || siteConfig.name;
  const title = input.title ? `${input.title} | ${siteName}` : siteConfig.defaultTitle;
  const description = input.description || siteConfig.defaultDescription;
  const path = input.path || `/${locale}`;
  const canonical = getAbsoluteUrl(path);
  const image = input.image ? buildBackendAssetUrl(input.image) || input.image : getAbsoluteUrl("/opengraph-image");
  const favicon = input.faviconUrl
    ? buildBackendAssetUrl(input.faviconUrl) || input.faviconUrl
    : "/icon.png";
  const localeFreePath = stripLocaleFromPath(path);

  const languages: Record<string, string> = {
    ar: getAbsoluteUrl(`/ar${localeFreePath === "/" ? "" : localeFreePath}`)
  };

  if (isEnglishAlternateEnabled(input)) {
    languages.en = getAbsoluteUrl(`/en${localeFreePath === "/" ? "" : localeFreePath}`);
  }

  languages["x-default"] = getAbsoluteUrl(`/${siteConfig.defaultLocale}${localeFreePath === "/" ? "" : localeFreePath}`);
  const shouldIndex = !input.noIndex && isIndexingAllowed();

  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteName,
    title,
    description,
    keywords: [...siteConfig.keywords],
    category: "technology",
    alternates: {
      canonical,
      languages
    },
    icons: {
      icon: favicon,
      apple: favicon
    },
    openGraph: {
      type: "website",
      siteName,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      title,
      description,
      url: canonical,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title,
      description,
      images: [image]
    },
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
          }
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false
          }
        }
  };
}
