# Admin Login Branding Fallback Hotfix

This hotfix fixes cases where the admin login screen displays a circular fallback icon even though a site icon/logo has been uploaded.

## Cause

Different backend versions/settings serializers may expose the uploaded identity image using different field names:

- `logo_url`
- `favicon_url`
- `site_icon_url`
- `icon_url`
- `brand_icon_url`

The login screen was only checking a limited set of fields.

## Fix

The admin login screen now tries all supported branding image fields in this order:

1. `logo_url`
2. `favicon_url`
3. `site_icon_url`
4. `icon_url`
5. `brand_icon_url`

The logo container remains circular and still falls back to a professional circular icon if the image link is missing or broken.

## Files

- `admin_panel/src/shared/api/auth-client.ts`
- `admin_panel/src/app/[locale]/admin/login/AdminLoginPage.tsx`
- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
