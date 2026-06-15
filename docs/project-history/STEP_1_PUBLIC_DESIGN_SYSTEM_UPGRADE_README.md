# Step 1 — Public Design System Upgrade

تم تنفيذ الخطوة الأولى فقط ضمن:

```text
public_site
```

## ما تم تحديثه

- Light/Dark theme system
- Global CSS variables
- Premium tech visual identity
- Buttons
- Cards
- Icons
- Badges
- Inputs/Textareas/Selects
- Logo
- Page Header
- Empty State
- Language switcher
- Theme switcher

## لم يتم تعديل

- admin_panel
- backend
- صفحات الموقع الرئيسية
- منطق إخفاء الصفحات الفارغة

## الفحص المطلوب

```powershell
cd D:\company_platform\public_site
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run type-check
npm run lint
npm run build
```
