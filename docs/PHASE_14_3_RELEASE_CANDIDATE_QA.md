# Phase 14.3 — Final Release Candidate QA

## الهدف
إغلاق الموقع العام كنسخة Release Candidate قابلة للفحص النهائي محليًا قبل النشر، بدون إضافة صفحات أو ميزات جديدة.

## ما تم في هذه المرحلة

- إصلاح import ناقص في `public_site/src/app/[locale]/(public)/layout.tsx` كان يمنع اكتمال فحص TypeScript عند استخدام `isEnglishEnabled` داخل metadata.
- إضافة فحص خفيف للموقع العام لا يحتاج `node_modules`:
  - `public_site/scripts/release-check.mjs`
- إضافة أمر جديد داخل `public_site/package.json`:
  - `npm run release-check`

## ماذا يفحص release-check؟

- وجود صفحات الموقع الأساسية.
- صلاحية ملفات الترجمة العربية والإنكليزية JSON.
- عدم وجود عبارات مرئية غير احترافية داخل ملفات i18n مثل:
  - `CompanyName`
  - `Coming Soon`
  - `Foundation Stage`
  - `Stage 7`
  - `فتح التطبيق`
  - `محتوى تجريبي`
- التأكد من أن إعدادات الإنتاج تعطل المحتوى التجريبي و seed التجريبي.
- التأكد من أن Metadata يحترم `NEXT_PUBLIC_ALLOW_INDEXING`.
- التأكد من وجود `x-default` داخل alternates.
- التأكد من أن sitemap يدعم ملفات التحميل عبر `download_files`.

## أوامر الفحص المقترحة قبل اعتماد النسخة

### Backend

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\diagnose_schema_compatibility.py
pytest -q
uvicorn app.main:app --reload
```

### Public Site

```powershell
cd D:\platform\public_site
npm install
npm run release-check
npm run type-check
npm run lint
npm run build
npm run dev
```

### Admin Panel

```powershell
cd D:\platform\admin_panel
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

## إعدادات الإنتاج التي يجب الانتباه لها

```env
NEXT_PUBLIC_SHOW_DEMO_CONTENT=false
NEXT_PUBLIC_ALLOW_INDEXING=true
AUTO_SEED_DEMO_CONTENT=false
```

لا يتم تفعيل `NEXT_PUBLIC_ALLOW_INDEXING=true` إلا على الدومين الرسمي النهائي.

## حالة المرحلة

هذه المرحلة لا تغلق المحتوى الحقيقي مثل اسم الشركة، اللوغو، الصور، والدومين؛ هذه تحتاج بيانات نهائية من صاحب المشروع. لكنها تغلق البنية والفحص الفني للموقع العام كنسخة Release Candidate.
