/**
 * =====================================================
 * Structured Data Helpers
 * أدوات مركزية لبناء JSON-LD اعتمادًا على إعدادات هوية الشركة
 * =====================================================
 */

import type { PublicSettings } from "@/shared/api/public-client";
import { buildBackendAssetUrl } from "@/shared/api/api-client";
import type { Locale } from "@/shared/design-system/utils/direction";
import { localizedSetting } from "@/shared/public/settings-utils";
import { getAbsoluteUrl, getSiteUrl, siteConfig } from "./seo-config";

type StructuredDataOptions = {
  settings?: PublicSettings | null;
  name?: string;
  description?: string;
  logoUrl?: string | null;
};

function organizationName(locale: Locale, options: StructuredDataOptions = {}) {
  return (
    options.name ||
    localizedSetting(locale, options.settings?.site_name_ar, options.settings?.site_name_en, siteConfig.name)
  );
}

function organizationDescription(locale: Locale, options: StructuredDataOptions = {}) {
  return (
    options.description ||
    localizedSetting(
      locale,
      options.settings?.company_description_ar || options.settings?.seo_description_ar,
      options.settings?.company_description_en || options.settings?.seo_description_en,
      siteConfig.defaultDescription
    )
  );
}

function absoluteAssetUrl(url?: string | null) {
  if (!url) {
    return getAbsoluteUrl("/icon.png");
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return buildBackendAssetUrl(url);
  }

  return getAbsoluteUrl(url.startsWith("/") ? url : `/${url}`);
}

function organizationLogo(options: StructuredDataOptions = {}) {
  return absoluteAssetUrl(options.logoUrl || options.settings?.logo_url || options.settings?.favicon_url);
}

function socialSameAs(settings?: PublicSettings | null) {
  return Object.values(settings?.social_links ?? {}).filter(Boolean);
}

function contactPoints(settings?: PublicSettings | null) {
  const points = [];

  if (settings?.phone) {
    points.push({
      "@type": "ContactPoint",
      telephone: settings.phone,
      contactType: "customer service"
    });
  }

  if (settings?.support_phone) {
    points.push({
      "@type": "ContactPoint",
      telephone: settings.support_phone,
      contactType: "technical support"
    });
  }

  if (settings?.support_email || settings?.email) {
    points.push({
      "@type": "ContactPoint",
      email: settings.support_email || settings.email,
      contactType: "support"
    });
  }

  return points;
}

export function organizationJsonLd(locale: Locale, options: StructuredDataOptions = {}) {
  const siteUrl = getSiteUrl();
  const name = organizationName(locale, options);
  const address = localizedSetting(locale, options.settings?.address_ar, options.settings?.address_en, "");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: `${siteUrl}/${locale}`,
    logo: organizationLogo(options),
    description: organizationDescription(locale, options),
    email: options.settings?.email || undefined,
    telephone: options.settings?.phone || undefined,
    address: address || undefined,
    sameAs: socialSameAs(options.settings),
    contactPoint: contactPoints(options.settings)
  };
}

export function websiteJsonLd(locale: Locale, options: StructuredDataOptions = {}) {
  const siteUrl = getSiteUrl();
  const name = organizationName(locale, options);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: `${siteUrl}/${locale}`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name,
      url: `${siteUrl}/${locale}`,
      logo: organizationLogo(options)
    }
  };
}

export function professionalServiceJsonLd(locale: Locale, options: StructuredDataOptions = {}) {
  const siteUrl = getSiteUrl();
  const address = localizedSetting(locale, options.settings?.address_ar, options.settings?.address_en, "");

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: organizationName(locale, options),
    url: `${siteUrl}/${locale}`,
    description: organizationDescription(locale, options),
    logo: organizationLogo(options),
    email: options.settings?.email || options.settings?.support_email || undefined,
    telephone: options.settings?.phone || options.settings?.support_phone || undefined,
    address: address || undefined,
    areaServed: "Worldwide",
    serviceType: [
      "Web Development",
      "Web Applications",
      "Desktop Software",
      "Management Dashboards",
      "API Integrations",
      "SaaS Products"
    ],
    inLanguage: locale
  };
}

export function serviceJsonLd(locale: Locale, title: string, description: string, path: string, providerName = siteConfig.name) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description,
    url: `${siteUrl}${path}`,
    inLanguage: locale,
    provider: {
      "@type": "Organization",
      name: providerName,
      url: `${siteUrl}/${locale}`
    }
  };
}

export function productJsonLd(locale: Locale, title: string, description: string, path: string, publisherName = siteConfig.name) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    url: `${siteUrl}${path}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Windows",
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: `${siteUrl}/${locale}`
    }
  };
}

export function articleJsonLd(
  locale: Locale,
  title: string,
  description: string,
  path: string,
  publishedAt?: string | null,
  publisherName = siteConfig.name,
  logoUrl?: string | null
) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${siteUrl}${path}`,
    inLanguage: locale,
    datePublished: publishedAt || undefined,
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: {
        "@type": "ImageObject",
        url: absoluteAssetUrl(logoUrl)
      }
    }
  };
}
