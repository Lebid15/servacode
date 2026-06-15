# Phase 6 — Public Site Content & Professional Cleanup

## Goal
تحويل الموقع العام من واجهة تحمل آثار التطوير إلى واجهة شركة برمجيات أكثر هدوءًا واحترافية، بدون إضافة ميزات كبيرة أو تغيير منطق لوحة الأدمن.

## What changed

### 1. Removed development-facing public copy
- Removed public fallbacks such as `CompanyName` from the public site.
- Removed Foundation/Stage/Coming soon wording from the public site UI and SEO fallbacks.
- Replaced internal terms such as "Admin Panel" in public-facing service descriptions with "Management Dashboard / أنظمة إدارة".

### 2. Simplified home page defaults
The homepage now defaults to a cleaner marketing structure:
- Hero
- Contact band
- Proof strip
- What we build
- Why us
- Dynamic published content when available
- Final CTA

The following heavy technical sections are now hidden by default unless enabled from Settings:
- Composition
- Architecture
- Process
- Technologies
- Blog on homepage
- Testimonials on homepage
- FAQs on homepage

### 3. Better unavailable-content pages
The old "Coming soon" experience was replaced with a professional unpublished-content state:
- `PublicUnavailable`
- Arabic/English copy no longer says the site is unfinished.
- Pages still provide a path back home or to quote request.

### 4. Better legal pages
Privacy and Terms pages now have useful professional fallback paragraphs instead of a foundation placeholder.

### 5. Default language routing
`/` now redirects according to `public/settings.default_language`.
If English is disabled, it safely redirects to Arabic.

### 6. Language switcher respects English availability
The navbar language switcher now hides automatically when English is disabled from Settings.

### 7. SEO and structured data cleanup
- SEO fallbacks now use `Software Studio` instead of `CompanyName`.
- Organization/WebSite/ProfessionalService JSON-LD can now receive public settings data.
- Structured service type wording now uses "Management Dashboards" instead of "Admin Panels".
- Manifest start URL and direction now respect default language.
- Manifest theme colors now respect the active theme family.

### 8. Development diagnostics
The public API client now logs request failure details in development mode only, while preserving production-safe fallback behavior.

## Modified files

### Public site
- `public_site/src/app/page.tsx`
- `public_site/src/app/manifest.ts`
- `public_site/src/app/opengraph-image.tsx`
- `public_site/src/app/[locale]/(public)/page.tsx`
- `public_site/src/app/[locale]/(public)/services/page.tsx`
- `public_site/src/app/[locale]/(public)/products/page.tsx`
- `public_site/src/app/[locale]/(public)/portfolio/page.tsx`
- `public_site/src/app/[locale]/(public)/blog/page.tsx`
- `public_site/src/app/[locale]/(public)/privacy/page.tsx`
- `public_site/src/app/[locale]/(public)/terms/page.tsx`
- `public_site/src/shared/api/api-client.ts`
- `public_site/src/shared/constants/app.ts`
- `public_site/src/shared/design-system/components/LanguageSwitcher.tsx`
- `public_site/src/shared/design-system/i18n/ar.json`
- `public_site/src/shared/design-system/i18n/en.json`
- `public_site/src/shared/public/components/PublicNavbar.tsx`
- `public_site/src/shared/public/components/PublicUnavailable.tsx`
- `public_site/src/shared/public/settings-utils.ts`
- `public_site/src/shared/seo/seo-config.ts`
- `public_site/src/shared/seo/structured-data.ts`

### Backend/config fallbacks
- `backend/app/api/v1/endpoints/public.py`
- `backend/app/models/settings.py`
- `backend/app/core/config.py`
- `backend/.env.example`
- `.env.production.example`
- `public_site/.env.example`

## Validation performed
- Public JSON dictionaries parsed successfully.
- Backend compileall completed successfully.
- Public-site source scan no longer finds public-facing `CompanyName`, `APP_TEMP_NAME`, `Foundation`, `Stage 7`, `Frontend Foundation`, `Coming soon`, or `PublicComingSoon` remnants in the inspected public-site source.

## Local QA checklist
1. Run backend and public site.
2. Open `/` and verify redirect follows default language.
3. Disable English from Settings and verify language switcher disappears.
4. Open services/products/portfolio/blog with no content and verify professional unpublished state.
5. Open privacy and terms pages and verify professional fallback text.
6. Open homepage and confirm it is shorter and less crowded by default.
7. Enable architecture/process/technologies from Settings if you want the technical sections back.
