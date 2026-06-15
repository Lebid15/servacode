# Step 7 — Quote Request Page Professional Redesign

تم تنفيذ الخطوة السابعة ضمن:

```text
public_site
```

## ما تم تنفيذه

- إعادة تصميم صفحة طلب عرض السعر بالكامل.
- Hero احترافي لطلب مشروع برمجي.
- كرت جانبي يشرح أن العميل لا يحتاج معرفة التفاصيل التقنية.
- قسم أنواع المشاريع.
- قسم ماذا يحدث بعد إرسال الطلب.
- نموذج طلب مشروع احترافي.
- حالات نجاح وخطأ واضحة.
- تحديث خيارات نوع المشروع ووسيلة التواصل من i18n.
- إضافة مكونات:
  - QuoteStepCard
  - QuoteProjectTypeCard
- تحديث QuoteRequestForm.
- تحديث نصوص ar/en.

## لم يتم تنفيذه بعد

- Dynamic Pages Redesign.
- Services/Products/Portfolio/Blog detail pages.
- SEO polish النهائي.

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
