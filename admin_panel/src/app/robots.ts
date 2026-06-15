/**
 * =====================================================
 * robots.txt للوحة الأدمن
 * لوحة التحكم ليست محتوى عامًا، لذلك نمنع أرشفتها بالكامل.
 * =====================================================
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/"
      }
    ]
  };
}
