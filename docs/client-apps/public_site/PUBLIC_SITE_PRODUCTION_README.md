# Public Site Production Candidate

هذه نسخة الموقع العام بعد إعادة البناء الاحترافي.

## التشغيل المحلي

```powershell
cd D:\company_platform\public_site
copy .env.example .env.local
npm install
npm run type-check
npm run lint
npm run build
npm run dev -- --port 3000
```

## أوامر الفحص النهائية

```powershell
npm run type-check
npm run lint
npm run build
```

## متغيرات البيئة المهمة

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=CompanyName
NEXT_PUBLIC_SITE_TITLE=CompanyName — Professional Software Systems Studio
NEXT_PUBLIC_SITE_DESCRIPTION=Professional software company specialized in websites, web applications, desktop software, admin panels, SaaS products, and API integrations.
NEXT_PUBLIC_TWITTER_HANDLE=@companyname
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_DEFAULT_THEME=dark
```

## قبل النشر

غيّر القيم إلى الدومين الحقيقي:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_ADMIN_URL=https://admin.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
```

## ما تم تثبيته

- Design System احترافي.
- Light/Dark.
- Arabic/English.
- Navbar/Footer.
- إخفاء الصفحات الفارغة.
- Home/About/Contact/Quote redesign.
- Dynamic pages redesign.
- Responsive/Motion polish.
- SEO/Sitemap/Robots/Manifest/OpenGraph.
