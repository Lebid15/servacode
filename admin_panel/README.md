# Admin Panel

لوحة التحكم الداخلية للموقع. هذا التطبيق مستقل عن الموقع العام ويعمل على المنفذ 3001.

## التشغيل

```bash
cd D:\platform\admin_panel
pnpm install
copy .env.example .env.local
pnpm run dev
```

الرابط المحلي:

```text
http://localhost:3001/ar/admin/login
```

## قواعد الفصل

- لا يحتوي هذا التطبيق صفحات الموقع العام.
- لا يحتوي `shared/public` أو `shared/seo` الخاص بالموقع العام.
- لا يحتوي sitemap عام؛ لوحة الأدمن ممنوعة من الأرشفة عبر robots.
