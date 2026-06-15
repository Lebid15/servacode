# Phase 9 — Support & Downloads Readiness

## الهدف
تجهيز الموقع ليخدم التطبيقات العامة بعد نشرها، عبر إضافة صفحة تحميلات واضحة وصفحة دعم متصلة بلوحة التحكم.

## ما تم

- إضافة صفحة عامة `/support` للدعم.
- إضافة نموذج طلب دعم عام متصل بالباكند.
- إضافة جدول `support_requests` في قاعدة البيانات.
- إضافة API عام: `POST /api/v1/public/support-requests`.
- إضافة API أدمن: `/api/v1/admin/support-requests`.
- إضافة صفحة لوحة تحكم: `/admin/support-requests`.
- إضافة صفحة عامة `/downloads` تجمع التطبيقات التي تملك رابط تحميل.
- إضافة روابط الدعم والتحميلات إلى الفوتر.
- إضافة الدعم إلى sitemap.
- إضافة صلاحية `manage_support_requests`.
- إضافة عداد طلبات الدعم إلى ملخص لوحة التحكم.
- تحديث النصوص العربية والإنكليزية.

## ملفات رئيسية

- `backend/app/models/support_request.py`
- `backend/app/api/v1/endpoints/admin_support_requests.py`
- `backend/alembic/versions/202605250003_support_requests_and_download_pages.py`
- `public_site/src/app/[locale]/(public)/support/page.tsx`
- `public_site/src/app/[locale]/(public)/downloads/page.tsx`
- `public_site/src/shared/public/components/SupportRequestForm.tsx`
- `admin_panel/src/app/[locale]/admin/(protected)/support-requests/page.tsx`

## أوامر مهمة بعد التحديث

```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
alembic upgrade head
python scripts\diagnose_schema_compatibility.py
uvicorn app.main:app --reload
```

ثم اختبر:

- `/ar/support`
- `/ar/downloads`
- `/ar/apps`
- `/ar/admin/support-requests`

