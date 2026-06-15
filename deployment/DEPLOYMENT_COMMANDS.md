# Deployment Commands

## 1. تجهيز env

```bash
cp .env.production.example .env.production
python deployment/scripts/generate_secret.py
```

ضع السر الناتج في:

```env
SECRET_KEY=
```

## 2. تجهيز الباكند

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate --fake-initial
python manage.py collectstatic --noinput
python manage.py check
```

تشغيل إنتاجي مباشر:

```bash
cd backend
source .venv/bin/activate
gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 60
```

## 3. تجهيز الموقع العام

```bash
cd public_site
npm ci
npm run build
npm run start:3000
```

## 4. تجهيز لوحة التحكم

```bash
cd admin_panel
corepack enable
pnpm install --frozen-lockfile
pnpm run build
pnpm run start
```

## 5. فحص الخدمات

```bash
curl -i http://127.0.0.1:8000/api/v1/health
curl -i http://127.0.0.1:3000
curl -i http://127.0.0.1:3001
```

## 6. النسخ الاحتياطي

```bash
pg_dump "$DATABASE_URL" | gzip > deployment/backups/company_platform_$(date +%Y%m%d_%H%M%S).sql.gz
```
