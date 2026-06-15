# Admin Sidebar Branding Hotfix

This hotfix fixes the admin sidebar/header branding card.

## Issues fixed

- The sidebar displayed the fallback icon instead of the uploaded logo.
- The sidebar used the static default admin name such as `Software Studio` instead of the configured site name.
- Relative backend upload URLs like `/uploads/...` were not always converted correctly in the admin logo component.

## Fix

- `AdminShell` now reads public branding settings from `/public/settings`.
- The admin brand title uses:
  - Arabic: `site_name_ar`
  - English: `site_name_en`
- The admin brand subtitle uses:
  - Arabic: `company_description_ar`
  - English: `company_description_en`
- The logo uses `logo_url` first, then falls back to `favicon_url` and other possible icon fields.
- The logo stays inside a circular frame.

## Files

- `admin_panel/src/shared/design-system/layout/AdminShell.tsx`
- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
- `admin_panel/src/shared/api/auth-client.ts`
