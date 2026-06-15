# Company Platform

مشروع منصة شركة برمجيات مكوّن من ثلاث وحدات مستقلة من جذر المشروع، بدون مجلد جامع باسم frontend.

```text
platform/
├─ backend/       # Django REST API + database + admin/public endpoints
├─ public_site/   # الموقع العام للزوار والعملاء
├─ admin_panel/   # لوحة التحكم الداخلية
├─ docs/          # توثيق المشروع
├─ deployment/    # ملفات النشر و Nginx والسكريبتات
└─ .env.example
```

## قواعد التنظيم

- `backend/` يحتوي ملفات الباكند فقط.
- `public_site/` يحتوي ملفات الموقع العام فقط.
- `admin_panel/` يحتوي ملفات لوحة التحكم فقط.
- ممنوع وضع نسخة من أي وحدة داخل وحدة أخرى.
- ملفات البيئة الحقيقية مثل `.env` و `.env.local` لا تُرفع ولا تُرسل، وتبقى فقط على الجهاز أو السيرفر.

## تشغيل الباكند محليًا

```powershell
cd D:\platform\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements-dev.txt
python manage.py migrate --fake-initial
python scripts\quality_check.py
python manage.py runserver 0.0.0.0:8000
```

## تشغيل الموقع العام

```powershell
cd D:\platform\public_site
npm ci
npm run quality
npm run build
npm run start:3000
```

## تشغيل لوحة التحكم

```powershell
cd D:\platform\admin_panel
pnpm install
pnpm run quality
pnpm run build
pnpm run start
```

## تشغيل المشروع كاملًا محليًا

```powershell
# 1) شغّل PostgreSQL محليًا أو استخدم قاعدة خارجية، ثم اضبط DATABASE_URL.

# 2) الباكند
cd D:\platform\backend
python manage.py migrate --fake-initial
python manage.py runserver 0.0.0.0:8000

# 3) الموقع العام في نافذة طرفية أخرى
cd D:\platform\public_site
npm run dev:3000

# 4) لوحة التحكم في نافذة طرفية ثالثة
cd D:\platform\admin_panel
pnpm run dev
```
