# Phase 15.2 — Admin Panel Closure

## الهدف

إغلاق لوحة الأدمن وظيفيًا قبل الانتقال للموقع العام، بحيث تصبح صفحات الإدارة الأساسية متوافقة مع عقد الباكند الجديد، ولا تعتمد على حقول وهمية أو روابط معاينة مكسورة أو ترجمة إجبارية قد تمنع الحفظ.

## ما تم تنفيذه

### 1. حماية مركزية لحقول الترجمة

تم تعديل `admin_panel/src/shared/api/admin-client.ts` بحيث يتم تطبيق fallback مركزي قبل الحفظ:

- أي حقل ينتهي بـ `_en` وكان فارغًا يأخذ قيمة الحقل العربي المقابل `_ar` إن وجد.
- تعمل الحماية داخل الكائنات والقوائم المتداخلة مثل features/images/faqs/download_files/changelog.
- إذا فشلت الترجمة التلقائية، لا يفشل الحفظ، بل يتم إرسال القيم العربية كبديل آمن.

النتيجة: يمكن للمدير تعبئة المحتوى بالعربية فقط، والباكند يستقبل Payload صالحًا حتى لو كانت الترجمة معطلة أو فشلت.

### 2. توحيد روابط المعاينة العامة

تمت إضافة:

```ts
buildPublicSiteUrl(locale, ...segments)
```

داخل `admin_panel/src/shared/api/api-client.ts`.

والآن صفحات الأدمن لا تفتح روابط نسبية داخل بورت لوحة التحكم، بل تستخدم رابط الموقع العام من:

```env
NEXT_PUBLIC_PUBLIC_SITE_URL
```

مع fallback محلي:

```text
http://127.0.0.1:3000
```

تم تطبيق ذلك على:

- الخدمات
- الأنظمة/المنتجات
- التطبيقات
- الأعمال

### 3. إصلاح صفحة الخدمات

تم إصلاح خطأ duplicate key داخل `emptyForm` في:

```text
AdminServicesPage.tsx
```

كما تم ربط تحديث الخدمات بتحديث Dashboard cache.

### 4. تحسين Payload الأنظمة/المنتجات

تم تحسين `AdminProductsPage.tsx` بحيث:

- الاسم الإنجليزي يأخذ العربي كبديل عند الفراغ.
- الوصف الإنجليزي يأخذ العربي كبديل عند الفراغ.
- الوصف التفصيلي، الجمهور المستهدف، المتطلبات، وحقول SEO الإنجليزية تأخذ العربي كبديل عند الفراغ.
- رابط المعاينة يستخدم `buildPublicSiteUrl`.
- تحديث المنتجات يحدث Dashboard cache.
- فتح الرابط العام يستخدم `noopener,noreferrer`.

### 5. تحسين Payload التطبيقات

تم تحسين `AdminAppsPage.tsx` بحيث:

- الاسم والوصف الإنجليزي يأخذان العربي كبديل عند الفراغ.
- الوصف التفصيلي وحقول SEO الإنجليزية تأخذ العربي كبديل.
- ملفات التحميل تستخدم `label_ar` كبديل لـ `label_en`.
- مميزات التطبيق تستخدم العربي كبديل للإنجليزي.
- صور الشاشة تستخدم `alt_ar` كبديل لـ `alt_en`.
- سجل التغييرات يستخدم العربي كبديل للإنجليزي.
- رابط المعاينة يستخدم `buildPublicSiteUrl`.
- تحديث التطبيقات يحدث Dashboard cache.

### 6. تحسين Payload الأعمال

تم تحسين `AdminPortfolioPage.tsx` بحيث:

- العنوان والوصف الإنجليزي يأخذان العربي كبديل.
- المشكلة والنتيجة والتصنيف وحقول SEO الإنجليزية تأخذ العربي كبديل.
- رابط المعاينة يستخدم `buildPublicSiteUrl`.

### 7. تحديث Dashboard cache في صفحات CRUD العامة

تم ربط صفحة `AdminModulePage.tsx` بتحديث Dashboard cache بعد الإضافة/التعديل/الحذف، حتى لا تبقى أرقام لوحة التحكم قديمة بعد إدارة الصفحات البسيطة مثل المدونة، الأسئلة، الشهادات، والصفحات الثابتة.

### 8. تحسين صفحة المستخدمين

تم تحسين `AdminUsersPage.tsx` بحيث:

- لا يتم إرسال بيانات مستخدم جديدة قبل التحقق من الاسم واسم المستخدم والدور وكلمة المرور.
- كلمة المرور يجب أن تكون 8 أحرف على الأقل عند الإنشاء أو عند تغييرها.
- يتم trim للقيم قبل الإرسال.
- يتم إرسال status عند إنشاء المستخدم.
- تحديث المستخدمين يحدث Dashboard cache.

## الملفات المعدلة

```text
admin_panel/src/shared/api/admin-client.ts
admin_panel/src/shared/api/api-client.ts
admin_panel/src/shared/admin/components/AdminServicesPage.tsx
admin_panel/src/shared/admin/components/AdminProductsPage.tsx
admin_panel/src/shared/admin/components/AdminAppsPage.tsx
admin_panel/src/shared/admin/components/AdminPortfolioPage.tsx
admin_panel/src/shared/admin/components/AdminUsersPage.tsx
admin_panel/src/shared/admin/components/AdminModulePage.tsx
docs/PHASE_15_2_ADMIN_PANEL_CLOSURE.md
plan.md
```

## فحص سريع تم تنفيذه

تم تنفيذ فحص static grep للتأكد من:

- إزالة `PUBLIC_SITE_URL` المحلي من الصفحات الأساسية.
- استخدام `buildPublicSiteUrl` بدل الروابط النسبية.
- إزالة duplicate `features` من صفحة الخدمات.

لم يتم تشغيل `pnpm run quality` داخل هذه البيئة لأن `pnpm/node_modules` غير متاحين هنا. يجب تشغيله على جهاز التطوير بعد نسخ المرحلة.

## المطلوب اختباره محليًا

```powershell
cd D:\platform\admin_panel
pnpm install --frozen-lockfile
pnpm run quality
pnpm run build
```

ثم اختبار السيناريوهات التالية:

- إضافة خدمة بالعربية فقط، ثم التأكد من حفظها وظهورها في القائمة.
- إضافة نظام مع مميزات وصور وأسئلة، ثم فتح المعاينة العامة.
- إضافة تطبيق مع رابط تحميل وملفات تحميل، ثم فتح المعاينة العامة.
- إضافة عمل مع تقنيات ومعرض صور، ثم فتح المعاينة العامة.
- إنشاء مستخدم جديد بكلمة مرور صحيحة.
- تجربة كلمة مرور أقل من 8 أحرف والتأكد من رفضها في الواجهة.

## نتيجة المرحلة

لوحة الأدمن أصبحت أكثر أمانًا وتوافقًا مع الباكند الجديد، خصوصًا في الحفظ العربي/الإنجليزي، روابط المعاينة، وتحديث Dashboard cache.

المرحلة التالية المقترحة:

```text
Phase 15.3 — Public Site Closure
```

وهدفها التأكد أن الموقع العام يقرأ نفس البيانات التي أصبحت لوحة الأدمن تحفظها الآن.
