# Phase 4 — Public Site Integration & Marketing Polish

## Scope
This phase focused on making the public website more controlled by the admin panel and more suitable for local full integration testing.

## Completed

- Added centralized public settings helpers in `public_site/src/shared/public/settings-utils.ts`.
- Connected public website metadata to admin settings:
  - site name
  - SEO title
  - SEO description
  - favicon
- Added settings-aware public contact band on the home page:
  - email
  - phone
  - WhatsApp
  - address
- Added admin-controlled visibility for public home sections:
  - build
  - composition
  - architecture
  - why
  - process
  - technologies
  - services
  - products
  - portfolio
  - blog
  - testimonials
  - faqs
  - final CTA
- Added admin-controlled visibility to public dynamic navigation and list routes.
- Added public maintenance mode rendering from admin settings.
- Added localized maintenance messages from admin settings.
- Added admin UI controls for:
  - English version toggle
  - maintenance mode
  - maintenance messages
  - social links
  - visible home sections
- Updated sitemap generation to respect:
  - disabled English version
  - hidden sections
  - existing dynamic content
- Updated manifest generation to use admin-controlled site identity when available.
- Fixed an existing public-site lint warning caused by an unused `AppBadge` import.

## Validation

- Backend Python compile: OK
- Public Site type-check: OK
- Public Site lint: OK
- Admin Panel type-check: OK
- Admin Panel lint: OK
- Public Site build: compiled successfully, then the local container timed out during `Collecting page data` with an EPIPE after compilation. This should be re-tested locally on the developer machine.

## Recommended local tests

1. Admin > Settings:
   - change site name
   - change SEO title/description
   - add contact data
   - add social links
   - disable a public section
   - enable maintenance mode
2. Public site:
   - verify navbar/footer identity
   - verify contact band appears on home
   - verify hidden sections disappear
   - verify hidden dynamic sections disappear from nav
   - verify `/services`, `/products`, `/portfolio`, `/blog` show coming soon if disabled
   - verify `/en` returns not found if English is disabled
   - verify maintenance mode replaces public content
3. SEO:
   - inspect metadata
   - inspect `/sitemap.xml`
   - inspect `/manifest.webmanifest`
