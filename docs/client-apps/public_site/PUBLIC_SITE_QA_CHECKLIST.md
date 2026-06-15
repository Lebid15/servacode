# Public Site QA Checklist

استخدم هذه القائمة بعد تشغيل الموقع العام على:

```text
http://localhost:3000/ar
http://localhost:3000/en
```

## 1. فحص التشغيل

```powershell
cd D:\company_platform\public_site
npm run clean
npm run check
npm run dev:3000
```

يجب أن تنجح:

```text
type-check
lint
build
```

## 2. الصفحات الأساسية

افتح الصفحات التالية:

```text
/ar
/en
/ar/about
/en/about
/ar/contact
/en/contact
/ar/quote-request
/en/quote-request
/ar/privacy
/ar/terms
```

## 3. الهيدر

تأكد من التالي:

```text
لا يظهر زر لوحة الأدمن
تظهر الروابط الأساسية فقط
زر اللغة واضح ومرتب
زر الثيم شمس/قمر
القائمة تعمل على الموبايل
الهيدر Sticky وGlass
```

## 4. الصفحات الديناميكية الفارغة

إذا لا توجد بيانات من الباكند، يجب أن تظهر Coming Soon عند الدخول المباشر:

```text
/ar/services
/ar/products
/ar/portfolio
/ar/blog
```

ولا يجب أن تظهر هذه الروابط في الهيدر إلا عند وجود بيانات فعلية.

## 5. الصفحة الرئيسية

تأكد من التالي:

```text
Hero قوي وواضح
المشهد التقني ظاهر
Trust Highlights موجودة
What We Build موجودة
Why Choose Us موجودة
Process موجود
Technologies موجود
CTA النهائي موجود
لا توجد كروت فارغة
لا توجد رسائل "لا توجد بيانات"
```

## 6. الثيمات

جرّب:

```text
Dark Mode
Light Mode
```

يجب أن تتغير الواجهة كاملة بدون قص أو ألوان غريبة.

## 7. اللغة

جرّب تبديل:

```text
AR -> EN
EN -> AR
```

يجب أن:

```text
يتغير الاتجاه RTL/LTR
تتغير النصوص
تبقى الصفحة الحالية قدر الإمكان
```

## 8. Responsive

افحص على:

```text
Desktop
Tablet
Mobile
```

يجب ألا يظهر:

```text
سكرول أفقي
قص نصوص
تداخل أزرار
هيدر مكسور
كروت خارجة عن الشاشة
```

## 9. SEO

افتح:

```text
http://localhost:3000/robots.txt
http://localhost:3000/sitemap.xml
http://localhost:3000/manifest.webmanifest
http://localhost:3000/opengraph-image
```

يجب أن تعمل بدون أخطاء.

## 10. قبل النشر

في `.env.local` أو بيئة الإنتاج غيّر:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_ADMIN_URL=https://admin.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
NEXT_PUBLIC_SITE_NAME=اسم الشركة الحقيقي
```
