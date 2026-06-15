# Public Site Production Commands

## Local check

```powershell
cd D:\company_platform\public_site
npm run clean
npm run check
npm run dev:3000
```

## Production build

```bash
npm install
npm run clean
npm run build
npm run start:3000
```

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_ADMIN_URL=https://admin.example.com
NEXT_PUBLIC_SITE_NAME=CompanyName
NEXT_PUBLIC_SITE_TITLE=CompanyName — Professional Software Systems Studio
NEXT_PUBLIC_SITE_DESCRIPTION=Professional software company specialized in websites, web applications, desktop software, admin panels, SaaS products, and API integrations.
NEXT_PUBLIC_TWITTER_HANDLE=@companyname
NEXT_PUBLIC_DEFAULT_LOCALE=ar
NEXT_PUBLIC_DEFAULT_THEME=dark
```
