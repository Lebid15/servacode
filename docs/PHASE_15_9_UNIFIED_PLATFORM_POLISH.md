# Phase 15.9 — Unified Platform Polish

## الهدف
رفع المشروع من مجرد موقع + لوحة إدارة إلى منصة متماسكة بروح واحدة، بحيث يكون المحتوى التأسيسي، الصفحة الرئيسية، لوحة التحكم، والباكند مترابطين وقابلين للفحص قبل النشر لاحقًا.

## ما تم إنجازه

### 1. ربط الصفحة الرئيسية بمحتوى الباكند
- أصبحت عناوين Hero وأزرار CTA وقائمة التقنيات قابلة للإدارة من `SiteSettings.extra_settings.home`.
- بقيت عناوين SEO منفصلة عن عنوان Hero حتى لا يظهر عنوان SEO الطويل داخل الواجهة الرئيسية.
- تم توسيع نوع `PublicSettings` ليشمل `extra_settings`.

### 2. تحسين Seed المحتوى التأسيسي
- تم توسيع `visible_sections` لتشمل أقسام الصفحة الرئيسية بالكامل: build, composition, architecture, why, process, technologies, cta.
- تم إضافة `foundation_version` وبيانات positioning ومبادئ العمل وقوائم المشروع داخل `extra_settings`.
- بقيت التطبيقات والأعمال الحقيقية خارج الـ seed لأنها تحتاج روابط تحميل وأمثلة حقيقية.

### 3. تحسين لوحة التحكم وتنبيهات الجاهزية
- تم توسيع تنبيهات الجاهزية في Dashboard لتشمل:
  - الشعار والأيقونة.
  - قنوات التواصل.
  - وضع الصيانة.
  - الخدمات والأنظمة والأسئلة الشائعة والصفحات الثابتة وقوالب البريد.
  - تنبيهات معلوماتية للتطبيقات والأعمال لأنها تُضاف يدويًا.
- تم تحديث ترجمة التنبيهات العربية والإنجليزية في صفحة الداشبورد.

### 4. أوامر تشغيل احترافية للباكند
تم إضافة أوامر Django مباشرة:

```bash
python manage.py seed_platform_foundation
python manage.py site_readiness_report
```

بالإضافة إلى السكربتات المباشرة:

```bash
python scripts/seed_platform_foundation.py
python scripts/site_readiness_report.py
```

### 5. تقرير جاهزية محلي
تم إضافة `backend/scripts/site_readiness_report.py` لإعطاء تقييم تقريبي للمشروع حسب:
- الإعدادات.
- الخدمات.
- الأنظمة.
- الأسئلة الشائعة.
- الصفحات الثابتة.
- المقالات.
- قوالب البريد.
- الأدوار والمستخدمين.

### 6. تقوية فحوص Release Check
- فحص الموقع العام يتأكد أن الصفحة الرئيسية تستخدم `extra_settings` من الباكند.
- فحص لوحة الأدمن يتأكد من وجود ترجمة تنبيهات الجاهزية الجديدة.

## الفحوص المنفذة

```bash
cd backend
python -m compileall config platform_api scripts tests
```

```bash
cd public_site
node scripts/release-check.mjs
```

```bash
cd admin_panel
node scripts/release-check.mjs
```

النتيجة: PASS.

## طريقة الاستخدام بعد النسخ

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
python manage.py seed_platform_foundation
python manage.py site_readiness_report
python manage.py runserver 127.0.0.1:8000
```

ثم:

```powershell
cd D:\platform\admin_panel
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run release-check
npm run dev
```

ثم:

```powershell
cd D:\platform\public_site
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run release-check
npm run dev:3000
```

## القرار الهندسي
المشروع الآن أقرب إلى منصة متكاملة: الباكند يجهز الأساس، لوحة التحكم تعرض التنبيهات الواقعية، والموقع العام يأخذ هوية ومحتوى الصفحة الرئيسية من الإعدادات بدل الاعتماد الكامل على النصوص المضمنة داخل الكود.
