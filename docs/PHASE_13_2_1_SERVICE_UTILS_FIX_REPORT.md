# Phase 13.2.1 — Service Utils Import Fix

## المشكلة
ظهرت مشكلة تشغيل في الموقع العام:

```text
Module not found: Can't resolve './api-client'
```

السبب أن ملف:

```text
public_site/src/shared/public/service-utils.ts
```

كان يحاول استيراد `api-client` من نفس مجلد `shared/public`، بينما `api-client.ts` موجود في:

```text
public_site/src/shared/api/api-client.ts
```

## الحل
تم إعادة بناء `service-utils.ts` كملف أدوات عرض للخدمات فقط، بدون طلبات API مباشرة.

الملف الآن:
- يستورد نوع `PublicService` من `shared/api/public-client`.
- لا يستورد `apiRequest` نهائيًا.
- يحتوي أدوات:
  - `normalizeServiceIcon`
  - `publicServiceToCardView`
  - `getFallbackServiceCards`
  - `getFallbackServiceBySlug`

## الفحص
تم تنفيذ:

```text
npm run type-check
npm run lint
```

داخل `public_site` بنجاح.
