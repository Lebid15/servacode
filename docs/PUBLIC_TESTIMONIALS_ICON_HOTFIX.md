# Public Testimonials Icon Hotfix

This hotfix fixes the runtime error on `/ar/testimonials`.

## Root cause

The testimonials page used icon names such as:

- `testimonials`
- `star`

But the public website `AppIcon` map did not include these names, so React tried to render `undefined`.

## Fix

- Added `star`
- Added `testimonials`
- Added `quote`
- Added `messages`
- Added a safe fallback inside `AppIcon` so the public site does not crash if an unknown icon name is used in the future.

## Files

- `public_site/src/shared/design-system/components/AppIcon.tsx`
- `public_site/src/app/[locale]/(public)/testimonials/page.tsx`
- `public_site/src/app/[locale]/(public)/page.tsx`
