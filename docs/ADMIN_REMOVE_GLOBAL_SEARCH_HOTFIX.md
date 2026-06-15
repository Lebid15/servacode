# Admin Remove Global Search Hotfix

This hotfix removes the global quick-search input from the admin topbar.

## Why

The search box was not necessary for the current admin workflow and cluttered the interface.

## Changes

- Removed `QuickSearch` component from `AdminShell`.
- Removed the search input from the admin topbar.
- Removed related keyboard shortcut and state logic.
- Kept the remaining topbar actions intact.

## Files

- `admin_panel/src/shared/design-system/layout/AdminShell.tsx`
- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
- `admin_panel/src/shared/api/auth-client.ts`
