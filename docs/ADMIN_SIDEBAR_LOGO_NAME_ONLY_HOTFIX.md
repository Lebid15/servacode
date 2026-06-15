# Admin Sidebar Logo + Name Only Hotfix

This hotfix simplifies the admin sidebar brand card.

## Change

- The sidebar brand card now shows only:
  - uploaded company logo
  - company name from backend settings
- It no longer shows the long company description under the name.
- The brand still reads from `/public/settings`, so Arabic shows `سيرفا كود` and English shows `ServaCode`.

## Files

- `admin_panel/src/shared/design-system/layout/AdminShell.tsx`
- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
- `admin_panel/src/shared/api/auth-client.ts`
