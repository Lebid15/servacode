# Phase 15.5 — Cleanup + Documentation + Final Delivery

## الهدف

هذه المرحلة مخصصة لإغلاق المشروع كنسخة Release Candidate محلية جاهزة للفحص النهائي قبل أي نشر لاحقًا.
الهدف ليس نشر الموقع الآن، بل تجهيز نسخة نظيفة، موثقة، قابلة للتشغيل، وقابلة للفحص من الباكند إلى الموقع العام ولوحة التحكم.

## ما تم إنجازه

- تنظيف النسخة من الملفات الناتجة محليًا مثل تقارير الجاهزية المؤقتة.
- إضافة سكربت تنظيف محلي:
  - `scripts/clean-local-artifacts.ps1`
- إضافة سكربت إنشاء نسخة خفيفة للرفع:
  - `scripts/create-clean-upload.ps1`
- إضافة دليل تشغيل وفحص محلي:
  - `docs/LOCAL_DEVELOPMENT_RUNBOOK.md`
- إضافة تقرير تسليم نهائي:
  - `docs/FINAL_DELIVERY_REPORT.md`
- إضافة Checklist قبول نهائي:
  - `docs/FINAL_ACCEPTANCE_CHECKLIST.md`
- تحديث `README.md` ليعكس مرحلة الإغلاق الحالية.
- تحديث `plan.md` بحالة Phase 15.5.
- التأكد أن النسخة لا تحتوي على ملفات حساسة أو ضخمة معروفة مثل:
  - `.env`
  - `.env.local`
  - `node_modules`
  - `.next`
  - `db.sqlite3`
  - `uploads`
  - `*.pyc`
  - `*.tsbuildinfo`

## حالة المشروع بعد هذه المرحلة

المشروع أصبح منظّمًا كنسخة تسليم محلية قبل النشر:

```text
backend       → Django REST API
public_site   → Next.js public website
admin_panel   → Next.js admin dashboard
docs          → documentation and acceptance reports
scripts       → local QA and packaging tools
```

## ما يجب تشغيله على جهاز التطوير

من جذر المشروع:

```powershell
cd D:\platform
.\scripts\clean-local-artifacts.ps1
.\scripts\full-e2e-check.ps1
```

أو للفحص السريع بدون build ثقيل:

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1 -SkipBuild
```

## شرط اعتماد المرحلة

لا تعتمد هذه المرحلة كمنتهية إلا بعد تنفيذ:

```powershell
cd D:\platform\backend
pytest

cd D:\platform\public_site
npm run quality
npm run build

cd D:\platform\admin_panel
pnpm run quality
pnpm run build
```

إذا نجحت هذه الأوامر، يمكن اعتبار المشروع جاهزًا للانتقال لاحقًا إلى مرحلة خطة النشر.
