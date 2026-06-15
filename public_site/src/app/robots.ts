/**
 * =====================================================
 * robots.txt ديناميكي
 * يحمي النسخ المحلية/التجريبية من الفهرسة، ويفتح الفهرسة فقط عند التفعيل الصريح.
 * =====================================================
 */

import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/shared/seo/seo-config";

function isIndexingAllowed() {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (!isIndexingAllowed()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/"
        }
      ],
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/admin",
          "/ar/admin",
          "/en/admin",
          "/_next/static/development",
          "/maintenance"
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
