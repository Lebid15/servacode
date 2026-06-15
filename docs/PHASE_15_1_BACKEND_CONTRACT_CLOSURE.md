# Phase 15.1 — Backend Contract Closure

## الهدف
إغلاق أساس الباكند قبل الانتقال إلى لوحة الأدمن والموقع العام. هذه المرحلة لا تخص النشر، بل تثبيت عقد البيانات الذي تعتمد عليه الواجهات.

## ما تم إنجازه

### 1. توحيد استجابات الأخطاء
- إضافة `error_payload` و `error_response` داخل `backend/platform_api/responses.py`.
- تعديل أخطاء تسجيل الدخول وتجديد الجلسة وتفاصيل الصفحات العامة حتى ترجع:
  - `success: false`
  - `data: null`
  - `error.code`
  - `error.status_code`

### 2. إصلاح إنشاء المستخدمين من لوحة الأدمن
- إضافة حقل `password` إلى `UserSerializer`.
- تحويل كلمة المرور إلى `hashed_password` عبر `hash_password` قبل الحفظ.
- منع إظهار `hashed_password` في ردود API.
- إضافة كائن `role` للقراءة حتى تعرض لوحة الأدمن اسم الدور بدون معالجة إضافية.

### 3. جعل البيانات المتداخلة قابلة للحفظ
- `ServiceSerializer` أصبح يحفظ `features` المرسلة من لوحة الأدمن.
- `ProductSerializer` أصبح يحفظ:
  - `features`
  - `images`
  - `faqs`
- عند تحديث الخدمة أو النظام، إذا أرسلت الواجهة هذه القوائم يتم استبدالها بشكل واضح ومباشر.

### 4. تخفيف الاعتماد القسري على الإنجليزية
- عند غياب النص الإنجليزي، يتم استخدام النص العربي كقيمة احتياطية حتى لا يفشل الحفظ إذا تعطلت الترجمة التلقائية.
- تم تطبيق ذلك على الخدمات، الأنظمة، التطبيقات، الأعمال، المدونة، الأسئلة، الصفحات الثابتة، وآراء العملاء.

### 5. تفعيل البحث والفلاتر في ViewSets
- إضافة `search_fields` للصفحات الإدارية الرئيسية.
- دعم فلاتر مثل:
  - `status`
  - `role_id`
  - `is_active`
  - `product_type`
  - `app_type`
  - `platform`
  - `priority`
  - `scope`
  - `media_type`
- دعم ترتيب آمن عبر `ordering` أو `order_by` بدون السماح بتمرير حقول غير موجودة.

### 6. تحسين Dashboard API
- توسيع `/api/v1/admin/dashboard` ليعيد بيانات أقرب لما تتوقعه لوحة الأدمن:
  - counters عامة
  - stats
  - site_status
  - content_status
  - readiness_alerts
  - latest_quote_requests
  - latest_contact_messages
  - latest_support_requests
  - latest_activity
  - system_status

### 7. Audit Logs أولية
- تسجيل عمليات create/update/delete/restore العامة.
- تسجيل تغيير إعدادات الموقع.
- لا يتم تعطيل العملية الأساسية إذا فشل إنشاء سجل التدقيق.

### 8. CI
- إصلاح أمر compile في GitHub Actions من:
  `python -m compileall app tests`
  إلى:
  `python -m compileall config platform_api scripts tests`
- استخدام `npm ci` للموقع العام بدل `npm install` في CI.

### 9. اختبارات جديدة
تمت إضافة ملف:
`backend/tests/test_admin_backend_closure.py`

يغطي:
- إنشاء مستخدم من لوحة الأدمن مع كلمة مرور خام وتحويلها إلى hash.
- حفظ مميزات الخدمة من payload الأدمن.
- حفظ مميزات/صور/أسئلة النظام من payload الأدمن.

## الفحص المنفذ داخل بيئة العمل
تم تنفيذ:

```bash
cd backend
python -m compileall config platform_api scripts tests
```

والنتيجة: نجح فحص الترجمة البرمجية بدون أخطاء Syntax.

> ملاحظة: لم يتم تشغيل pytest داخل هذه البيئة لأن حزم Django/DRF غير مثبتة هنا. يجب تشغيل الاختبارات محليًا داخل بيئة المشروع عندك بعد تثبيت المتطلبات.

## المطلوب في المرحلة التالية
المرحلة القادمة هي: **Phase 15.2 — Admin Panel Closure**

وتشمل:
- اختبار لوحة الأدمن ضد الباكند المعدل.
- إصلاح أي form ما زال يرسل حقولًا غير مطابقة.
- تحسين رسائل الخطأ والنجاح.
- مراجعة صفحات الخدمات/الأنظمة/التطبيقات/الأعمال/المستخدمين.
- تثبيت تجربة إدارة المحتوى بالكامل.
