# Project Structure

البنية المعتمدة رسميًا بعد إعادة التنظيم:

```text
platform/
├─ backend/       # Django REST backend only
├─ public_site/   # Public Next.js website only
├─ admin_panel/   # Admin Next.js panel only
├─ docs/          # Documentation
├─ deployment/    # Deployment scripts and Nginx config
└─ .env.example
```

## قواعد الفصل

- لا يوجد مجلد `frontend` جامع.
- لا يحتوي `public_site` على `backend` أو `admin_panel` أو نسخ من المشروع.
- لا يحتوي `admin_panel` على `backend` أو `public_site` أو نسخ من المشروع.
- ملفات البيئة الحقيقية غير مرفقة في النسخة النظيفة.
- `public_site` يستخدم npm و `package-lock.json`.
- `admin_panel` يستخدم pnpm و `pnpm-lock.yaml`.

## أوامر الفحص

### Backend

```powershell
cd D:\platform\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements-dev.txt
python scripts\quality_check.py
```

### Public Site

```powershell
cd D:\platform\public_site
npm ci
npm run quality
npm run build
```

### Admin Panel

```powershell
cd D:\platform\admin_panel
pnpm install
pnpm run quality
pnpm run build
```
