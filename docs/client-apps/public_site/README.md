# Public Site

هذا هو الموقع العام لشركة البرمجيات بعد إعادة البناء الاحترافي.

## التشغيل المحلي

```powershell
cd D:\company_platform\public_site
copy .env.example .env.local
npm install
npm run clean
npm run check
npm run dev:3000
```

## الروابط المحلية

```text
http://localhost:3000/ar
http://localhost:3000/en
http://localhost:3000/ar/about
http://localhost:3000/ar/contact
http://localhost:3000/ar/quote-request
```

## ملاحظات مهمة

- لا يحتوي الموقع العام على أي Route أو Provider خاص بلوحة الأدمن.
- رابط لوحة الأدمن لا يظهر داخل الموقع العام.
- الصفحات الديناميكية لا تظهر في الهيدر إلا عند وجود بيانات فعلية.
- الصفحات الديناميكية الفارغة تعرض Coming Soon احترافي.
- الثيمات المعتمدة فقط: Light / Dark.
