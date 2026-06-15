# Phase 8 — Apps Module + Company Identity Completion

## الهدف
تحويل الموقع إلى واجهة شركة برمجيات قابلة للإدارة من لوحة التحكم، مع إضافة قسم "تطبيقاتنا" للتطبيقات والأدوات الخدمية العامة، وتوسيع هوية الشركة ومعلومات التواصل.

## ما تم تنفيذه

### Backend
- إضافة موديل `SoftwareApp` للتطبيقات العامة.
- إضافة enums مركزية:
  - `AppType`
  - `AppPlatform`
  - `AppStatus`
  - `AppPricingType`
- إضافة صلاحية `manage_apps`.
- إضافة API أدمن كامل:
  - `GET /api/v1/admin/apps`
  - `POST /api/v1/admin/apps`
  - `GET /api/v1/admin/apps/{id}`
  - `PATCH /api/v1/admin/apps/{id}`
  - `DELETE /api/v1/admin/apps/{id}`
- إضافة API عام:
  - `GET /api/v1/public/apps`
  - `GET /api/v1/public/apps/{slug}`
- إضافة التطبيقات إلى Dashboard summary.
- توسيع إعدادات الموقع:
  - الاسم القانوني عربي/إنكليزي
  - وصف الشركة عربي/إنكليزي
  - رابط الخريطة
  - ساعات العمل عربي/إنكليزي
  - بريد الدعم
  - هاتف الدعم
- إضافة migration جديد:
  - `202605250002_apps_and_company_identity.py`
- تحديث سكربت فحص توافق قاعدة البيانات.

### Public Site
- إضافة صفحة عامة:
  - `/ar/apps`
  - `/en/apps`
- إضافة صفحة تفاصيل تطبيق:
  - `/ar/apps/[slug]`
  - `/en/apps/[slug]`
- إضافة رابط تطبيقاتنا في الـ Navbar عند وجود تطبيقات منشورة وتفعيل القسم.
- إضافة تطبيقاتنا إلى الصفحة الرئيسية عند وجود محتوى.
- إضافة تطبيقاتنا إلى sitemap.
- تحديث صفحة التواصل لعرض:
  - الدعم
  - ساعات العمل
  - رابط الخريطة
- تحديث i18n العربي والإنكليزي.
- إضافة أيقونات مركزية للتطبيقات والتحميل والدعم.

### Admin Panel
- إضافة صفحة:
  - `/admin/apps`
- إضافة رابط التطبيقات في Sidebar.
- إضافة إعدادات إدارة التطبيقات ضمن `AdminModulePage` المركزي.
- توسيع صفحة Settings لإدارة:
  - الاسم القانوني
  - وصف الشركة
  - الخريطة
  - ساعات العمل
  - بريد وهاتف الدعم
  - إظهار/إخفاء قسم تطبيقاتنا
- تحديث i18n العربي والإنكليزي.

## بعد فك النسخة

شغّل migrations:

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\diagnose_schema_compatibility.py
uvicorn app.main:app --reload
```

ثم شغّل الواجهات:

```powershell
cd D:\platform\public_site
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

```powershell
cd D:\platform\admin_panel
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

## اختبار سريع

1. افتح لوحة الأدمن.
2. ادخل إلى Settings وأضف معلومات الشركة والعنوان والخريطة والدعم.
3. ادخل إلى Apps وأضف تطبيقًا جديدًا.
4. افتح الموقع العام:
   - `/ar/apps`
   - `/ar/apps/<slug>`
5. تأكد أن رابط تطبيقاتنا يظهر في النافبار بعد وجود تطبيق منشور.
6. افتح صفحة Contact وتأكد أن بيانات الدعم وساعات العمل والخريطة تظهر.

## ملاحظات لاحقة
- حقول `features`, `screenshots`, `requirements`, `changelog` موجودة في الباكند والـ API، لكن واجهة تحريرها المتقدمة يمكن تحسينها لاحقًا بمحرر Repeatable Fields بدل النصوص البسيطة.
- Media Upload الحقيقي ما زال مرحلة منفصلة حتى لا نخلط رفع الملفات مع إدارة بيانات التطبيقات.
