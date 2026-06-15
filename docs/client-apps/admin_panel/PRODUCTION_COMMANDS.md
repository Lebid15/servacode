# Frontend Production Commands

## تشغيل إنتاجي مباشر

```bash
cd public_site أو cd admin_panel حسب التطبيق
npm install
cp .env.example .env.local
npm run build
npm run start
```

## متغيرات مهمة

```env
NEXT_PUBLIC_API_BASE_URL=https://example.com/api/v1
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_DEFAULT_THEME=blue-tech
```
