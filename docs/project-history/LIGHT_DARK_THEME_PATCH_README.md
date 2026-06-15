# Light/Dark Theme + Language Icon Patch

هذا التعديل يطبق:

```text
- ثيمين فقط: light / dark
- زر اللغة بأيقونة Languages وشكل compact
- زر الثيم بأيقونة Sun/Moon فقط
- تحديث CSS variables مركزيًا
- تحديث الترجمات إلى الوضع الفاتح / الوضع الغامق
```

## بعد النسخ

افحص الموقع العام:

```powershell
cd D:\company_platform\public_site
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run type-check
npm run lint
npm run build
```

ثم افحص لوحة الأدمن:

```powershell
cd D:\company_platform\admin_panel
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run type-check
npm run lint
npm run build
```
