# Step 11 — Public Site Final QA + Handoff

تم تجهيز مرحلة التسليم والفحص النهائي للموقع العام.

## ما تم إضافته

داخل:

```text
public_site
```

تمت إضافة:

```text
scripts/clean-next-cache.mjs
scripts/final-public-site-check.ps1
PUBLIC_SITE_QA_CHECKLIST.md
PUBLIC_SITE_HANDOFF_SUMMARY.md
PUBLIC_SITE_PRODUCTION_README.md
```

وتم تحديث `package.json` بإضافة:

```json
{
  "clean": "node scripts/clean-next-cache.mjs",
  "check": "npm run type-check && npm run lint && npm run build",
  "dev:3000": "next dev --port 3000",
  "start:3000": "next start --port 3000"
}
```

## طريقة الفحص

```powershell
cd D:\company_platform\public_site
npm run clean
npm run check
npm run dev:3000
```

أو:

```powershell
.\scripts\final-public-site-check.ps1
npm run dev:3000
```
