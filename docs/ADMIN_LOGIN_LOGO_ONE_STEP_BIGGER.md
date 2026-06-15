# Admin Login Logo One Step Bigger

This hotfix makes the uploaded logo one step larger inside the circular frame on the admin login screen.

## Change

- Reduced image padding from `p-1 sm:p-1.5` to `p-0.5 sm:p-1`.
- Keeps the logo circular.
- Does not change text, card size, layout, or backend logic.

## File

- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
