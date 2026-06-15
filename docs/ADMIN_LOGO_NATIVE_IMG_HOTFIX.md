# Admin Logo Native Image Hotfix

This hotfix fixes uploaded logos/icons not appearing on the admin login screen.

## Root cause

The backend returns logo paths as relative URLs such as:

```text
/uploads/2026/06/logo.png
```

The admin panel runs on port `3001`, while uploaded files are served by the backend on port `8000`.

So the frontend must convert the relative URL into:

```text
http://127.0.0.1:8000/uploads/2026/06/logo.png
```

## Fix

- Converts `/uploads/...` and `/media/...` into full backend URLs.
- Uses a native `<img>` tag instead of Next.js `<Image>` to avoid remote image configuration issues.
- Keeps the logo inside a true circular frame.
- Shows a circular fallback icon only if the uploaded image is missing or broken.

## File

- `admin_panel/src/shared/design-system/components/AppLogo.tsx`
