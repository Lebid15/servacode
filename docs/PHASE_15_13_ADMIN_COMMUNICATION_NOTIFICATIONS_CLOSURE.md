# Phase 15.13 — Admin Communication & Notifications Closure

## الهدف
إغلاق قسم الإشعارات والتواصل داخل لوحة التحكم بحيث لا يكون مجرد تبويبات منفصلة، بل مركز تشغيل واضح يربط:

- الإشعارات.
- قوالب البريد.
- طلبات المشاريع.
- رسائل التواصل.
- طلبات الدعم.

## المنجز

### Backend

- إضافة نوع إشعار جديد: `support_request`.
- إضافة Endpoint جديد:
  - `GET /api/v1/admin/communication-overview`
- توليد ملخص لقنوات التواصل يشمل:
  - إجمالي الإشعارات.
  - غير المقروءة.
  - إشعارات اليوم.
  - إشعارات آخر 7 أيام.
  - قوالب البريد المفعلة وغير المفعلة.
  - طلبات المشاريع المفتوحة.
  - رسائل التواصل المفتوحة.
  - طلبات الدعم المفتوحة.
- دعم فلتر `read_status` في قائمة الإشعارات.
- إنشاء إشعارات تلقائية عند وصول:
  - طلب مشروع من الموقع العام.
  - رسالة تواصل من الموقع العام.
  - طلب دعم من الموقع العام.

### Admin Panel

- تحويل `/admin/communication` من Redirect إلى مركز نظرة عامة فعلي.
- إضافة تبويب `نظرة عامة` لقسم الإشعارات والتواصل.
- إضافة صفحة:
  - `AdminCommunicationOverviewPage`
- دعم نوع إشعار `support_request` في صفحة الإشعارات.
- إضافة زر تجهيز قوالب البريد الافتراضية داخل صفحة قوالب البريد.
- تحديث release-check للتأكد من وجود مركز التواصل.

## الفحص

- Backend compileall: PASS
- Admin release-check: PASS

## ملاحظات تشغيلية

بعد النسخ شغّل:

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
```

ثم:

```powershell
cd D:\platform\admin_panel
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run release-check
npm run dev
```

وافتح:

```text
http://127.0.0.1:3001/ar/admin/communication
```
