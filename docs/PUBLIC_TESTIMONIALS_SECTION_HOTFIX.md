# Public Testimonials Section Hotfix

This hotfix adds a clear place for customer testimonials on the public website.

## What changed

- Added a dedicated public page:
  - `/ar/testimonials`
  - `/en/testimonials`
- Added "آراء العملاء / Testimonials" to the public navbar when the testimonials section is enabled.
- Added the same link to the footer.
- Improved the homepage testimonials section with:
  - rating stars
  - client name
  - company/position
  - link to view all testimonials
- Added a professional empty state on the testimonials page when there are no published testimonials yet.

## Important

Testimonials are managed from the admin panel:

`لوحة التحكم → إدارة المحتوى → آراء العملاء`

Only active/published testimonials appear publicly.

## Files

- `public_site/src/app/[locale]/(public)/layout.tsx`
- `public_site/src/shared/public/components/PublicShell.tsx`
- `public_site/src/shared/public/components/PublicNavbar.tsx`
- `public_site/src/shared/public/components/PublicFooter.tsx`
- `public_site/src/app/[locale]/(public)/page.tsx`
- `public_site/src/app/[locale]/(public)/testimonials/page.tsx`
- `public_site/src/shared/design-system/i18n/ar.json`
- `public_site/src/shared/design-system/i18n/en.json`
