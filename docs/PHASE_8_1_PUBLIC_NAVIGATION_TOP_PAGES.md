# Phase 8.1 — Public Navigation Top Pages

## Summary
تم تثبيت روابط الصفحات الأساسية في الشريط العلوي للموقع العام بحيث تظهر الصفحات المهمة طالما أنها مفعلة من لوحة التحكم، حتى إذا لم يكن هناك محتوى منشور بعد. الصفحات نفسها تعرض حالة احترافية عند عدم وجود محتوى.

## Changes
- ترتيب الروابط العلوية: الرئيسية، من نحن، الخدمات، تطبيقاتنا، المنتجات، الأعمال، المدونة عند وجود مقالات، تواصل معنا.
- إظهار الخدمات/تطبيقاتنا/المنتجات/الأعمال بناءً على إعدادات الظهور من لوحة التحكم، وليس بناءً على وجود محتوى فقط.
- إبقاء المدونة مشروطة بوجود مقالات منشورة حتى لا تظهر فارغة تسويقيًا.
- توحيد روابط الفوتر مع الروابط الأساسية، مع إبقاء الخصوصية والشروط في أسفل الفوتر.
- ضبط افتراضيات ظهور الأقسام داخل لوحة التحكم لتطابق افتراضيات الموقع العام.

## Files
- `public_site/src/app/[locale]/(public)/layout.tsx`
- `public_site/src/shared/public/components/PublicNavbar.tsx`
- `public_site/src/shared/public/components/PublicFooter.tsx`
- `public_site/src/shared/public/components/PublicShell.tsx`
- `admin_panel/src/shared/admin/components/AdminSettingsPage.tsx`
