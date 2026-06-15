# Phase 1 — Critical Fixes Report

## Scope
This phase focused only on critical stabilization items without changing the project architecture or business logic.

## Implemented fixes

1. Unified theme codes across backend and frontend.
   - Official theme codes are now `blue-tech` and `emerald-luxury`.
   - Frontend still accepts legacy localStorage values `dark` and `light` and maps them safely.
   - CSS supports both old and new `data-theme` values to avoid visual breakage.

2. Fixed Admin Settings theme saving.
   - Settings page now sends backend-compatible theme values.
   - Empty optional fields are normalized to `null` before saving to avoid validation errors such as empty email strings.
   - Settings page now exposes more identity fields: address, footer text, and SEO title/description.

3. Connected public website identity to backend settings.
   - Public navbar brand name reads from `/public/settings`.
   - Public footer brand, footer text, logo, contact links, and social links read from `/public/settings`.
   - Public metadata title/description uses SEO settings when available.
   - Public theme initial value reads from backend settings.
   - Public settings are fetched with `cache: "no-store"` so local QA reflects admin changes immediately.

4. Fixed missing Admin Media route.
   - Added `/admin/media` page using the existing central `AdminModulePage` and `buildMediaConfig`.
   - This prevents sidebar navigation from leading to 404.

5. Fixed nested `<main>` issue.
   - `PublicShell` no longer wraps pages with an extra `<main>` because public pages already use `<main>`.

6. Backend compatibility improvement.
   - `SiteSettingsUpdate` accepts old frontend values `dark/light` and normalizes them to `blue-tech/emerald-luxury`.

## Verification performed

- Python backend compile check passed:
  - `python -m compileall -q backend/app`
- Static import path check passed:
  - No missing `@/` imports in `public_site`.
  - No missing `@/` imports in `admin_panel`.
- Admin media page exists and resolves physically.
- No remaining frontend direct theme values in active logic except CSS compatibility aliases.

## Notes

- `npm run type-check`, `npm run lint`, and `npm run build` must be executed locally because `node_modules` is intentionally excluded from the uploaded clean ZIP.
- This phase does not implement full media upload, full blog post CRUD, users CRUD, roles UI, or production-grade migrations. Those belong to Phase 2 and Phase 3.
