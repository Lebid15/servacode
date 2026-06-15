# Step 2 — Public Navbar + Footer Upgrade

تم تنفيذ الخطوة الثانية فقط ضمن:

```text
public_site
```

## ما تم تنفيذه

- إنشاء PublicNavbar احترافي.
- إنشاء PublicFooter احترافي.
- تحديث PublicShell.
- حذف أي رابط للوحة الأدمن من الموقع العام.
- إظهار الروابط الثابتة فقط:
  - الرئيسية
  - من نحن
  - تواصل معنا
  - اطلب عرض سعر
- تجهيز Mobile menu.
- تحديث i18n للهوية والفوتر.
- توسيع AppIcon بأيقونات الهيدر والفوتر.
- ضبط outputFileTracingRoot لتخفيف تحذير تعدد lockfiles.

## لم يتم تنفيذه بعد

- إظهار روابط الخدمات/المنتجات/الأعمال/المقالات ديناميكيًا.
- إعادة تصميم الصفحة الرئيسية.
- إخفاء أقسام الصفحة الرئيسية الفارغة.

## الفحص المطلوب

```powershell
cd D:\company_platform\public_site
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run type-check
npm run lint
npm run build
npm run dev -- --port 3000
```
