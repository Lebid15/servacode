/**
 * =====================================================
 * إعدادات SEO المركزية للموقع العام
 * يتم التحكم بالقيم المهمة من متغيرات البيئة عند النشر
 * =====================================================
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Software Studio",
  defaultTitle:
    process.env.NEXT_PUBLIC_SITE_TITLE ||
    "Software Studio — Professional Software Systems",
  defaultDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Professional software company specialized in websites, web applications, desktop software, management dashboards, SaaS products, and API integrations.",
  defaultLocale: "ar",
  locales: ["ar", "en"],
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@softwarestudio",
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
