# Step 12 — Public Site Cleanup + Critical Audit Fixes

تم تنفيذ تنظيف حرج للموقع العام فقط.

## ما تم إصلاحه

```text
1. إصلاح public/icon.png واستبداله بأيقونة PNG صحيحة.
2. حذف كود الأدمن من public_site:
   - src/shared/admin
   - src/shared/auth
   - src/shared/api/admin-client.ts
   - src/shared/api/auth-client.ts
   - AdminShell/AdminLayout/Sidebar/Topbar
3. إزالة AdminAuthProvider من AppProviders.
4. حذف ملفات الثيمات القديمة blue-tech / emerald-luxury.
5. حذف STAGE_*_REPORT.md القديمة.
6. تحسين SSR lang/dir عبر middleware.
7. تحديث README و PRODUCTION_COMMANDS.
8. إضافة PUBLIC_SITE_CLEANUP_AUDIT_REPORT.json.
```

## طريقة الفحص

```powershell
cd D:\company_platform\public_site
npm run clean
npm run check
npm run dev:3000
```

## صفحات الفحص

```text
/ar
/en
/ar/about
/ar/contact
/ar/quote-request
/ar/services
/ar/products
/ar/portfolio
/ar/blog
/robots.txt
/sitemap.xml
/manifest.webmanifest
/opengraph-image
```
