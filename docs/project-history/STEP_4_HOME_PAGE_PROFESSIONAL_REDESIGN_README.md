# Step 4 — Home Page Professional Redesign

تم تنفيذ الخطوة الرابعة ضمن:

```text
public_site
```

## ما تم تنفيذه

- إعادة تصميم الصفحة الرئيسية بالكامل.
- Hero احترافي مع مشهد تقني.
- Trust Highlights.
- What We Build.
- Why Choose Us.
- Process / How We Work.
- Technologies.
- CTA نهائي.
- استمرار إخفاء الأقسام الديناميكية إذا لا توجد بيانات.
- إضافة مكونات:
  - HomeHeroVisual
  - HomeFeatureCard
  - HomeProcessCard
  - HomeTechBadge
- تحديث PublicHero.
- تحديث PublicSection.
- تحديث نصوص ar/en.

## لم يتم تنفيذه بعد

- إعادة تصميم About.
- إعادة تصميم Contact.
- إعادة تصميم Quote Request.
- إعادة تصميم صفحات التفاصيل الديناميكية.
- Mobile polish النهائي.

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
