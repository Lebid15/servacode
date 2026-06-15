# Separated Apps Structure

تم فصل المشروع احترافيًا إلى:

```text
backend/                 => API + Database models + Admin/Public APIs
public_site/    => الموقع العام فقط
admin_panel/    => لوحة الأدمن فقط
deployment/              => Nginx/Deploy/Backup
```

## التشغيل المحلي المباشر

### 1. Backend

```powershell
cd D:\company_platform\backend
.\.venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

### 2. Public Site

```powershell
cd D:\company_platform\public_site
copy .env.example .env.local
npm install
npm run dev
```

يفتح على:

```text
http://localhost:3000/ar
```

### 3. Admin Panel

```powershell
cd D:\company_platform\admin_panel
copy .env.example .env.local
npm install
npm run dev
```

يفتح على:

```text
http://localhost:3001/ar/admin/login
```

## النشر الاحترافي

```text
Public Site : https://example.com
Admin Panel : https://admin.example.com
API         : https://api.example.com
```

## ملاحظات

- الموقع العام لا يحتوي Routes للأدمن.
- لوحة الأدمن لا تحتوي Routes للموقع العام.
- كلاهما يستخدمان نفس API عبر `NEXT_PUBLIC_API_BASE_URL`.
- رابط "لوحة الأدمن" في الموقع العام يذهب إلى `NEXT_PUBLIC_ADMIN_URL`.
- زر "فتح الموقع" داخل لوحة الأدمن يذهب إلى `NEXT_PUBLIC_PUBLIC_SITE_URL`.
