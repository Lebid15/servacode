# Phase 12 — Apps Advanced Management + Downloads Versions

## الهدف
تطوير قسم **تطبيقاتنا** ليصبح مناسبًا لتنزيل التطبيقات الخدمية العامة وإدارتها من لوحة التحكم بدون كتابة JSON يدوي أو روابط مبعثرة.

## ما تم

- إضافة حقل `download_files` في موديل التطبيقات لتخزين أكثر من ملف تحميل حسب النظام أو المنصة.
- إضافة Migration آمن: `202605250004_app_download_files.py`.
- تحديث Schemas العامة والإدارية لدعم ملفات التحميل المتعددة.
- تحديث سكربت تشخيص توافق قاعدة البيانات ليتأكد من وجود `download_files`.
- تطوير صفحة إدارة التطبيقات في لوحة التحكم لتدعم:
  - مميزات التطبيق كقائمة متكررة.
  - صور التطبيق كقائمة متكررة مع Media Picker.
  - متطلبات التشغيل كقائمة مفتاح/قيمة.
  - سجل التحديثات كقائمة متكررة.
  - ملفات التحميل المتعددة حسب النظام مع Media Picker.
  - حقول SEO لكل تطبيق.
- تحسين صفحة تفاصيل التطبيق العامة لعرض:
  - معرض صور التطبيق.
  - ملفات التحميل المتعددة.
  - متطلبات التشغيل.
  - سجل التحديثات.
  - المميزات بشكل منظم.
- تحسين صفحة التحميلات العامة لعرض جميع ملفات التحميل المتاحة بدل رابط واحد فقط.
- إضافة أدوات frontend مشتركة لمعالجة بيانات التطبيقات: `app-utils.ts`.

## أوامر التشغيل بعد التحديث

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\diagnose_schema_compatibility.py
uvicorn app.main:app --reload
```

```powershell
cd D:\platform\admin_panel
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

```powershell
cd D:\platform\public_site
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

## اختبار سريع

1. افتح `/admin/apps`.
2. أضف تطبيقًا جديدًا.
3. أضف مميزات، صور، متطلبات، سجل تحديثات، وملفات تحميل.
4. افتح `/ar/apps` ثم صفحة تفاصيل التطبيق.
5. افتح `/ar/downloads` وتأكد من ظهور ملفات التحميل.

## ملاحظات

- ما زال حقل `download_url` القديم مدعومًا كـ fallback حتى لا تنكسر التطبيقات السابقة.
- الحقول المتقدمة مبنية داخل `AdminModulePage` لتصبح قابلة لإعادة الاستخدام لاحقًا في المنتجات أو البورتفوليو.
