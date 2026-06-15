# Admin Login Circular Logo Hotfix

This hotfix ensures the admin login logo is always displayed inside a true circular frame.

## Changes
- Forces the logo container to use `rounded-full`.
- Keeps the uploaded logo inside the circle with `object-contain`.
- Adds a professional circular fallback icon if the logo URL is missing or broken.
- Prevents broken image icons from appearing on the login screen.

## File
- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
