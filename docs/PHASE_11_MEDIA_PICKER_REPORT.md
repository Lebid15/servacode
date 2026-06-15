# Phase 11 — Media Picker Integration

## الهدف

تحويل تجربة استخدام الوسائط داخل لوحة التحكم من أسلوب:

```text
رفع الملف → نسخ الرابط → لصقه يدويًا داخل الحقل
```

إلى أسلوب أكثر احترافية:

```text
اختيار من المكتبة → تحديد الملف → تعبئة الحقل تلقائيًا
```

## ما تم تنفيذه

- إضافة مكوّن مركزي جديد `AdminMediaPicker`.
- دعم اختيار صورة أو ملف من مكتبة الوسائط داخل أي حقل من نوع `media-url`.
- دعم الرفع السريع من داخل نافذة الاختيار نفسها.
- دعم البحث داخل مكتبة الوسائط من داخل الـ Picker.
- دعم معاينة الصور والملفات قبل الاختيار.
- دعم فتح الملف في تبويب جديد.
- دعم تنظيف الحقل من الزر نفسه.
- ربط الـ Picker بحقول الصور والتحميل في وحدات الأدمن المركزية.
- ربط الـ Picker بحقول شعار الموقع و favicon داخل Settings.
- تقييد الحقول الخاصة بالصور مثل `logo`, `favicon`, `icon`, `image` و `cover` على رفع الصور فقط.
- إبقاء إمكانية إدخال الرابط يدويًا لمن يريد استخدام رابط خارجي.
- تحديث نصوص مكتبة الوسائط لتوضح أن الاختيار المباشر أصبح مدعومًا.

## الملفات المعدلة أو الجديدة

```text
admin_panel/src/shared/admin/components/AdminMediaPicker.tsx
admin_panel/src/shared/admin/components/AdminModulePage.tsx
admin_panel/src/shared/admin/components/AdminSettingsPage.tsx
admin_panel/src/app/[locale]/admin/(protected)/settings/page.tsx
admin_panel/src/app/[locale]/admin/(protected)/media/page.tsx
admin_panel/src/shared/design-system/i18n/ar.json
admin_panel/src/shared/design-system/i18n/en.json
docs/PHASE_11_MEDIA_PICKER_REPORT.md
```

## اختبار سريع

1. افتح لوحة التحكم.
2. ارفع صورة من صفحة Media.
3. افتح Settings.
4. اضغط "اختيار من المكتبة" عند حقل الشعار.
5. اختر الصورة.
6. احفظ الإعدادات.
7. افتح الموقع العام وتأكد أن الشعار ظهر.
8. كرر التجربة داخل Apps / Products / Portfolio / Blog.

## ملاحظات

- ما زال إدخال الرابط اليدوي مدعومًا.
- اختيار الصور من المكتبة يحفظ الرابط النسبي مثل `/uploads/...` وهذا أفضل للنقل بين local و production.
- زر نسخ الرابط في مكتبة الوسائط بقي موجودًا للحالات الخاصة أو الروابط الخارجية.
