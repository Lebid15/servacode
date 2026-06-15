# Frontend Foundation

هذه هي المرحلة 7 فقط من المشروع.

## ما تحتويه

- Next.js + TypeScript
- Tailwind CSS
- نظام i18n أولي
- Theme Provider
- Direction helpers
- API Client
- Auth Client
- Design System tokens
- مكونات مركزية أولية
- صفحة مؤقتة للتأكد من عمل البنية

## التشغيل

```bash
cd public_site أو cd admin_panel حسب التطبيق
npm install
copy .env.example .env.local
npm run dev
```

ثم افتح:

```text
http://localhost:3000/ar
http://localhost:3000/en
```

## ملاحظات

- هذه ليست الواجهة النهائية.
- صفحة الأدمن النهائية تبدأ في المرحلة 8.
- صفحات الموقع العام النهائية تبدأ في المرحلة 10.
- ممنوع بناء تصميم محلي داخل الصفحات؛ استخدم مكونات `src/shared/design-system`.
