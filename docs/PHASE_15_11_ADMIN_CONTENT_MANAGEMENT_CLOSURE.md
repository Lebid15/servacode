# Phase 15.11 — Admin Content Management Closure

## الهدف
إغلاق قسم **إدارة المحتوى** داخل لوحة التحكم حتى لا يكون مجرد تحويل إلى الخدمات، بل مركز حقيقي يوضح حالة كل محتوى الموقع ويقود المدير إلى المكان الصحيح.

## ما تم
- إضافة endpoint جديد في الباكند:
  - `GET /api/v1/admin/content-overview`
- إضافة صفحة مركزية:
  - `/ar/admin/content`
- ربط قائمة لوحة التحكم بقسم إدارة المحتوى بدل فتح الخدمات مباشرة.
- عرض حالة كل أقسام المحتوى:
  - الخدمات
  - الأنظمة
  - التطبيقات
  - الأعمال
  - المدونة
  - الصفحات الثابتة
  - الأسئلة الشائعة
  - آراء العملاء
  - الوسائط
  - قوالب البريد
- التفريق بين:
  - محتوى تأسيسي من الباكند Seed.
  - محتوى يجب إدخاله يدويًا مثل التطبيقات والأعمال الحقيقية.
- إضافة مؤشرات:
  - إجمالي العناصر
  - العناصر الظاهرة
  - المخفية
  - المسودات
  - نسبة اكتمال كل قسم
  - تنبيهات الأقسام التي تحتاج متابعة

## الملفات
- `backend/platform_api/views.py`
- `backend/platform_api/urls.py`
- `admin_panel/src/shared/api/admin-client.ts`
- `admin_panel/src/app/[locale]/admin/(protected)/layout.tsx`
- `admin_panel/src/app/[locale]/admin/(protected)/content/page.tsx`
- `admin_panel/src/shared/admin/components/AdminContentManagementPage.tsx`
- `admin_panel/scripts/release-check.mjs`

## اختبار سريع
```powershell
cd D:\platform\backend
.\.venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
```

```powershell
cd D:\platform\admin_panel
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run release-check
npm run dev
```

ثم افتح:
- `http://127.0.0.1:3001/ar/admin/content`

## التقييم
بعد هذا الإغلاق، قسم إدارة المحتوى ينتقل من صفحة تحويل بسيطة إلى مركز تحكم فعلي.
