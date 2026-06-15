# Phase 15.8 — Admin + Backend Closure

## الهدف
إغلاق أهم ملاحظات لوحة التحكم والباكند قبل متابعة الفحص البصري النهائي:

- تثبيت صفحة مكتبة الوسائط بدل ظهور 404 على `/ar/admin/media`.
- منع انهيار صفحة التحليلات عند غياب بيانات `stats` من API.
- جعل Endpoint التحليلات يرجع عقد بيانات كاملًا يناسب لوحة الأدمن.
- إضافة Seed تأسيسي شامل للمحتوى الذي لا يجب إدخاله يدويًا.
- إبقاء تطبيقاتنا خارج الـ seed لأنها تحتاج روابط تحميل وإصدارات وملفات حقيقية.

## الملفات المعدلة

```text
backend/platform_api/views.py
backend/scripts/seed_professional_services.py
backend/scripts/seed_platform_foundation.py
admin_panel/src/app/[locale]/admin/(protected)/media/page.tsx
admin_panel/src/shared/admin/components/AdminAnalyticsPage.tsx
admin_panel/scripts/release-check.mjs
docs/PHASE_15_8_ADMIN_BACKEND_CLOSURE.md
plan.md
```

## ما تم إصلاحه في لوحة التحكم

### 1. مكتبة الوسائط
كان رابط الوسائط في القائمة يفتح 404 لأن المكوّن موجود لكن صفحة route غير موجودة.
تمت إضافة صفحة:

```text
admin_panel/src/app/[locale]/admin/(protected)/media/page.tsx
```

وتربطها مباشرة بمكوّن:

```text
AdminMediaLibraryPage
```

مع استخدام ترجمات مركزية من:

```text
adminMediaLibrary
```

### 2. التحليلات
كانت صفحة التحليلات تنهار عند قراءة:

```text
data.stats.total_events
```

إذا رجع الباكند بيانات ناقصة. تمت إضافة:

```text
EMPTY_ANALYTICS_SUMMARY
normalizeAnalyticsSummary
```

حتى لا تنهار الصفحة عند غياب بيانات أو عند بداية المشروع بدون زيارات.

## ما تم إصلاحه في الباكند

### 1. Admin Analytics Summary
صار endpoint:

```text
/api/v1/admin/analytics/summary
```

يرجع عقدًا كاملًا يحتوي:

```text
stats
top_pages
locales
event_types
entity_types
daily
recent_events
```

مع دعم فلاتر:

```text
days
search
locale
event_type
```

### 2. Seed تأسيسي شامل
تمت إضافة:

```text
backend/scripts/seed_platform_foundation.py
```

هذا السكربت يجهز:

- إعدادات وهوية الموقع.
- أدوار أساسية.
- 21 خدمة احترافية.
- قائمة أنظمة/حلول برمجية احترافية.
- أسئلة شائعة عامة.
- صفحات ثابتة.
- تصنيفات ومقالات تأسيسية.
- قوالب بريد.
- آراء عملاء مخفية قابلة للتعديل لاحقًا.

## لماذا لا يتم Seed للتطبيقات؟

تطبيقاتنا تحتاج بيانات حقيقية مثل:

- رابط تحميل مباشر.
- ملف EXE/APK/ZIP.
- رقم إصدار.
- صور شاشة.
- متطلبات تشغيل.
- سجل تحديثات.

لذلك تبقى تطبيقاتنا مدخلة يدويًا من لوحة التحكم.

## التشغيل

من داخل backend:

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
python scripts\seed_platform_foundation.py
```

ثم تشغيل الباكند:

```powershell
python manage.py runserver 127.0.0.1:8000
```

ثم تشغيل الأدمن:

```powershell
cd D:\platform\admin_panel
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run release-check
npm run dev
```

## الفحص

افتح:

```text
http://127.0.0.1:3001/ar/admin/media
http://127.0.0.1:3001/ar/admin/analytics
http://127.0.0.1:3001/ar/admin/services
http://127.0.0.1:3001/ar/admin/products
```

ثم افتح الموقع العام:

```text
http://127.0.0.1:3000/ar/services
http://127.0.0.1:3000/ar/products
```

## نتيجة الفحص المنفذ داخل بيئة العمل

```text
Backend compileall: PASS
Admin release-check: PASS
```
