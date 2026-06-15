# Phase 7 — Final QA, Schema Compatibility & Admin Polish

## الهدف

تثبيت النسخة بعد تنظيف الموقع العام عبر معالجة مشاكل قد تظهر أثناء الاختبار المحلي أو عند العمل على قاعدة بيانات موجودة من المراحل السابقة.

## ما تم تنفيذه

### 1. Migration توافق آمن لقاعدة البيانات

تمت إضافة migration جديد:

```text
backend/alembic/versions/202605250001_schema_compatibility_updates.py
```

هذا الترحيل يضيف الأعمدة الجديدة فقط إذا كانت ناقصة، لذلك هو آمن على:

- قاعدة جديدة تم إنشاؤها من الصفر.
- قاعدة موجودة من مرحلة أقدم.

الأعمدة التي يتم التحقق منها وإضافتها عند الحاجة:

```text
site_settings.is_english_enabled
site_settings.favicon_url
site_settings.social_links
site_settings.maintenance_mode
site_settings.maintenance_message_ar
site_settings.maintenance_message_en
site_settings.visible_sections
users.failed_login_count
users.locked_until
products.show_demo_request
```

### 2. سكربت تشخيص توافق القاعدة

تمت إضافة:

```text
backend/scripts/diagnose_schema_compatibility.py
```

الاستخدام:

```powershell
python scripts\diagnose_schema_compatibility.py
```

إذا ظهرت أعمدة ناقصة، شغّل:

```powershell
alembic upgrade head
```

### 3. تنظيف بقايا النصوص التجريبية من لوحة الإدارة

تم تنظيف النصوص الظاهرة للمستخدم من:

```text
CompanyName
Foundation Stage
Stage 7
واجهة تأسيسية
الصفحة مؤقتة
```

وتحويلها إلى نصوص تشغيلية احترافية للوحة الإدارة.

### 4. تحديث Metadata و Manifest و OpenGraph للوحة الإدارة

تم تحديث:

```text
admin_panel/src/app/layout.tsx
admin_panel/src/app/manifest.ts
admin_panel/src/app/opengraph-image.tsx
```

بدل الاعتماد على `CompanyName` القديم.

### 5. فحوصات منفذة

```text
Backend compileall: OK
Alembic migration compile: OK
Scripts compile: OK
Admin/Public JSON parse: OK
Visible placeholder grep: OK
```

## بعد فك النسخة

نفّذ من مجلد الباكند:

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\diagnose_schema_compatibility.py
uvicorn app.main:app --reload
```

ثم شغّل الموقع ولوحة الإدارة كالمعتاد.

## ملاحظة

هذه المرحلة لا تضيف ميزات جديدة. الهدف منها تثبيت القاعدة الحالية وتنظيف بقايا المرحلة التجريبية قبل الدخول بمرحلة QA بصري نهائي أو رفع الصور/الميديا.
