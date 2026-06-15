# Phase 15.13.1 — Communication Icon Hotfix

Fixes a runtime crash in the admin communication section.

## Problem
`AdminCommunicationTabs` used `icon: "message"`, but `AppIcon` did not define an icon with that key. This caused React to render `undefined` as a component and crash with:

`Element type is invalid... Check the render method of AppIcon.`

## Fix
- Changed the communication overview tab icon from `message` to the existing `messages` icon.
- Added a safe fallback inside `AppIcon` so an unknown icon key will not crash the entire admin panel.

## Files
- `admin_panel/src/shared/admin/components/AdminCommunicationTabs.tsx`
- `admin_panel/src/shared/design-system/components/AppIcon.tsx`
