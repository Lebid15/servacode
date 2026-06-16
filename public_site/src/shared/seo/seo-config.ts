/**
 * =====================================================
 * إعدادات SEO المركزية للموقع العام
 * يتم التحكم بالقيم المهمة من متغيرات البيئة عند النشر
 * =====================================================
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "ServaCode",
  defaultTitle:
    process.env.NEXT_PUBLIC_SITE_TITLE ||
    "ServaCode — Software, Web, and Tech Services",
  defaultDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "ServaCode is a software company specialized in websites, web and desktop applications, management dashboards, ad design, and computer/technical services.",
  defaultLocale: "ar",
  locales: ["ar", "en"],
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@servacode",
  keywords: [
    "software company",
    "web development",
    "web applications",
    "desktop software",
    "management dashboards",
    "SaaS",
    "API integrations",
    "شركة برمجيات",
    "تطوير مواقع",
    "تطبيقات ويب",
    "برامج ديسك توب",
    "أنظمة إدارة"
  ]
} as const;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
