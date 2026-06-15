# Public Site

الموقع العام للزوار والعملاء. هذا التطبيق مستقل عن لوحة التحكم ويعمل على المنفذ 3000.

## التشغيل

```bash
cd D:\platform\public_site
npm install
copy .env.example .env.local
npm run dev:3000
```

الروابط المحلية:

```text
http://localhost:3000/ar
http://localhost:3000/en
```

## قواعد الفصل

- لا يحتوي هذا التطبيق صفحات أو مكونات لوحة الأدمن.
- لا يحتوي `shared/admin` أو `shared/auth` الخاص بلوحة التحكم.
- يستخدم Public APIs فقط من الباكند.
