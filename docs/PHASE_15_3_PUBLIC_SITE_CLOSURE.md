# Phase 15.3 — Public Site Closure

## الهدف

إغلاق الموقع العام وظيفيًا وربطه بشكل أوضح مع ما تتم إدارته من لوحة الأدمن، مع منع ظهور محتوى تجريبي بشكل غير مقصود، وتحسين عرض الخدمات والأنظمة والتطبيقات والأعمال للزائر.

> النشر الفعلي ما زال مؤجلًا. هذه المرحلة هدفها تجهيز الموقع العام ليكون جاهزًا للنشر لاحقًا بعد اكتمال كل المراحل.

---

## الملفات المعدلة

- `public_site/.env.example`
- `public_site/src/shared/api/public-client.ts`
- `public_site/src/shared/public/public-labels.ts`
- `public_site/src/app/[locale]/(public)/page.tsx`
- `public_site/src/app/[locale]/(public)/services/page.tsx`
- `public_site/src/app/[locale]/(public)/services/[slug]/page.tsx`
- `public_site/src/app/[locale]/(public)/products/page.tsx`
- `public_site/src/app/[locale]/(public)/products/[slug]/page.tsx`
- `public_site/src/app/[locale]/(public)/apps/page.tsx`
- `public_site/src/app/[locale]/(public)/apps/[slug]/page.tsx`
- `public_site/src/app/[locale]/(public)/portfolio/[slug]/page.tsx`
- `docs/PHASE_15_3_PUBLIC_SITE_CLOSURE.md`
- `plan.md`

---

## ما تم إنجازه

### 1. منع المحتوى التجريبي من الظهور افتراضيًا

تم تعديل `public_site/.env.example` ليصبح:

```env
NEXT_PUBLIC_SHOW_DEMO_CONTENT=false
```

بهذا الشكل لا تظهر تطبيقات/أنظمة/أعمال/خدمات تجريبية في النسخة الجاهزة إلا إذا تم تفعيلها صراحة أثناء التطوير.

### 2. ضبط fallback الخدمات

كانت صفحة الخدمات تعرض خدمات fallback احترافية حتى لو لم تكن هناك بيانات من الباكند. تم ربط هذا السلوك الآن بـ `isDemoContentEnabled()`.

النتيجة:

- إذا كان المحتوى التجريبي مفعلًا: تظهر خدمات fallback أثناء التطوير.
- إذا كان المحتوى التجريبي غير مفعل: تظهر صفحة غير متاحة بدل عرض محتوى وهمي.

### 3. إصلاح خطأ JSX في صفحة تفاصيل التطبيقات

تم إصلاح تكرار زر داخل زر في:

```text
public_site/src/app/[locale]/(public)/apps/[slug]/page.tsx
```

كان الخطأ عبارة عن `AppButton` مكرر داخل `AppButton`، وهو خطأ قادر على كسر build.

### 4. إضافة تسميات زائر مركزية

تم إنشاء ملف:

```text
public_site/src/shared/public/public-labels.ts
```

وظيفته تحويل القيم التقنية إلى نصوص مفهومة للزائر، مثل:

- `coming_soon` → `قريبًا`
- `in_development` → `قيد التطوير`
- `cross_platform` → `متعدد المنصات`
- `freemium` → `مجاني جزئيًا`

هذا يمنع ظهور قيم API الخام داخل الموقع العام.

### 5. تحسين عرض الأنظمة

تم تحسين صفحة تفاصيل الأنظمة لتعرض بيانات إضافية محفوظة من لوحة الأدمن:

- الجمهور المستهدف.
- المتطلبات.
- معرض صور النظام.
- الأسئلة الشائعة.

### 6. تحسين عرض الأعمال

تم تحسين صفحة تفاصيل الأعمال لتعرض معرض صور المشروع من:

- الصورة الرئيسية.
- صور المعرض الإضافية.

### 7. تحسين عرض التطبيقات

تم الحفاظ على منطق زر التحميل المباشر، مع إصلاح JSX وتنسيق بعض القيم الظاهرة للزائر.

قاعدة مهمة مثبتة:

```text
إذا كان للتطبيق رابط تحميل، فالزر الأساسي يكون تحميل التطبيق وليس فتح التطبيق.
```

### 8. توسيع أنواع API العامة

تم توسيع نوع `PublicProduct` ليتضمن الحقول التي تحتاجها صفحة تفاصيل النظام:

- `target_audience_ar`
- `target_audience_en`
- `requirements_ar`
- `requirements_en`
- `show_demo_request`

وتم توسيع نوع `PublicPortfolioProject` ليشمل `completed_at`.

---

## الفحوص التي تم تشغيلها

داخل `public_site`:

```bash
npm run quality
```

النتيجة:

```text
نجح TypeScript + ESLint بدون أخطاء.
```

داخل `public_site`:

```bash
npm run release-check
```

النتيجة:

```text
OK: public site release checks passed.
```

داخل `backend`:

```bash
python -m compileall config platform_api scripts tests
```

النتيجة:

```text
نجح Python compile.
```

تم تشغيل `npm run build` للموقع العام، ووصل إلى:

```text
Compiled successfully
Linting and checking validity of types
Generating static pages completed
```

لكن أمر build داخل بيئة العمل توقف عند مرحلة `Collecting build traces` بسبب timeout في بيئة الحاوية، لذلك لا أعتبره فشل كود، خصوصًا أن `quality` نجح وأن build وصل إلى compilation بنجاح.

يجب إعادة تشغيله على جهاز التطوير المحلي للتأكيد النهائي:

```powershell
cd D:\platform\public_site
npm run build
```

---

## المطلوب اختباره يدويًا بعد هذه المرحلة

- إضافة خدمة من الأدمن والتأكد أنها تظهر في الموقع العام.
- إيقاف `NEXT_PUBLIC_SHOW_DEMO_CONTENT` والتأكد أن الموقع لا يعرض محتوى تجريبي.
- إضافة نظام مع جمهور مستهدف ومتطلبات وصور وأسئلة، ثم فتح صفحة تفاصيله.
- إضافة تطبيق مع رابط تحميل والتأكد أن زر التحميل يعمل.
- إضافة عمل مع معرض صور والتأكد أن صفحة التفاصيل تعرض الصور.
- فحص العربية والإنجليزية في الصفحات العامة.
- فحص الثيم الفاتح والداكن.
- فحص الموبايل للصفحات الأساسية.

---

## حالة المرحلة

```text
Phase 15.3 Public Site Closure: Completed
```

المرحلة التالية:

```text
Phase 15.4 — Full End-to-End QA
```
