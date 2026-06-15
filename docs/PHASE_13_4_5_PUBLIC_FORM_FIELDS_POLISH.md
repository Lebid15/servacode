# Phase 13.4.5 — Public Form Fields Visual Polish

## الهدف
تحسين شكل حقول النماذج في الموقع العام بعد ملاحظة أن لونها الرمادي كان ثقيلًا وغير منسجم مع هوية الموقع الزجاجية.

## التعديلات
- إضافة نمط مركزي جديد باسم `app-field-control` داخل `public_site/src/app/globals.css`.
- تطبيق النمط المركزي على:
  - `AppInput`
  - `AppSelect`
  - `AppTextarea`
- تحويل خلفية الحقول من رمادي ثقيل إلى خلفية زجاجية داكنة بتدرج أزرق خفيف.
- تحسين ألوان الحدود، hover، focus، placeholder، و autofill.
- تحسين شكل خيارات select لتنسجم مع الثيم الداكن.

## الملفات المعدلة
- `public_site/src/app/globals.css`
- `public_site/src/shared/design-system/components/AppInput.tsx`
- `public_site/src/shared/design-system/components/AppSelect.tsx`
- `public_site/src/shared/design-system/components/AppTextarea.tsx`

## النتيجة
كل نماذج الموقع العام ستتأثر مركزيًا، خصوصًا:
- نموذج ابدأ مشروعك
- نموذج التواصل
- نموذج الدعم
