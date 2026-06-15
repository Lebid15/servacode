# Phase 14.2 — Content & SEO Closure

## الهدف
إغلاق طبقة المحتوى والـ SEO للموقع العام بدون إضافة ميزات جديدة، مع حماية النسخ المحلية والتجريبية من الفهرسة وتحضير الإنتاج ليعمل بإعدادات صريحة.

## التعديلات المنفذة

- ضبط `robots.txt` ليمنع الفهرسة افتراضيًا، ولا يسمح بها إلا عند ضبط `NEXT_PUBLIC_ALLOW_INDEXING=true`.
- جعل `Metadata robots` يتبع نفس منطق السماح بالفهرسة.
- تحسين `alternates.languages` بحيث يمكن تعطيل رابط اللغة الإنكليزية عبر `NEXT_PUBLIC_ENGLISH_ENABLED=false`، مع إضافة `x-default`.
- تحسين `sitemap.xml` ليضيف صفحة مركز التحميل عندما تكون هناك ملفات داخل `download_files` وليس فقط `download_url` القديم.
- جعل المحتوى التجريبي يظهر افتراضيًا في التطوير فقط، ولا يظهر في الإنتاج إلا إذا فُعّل صراحة.
- تحديث `.env.example` و `.env.production.example` لإضافة مفاتيح الإغلاق النهائية.
- تحسين JSON-LD ليقرأ اسم الشركة، الوصف، الشعار، العنوان، الهاتف، البريد، الدعم، وروابط التواصل من إعدادات الموقع.
- تنظيف تعابير ظاهرة قد توحي بأن بعض المحتوى مؤقت أو قابل للتحديث لاحقًا.
- ضبط نصوص صفحة الأنظمة لتظهر كـ “أنظمة” بدل “منتجات” في تفاصيل العناصر.

## متغيرات الإنتاج المهمة

```env
NEXT_PUBLIC_SHOW_DEMO_CONTENT=false
NEXT_PUBLIC_ALLOW_INDEXING=true
NEXT_PUBLIC_ENGLISH_ENABLED=true
```

> لا تضع `NEXT_PUBLIC_ALLOW_INDEXING=true` إلا على الدومين الرسمي النهائي.

## الفحوصات

- Backend compileall: OK
- i18n JSON parse: OK
- Public visible placeholder grep: OK — بقيت فقط تعليقات داخلية غير ظاهرة للزائر.
