# Public Site Visual V2 — Release Candidate

هذه النسخة هي مرشح الاعتماد البصري للموقع العام بعد مراحل Visual V2.

## النطاق

```text
public_site فقط
```

لم يتم لمس:

```text
admin_panel
backend
```

## ما تحتويه النسخة

```text
Design System مركزي
Light / Dark
Arabic / English
Premium Hero V2
Dashboard / Architecture Visual
System Architecture Showcase
Home Proof Strip
Home Composition Showcase
Premium Cards
Responsive Mobile Polish
SEO / Sitemap / Robots / Manifest
OpenGraph Image
Final Visual QA Checklist
Static Audit Report
```

## أوامر الفحص

```powershell
cd D:\company_platform\public_site
npm run clean
npm run check
npm run dev:3000
```

## صفحات الفحص الأساسية

```text
http://localhost:3000/ar
http://localhost:3000/en
http://localhost:3000/ar/about
http://localhost:3000/ar/contact
http://localhost:3000/ar/quote-request
http://localhost:3000/ar/services
http://localhost:3000/ar/products
http://localhost:3000/ar/portfolio
http://localhost:3000/ar/blog
```

## ملفات تدقيق داخل النسخة

```text
PUBLIC_SITE_VISUAL_V2_FINAL_AUDIT.json
PUBLIC_SITE_FINAL_VISUAL_QA.md
PUBLIC_SITE_VISUAL_V2_NOTES.md
PUBLIC_SITE_QA_CHECKLIST.md
PUBLIC_SITE_HANDOFF_SUMMARY.md
```

## قرار الاعتماد

لا نعتمد النسخة بصريًا قبل:

```text
1. نجاح npm run check
2. فتح /ar و /en
3. فحص Light/Dark
4. فحص Mobile/Desktop
5. إرسال صور من الصفحة الرئيسية والصفحات الأساسية
```
