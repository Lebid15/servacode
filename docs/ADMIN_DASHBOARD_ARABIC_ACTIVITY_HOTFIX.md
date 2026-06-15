# Admin Dashboard Arabic Activity Hotfix

This hotfix prevents internal technical action codes from appearing in the admin dashboard.

## Fixed

Before:
- `settings_change`

After:
- Arabic: `تعديل الإعدادات`
- English: `Settings updated`

## Scope

- Latest Activity section in the admin dashboard.
- Action badges and activity descriptions.

## File

- `admin_panel/src/shared/admin/components/AdminDashboardLive.tsx`
