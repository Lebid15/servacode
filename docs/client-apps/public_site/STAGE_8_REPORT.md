# المرحلة 8 — Admin Panel Foundation

تم تنفيذ المرحلة 8 فقط.

## ما تم إنجازه

- تصحيح بنية Layout في Next.js:
  - `src/app/layout.tsx` يحتوي `html/body`.
  - `src/app/[locale]/layout.tsx` يستخدم المزودات فقط.
  - `LocaleDocumentSync` يضبط `lang/dir`.

- إضافة Auth Provider:
  - `AdminAuthProvider`
  - `useAdminAuth`
  - `AdminAuthGuard`

- إضافة صفحة تسجيل دخول:
  - `/ar/admin/login`
  - `/en/admin/login`

- إضافة Protected Admin Layout:
  - Sidebar
  - Topbar
  - Logout
  - Language Switcher
  - Theme Switcher

- إضافة Dashboard Shell:
  - `/ar/admin/dashboard`
  - `/en/admin/dashboard`

- إضافة صفحات Placeholder لمسارات الأدمن:
  - services
  - products
  - portfolio
  - quote-requests
  - contact-messages
  - blog
  - static-pages
  - testimonials
  - faqs
  - media
  - settings
  - users
  - notifications
  - audit-logs
  - analytics

- توسيع ملفات الترجمة:
  - `ar.json`
  - `en.json`

- إضافة مكونات:
  - `AppLogo`
  - `LanguageSwitcher`
  - `ThemeSwitcher`
  - `AdminShell`

## ما لم يتم تنفيذه

- لم يتم تنفيذ صفحات CRUD الفعلية للأدمن.
- لم يتم تنفيذ جداول الوحدات.
- لم يتم تنفيذ فورمات الخدمات والمنتجات والمقالات.
- لم يتم تنفيذ Dashboard الحقيقي من API.
- لم يتم تنفيذ رفع الملفات.
- لم يتم تنفيذ موقع عام نهائي.

هذه العناصر مكانها المرحلة 9 وما بعدها.

## أوامر التشغيل

```bash
cd public_site أو cd admin_panel حسب التطبيق
npm install
copy .env.example .env.local
npm run dev
```

ثم افتح:

```text
http://localhost:3000/ar/admin/login
http://localhost:3000/en/admin/login
```

## متطلبات الاختبار

يجب تشغيل الباكند أولًا:

```bash
cd backend
alembic upgrade head
python scripts/create_first_admin.py --username admin --password "StrongPassword123" --full-name "مدير المنصة" --email admin@example.com
uvicorn app.main:app --reload
```

ثم سجل الدخول من الواجهة:

```text
username: admin
password: StrongPassword123
```

## حالة المرحلة

المرحلة 8 جاهزة للمراجعة.
