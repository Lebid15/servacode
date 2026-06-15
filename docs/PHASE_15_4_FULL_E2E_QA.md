# Phase 15.4 — Full End-to-End QA Closure

> الهدف: تثبيت المسار الكامل بين لوحة التحكم والباكند والموقع العام قبل الانتقال إلى مرحلة التنظيف والتسليم النهائي.

## نطاق المرحلة

هذه المرحلة لا تضيف ميزات تسويقية جديدة، بل تؤكد أن كل ميزة أساسية تعمل كسلسلة واحدة:

```text
Admin Panel -> Backend API -> Database -> Public Site API -> Public UI
```

تم التركيز على المسارات التي تحدد جاهزية المشروع قبل النشر لاحقًا:

- الخدمات.
- الأنظمة / المنتجات.
- التطبيقات وروابط التحميل.
- الأعمال / Portfolio.
- إعدادات الهوية العامة.
- نماذج الزوار: التواصل، طلب عرض سعر، الدعم.
- فحوص ثابتة للموقع العام ولوحة الأدمن.

---

## الملفات التي تمت إضافتها أو تعديلها

```text
backend/tests/test_phase_15_4_end_to_end_contract.py
admin_panel/scripts/release-check.mjs
admin_panel/package.json
scripts/full-e2e-check.ps1
docs/PHASE_15_4_FULL_E2E_QA.md
docs/END_TO_END_ACCEPTANCE_CHECKLIST.md
.gitignore
plan.md
```

---

## ما تم إنجازه

### 1. اختبارات Backend E2E Contract

تمت إضافة ملف:

```text
backend/tests/test_phase_15_4_end_to_end_contract.py
```

يغطي السيناريوهات التالية:

1. إنشاء خدمة من admin API، ثم التأكد أنها تظهر من public API.
2. تعطيل الخدمة من admin API، ثم التأكد أنها تختفي من public API وترجع `success=false` مع 404.
3. إنشاء نظام مع features/images/faqs، ثم التأكد أن public API يعيد هذه البيانات كاملة.
4. إنشاء تطبيق مع `download_url` و `download_files`، ثم التأكد أن public API يعيد روابط التحميل.
5. إخفاء تطبيق بحالة `hidden`، ثم التأكد أنه لا يظهر للزائر.
6. إنشاء عمل Portfolio مع `technologies` و `gallery_images`، ثم التأكد أنها تظهر للزائر.
7. تعديل إعدادات الموقع من admin API، ثم التأكد أنها تظهر في public settings.
8. إرسال نماذج الزائر: contact / quote / support.
9. التأكد أن هذه الطلبات تظهر في admin endpoints.
10. التأكد من إنشاء Audit Logs عند عمليات الإدارة الأساسية.

---

### 2. فحص Release Check للوحة الأدمن

تمت إضافة:

```text
admin_panel/scripts/release-check.mjs
```

ويفحص بدون الحاجة إلى `node_modules`:

- وجود الملفات الأساسية للوحة الأدمن.
- وجود scripts مهمة داخل `package.json`.
- أن `api-client.ts` يتعامل مع `FormData` بشكل صحيح.
- أن روابط المعاينة تبنى عبر `buildPublicSiteUrl`.
- أن payload يمر عبر `preparePayloadBeforeSave` قبل create/update.
- أن الحقول الإنجليزية لها fallback من العربية قبل الحفظ.
- أن الترجمة التلقائية مركزية ويمكن تعطيلها.
- أن صفحات الخدمات/الأنظمة/التطبيقات/الأعمال تستخدم روابط معاينة عامة صحيحة.
- عدم وجود raw `fetch()` خارج طبقة API المركزية.
- عدم وجود `dangerouslySetInnerHTML` إلا في bootstrap اللغة المراقب داخل root layout.

تمت إضافة script داخل `admin_panel/package.json`:

```json
"release-check": "node scripts/release-check.mjs"
```

---

### 3. سكربت فحص شامل للمشروع

تمت إضافة:

```text
scripts/full-e2e-check.ps1
```

يشغل فحوصًا مركزية:

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1
```

ويدعم اختصار الفحص بدون build ثقيل:

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1 -SkipBuild
```

أو بدون pytest مؤقتًا إذا لم تكن بيئة Python مجهزة:

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1 -SkipBuild -SkipPytest
```

السكربت ينتج تقريرًا:

```text
phase-15-4-e2e-report.txt
```

---

## الفحوص التي تم تشغيلها داخل بيئة العمل

تم تشغيل الفحوص الخفيفة التالية بنجاح:

```bash
python -m compileall backend/config backend/platform_api backend/scripts backend/tests
```

```bash
cd public_site
node scripts/release-check.mjs
```

```bash
cd admin_panel
node scripts/release-check.mjs
```

النتيجة:

```text
Backend Python compile: PASS
Public Site release-check: PASS
Admin Panel release-check: PASS
```

لم يتم تشغيل `pytest` و frontend build الكامل داخل هذه البيئة بسبب عدم وجود dependencies كاملة، ويجب تشغيلها على جهاز التطوير بعد نسخ المرحلة.

---

## أوامر التحقق المطلوبة على جهاز التطوير

### Backend

```powershell
cd D:\platform\backend
python -m compileall config platform_api scripts tests
python scripts\quality_check.py
pytest
```

### Public Site

```powershell
cd D:\platform\public_site
npm install
npm run release-check
npm run quality
npm run build
```

### Admin Panel

```powershell
cd D:\platform\admin_panel
pnpm install --frozen-lockfile
pnpm run release-check
pnpm run quality
pnpm run build
```

### Full QA Script

```powershell
cd D:\platform
.\scripts\full-e2e-check.ps1
```

---

## معيار قبول Phase 15.4

تعتبر المرحلة مقبولة عندما يتحقق التالي:

- `pytest` ينجح، خصوصًا ملف `test_phase_15_4_end_to_end_contract.py`.
- `public_site` ينجح في `release-check`, `quality`, `build`.
- `admin_panel` ينجح في `release-check`, `quality`, `build`.
- يمكن إدخال بيانات من لوحة الأدمن ورؤيتها في الموقع العام.
- يمكن إرسال نماذج من الموقع العام ورؤيتها في لوحة الأدمن.
- لا توجد روابط معاينة داخلية خاطئة من الأدمن.
- لا توجد أزرار وهمية في المسارات الأساسية.

---

## المرحلة التالية

```text
Phase 15.5 — Cleanup + Documentation + Final Delivery
```

الهدف القادم:

- تنظيف المشروع من الكاش والملفات غير الضرورية.
- تحديث أوامر النسخة الخفيفة.
- إعداد تقرير تسليم نهائي.
- إعداد checklist نهائي قبل النشر لاحقًا.
- تجهيز نسخة RC خفيفة.
