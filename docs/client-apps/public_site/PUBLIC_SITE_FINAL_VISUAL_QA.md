# Public Site Final Visual QA

## أوامر الفحص

```powershell
cd D:\company_platform\public_site
npm run clean
npm run check
npm run dev:3000
```

## فحص الموبايل

افتح DevTools وجرب:

```text
390px × 844px
430px × 932px
768px × 1024px
1024px × 768px
1440px × 900px
```

## يجب التأكد من التالي

```text
لا يوجد Scroll أفقي
الهيدر لا يضغط اللوغو
أزرار اللغة والثيم والقائمة لا تتداخل
Hero title واضح وليس مقصوص
أزرار Hero تظهر بعرض مريح على الموبايل
مشهد Dashboard لا يخرج من الشاشة
كروت الثقة تظهر مرتبة
قسم Architecture واضح ومقروء
Light mode لا يحتوي نصوص باهتة
Dark mode لا يحتوي كروت سوداء بلا تفاصيل
```

## صفحات الفحص

```text
/ar
/en
/ar/about
/ar/contact
/ar/quote-request
/ar/services
/ar/products
/ar/portfolio
/ar/blog
```

## قرار الاعتماد

لا يتم اعتماد الموقع بصريًا قبل إرسال صور:

```text
Hero على Desktop
Hero على Mobile
قسم Architecture
صفحة Contact
صفحة Quote
Light Mode
Dark Mode
```
