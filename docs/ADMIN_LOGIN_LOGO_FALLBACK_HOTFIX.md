# Admin Login Logo Fallback Hotfix

This hotfix prevents the admin login screen from showing a broken image icon when the configured logo or favicon URL is missing or invalid.

## Changes
- Adds a safe fallback icon inside `AppLogo`.
- Resets image error state when the logo URL changes.
- Uses `unoptimized` for local/backend-served assets during development.
- Keeps the logo image inside the circle with safe scaling.

## File
- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
