# Performance + SEO Checklist

## SEO

- Metadata مركزية عبر `buildLocalizedMetadata`.
- Canonical URL لكل صفحة.
- hreflang للغتين ar/en.
- Open Graph tags.
- Twitter card.
- `sitemap.xml` ديناميكي.
- `robots.txt` ديناميكي.
- JSON-LD:
  - Organization
  - WebSite
  - Service
  - Article

## Performance

- Next image formats: AVIF + WebP.
- Static asset cache headers.
- Security headers أساسية.
- Route loading states.
- Server data revalidation عبر Public Client.
- `PublicOptimizedImage` لاستخدام `next/image`.
- ضغط responses عبر Next.js.

## متطلبات لاحقة

- تشغيل Lighthouse.
- فحص Core Web Vitals.
- إضافة صور حقيقية محسنة.
- تحسين bundle بعد بناء الصفحات النهائية.
- تفعيل CDN في الإنتاج.
- إضافة monitoring بعد النشر.
