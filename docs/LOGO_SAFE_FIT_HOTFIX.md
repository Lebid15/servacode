# Logo Safe Fit Hotfix

This hotfix adjusts the website header logo image sizing by code only.

## Change
- Reduced the image scale from `scale-[1.42]` to `scale-[1.14]`.
- Added safe internal padding so the logo remains fully inside the circular frame.
- Does not modify the logo image file.
- Does not change the company name, subtitle, language button, or navbar layout.

## File
- `public_site/src/shared/design-system/components/AppLogo.tsx`
