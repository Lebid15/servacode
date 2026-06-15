# Phase 15.15 — Admin Settings Closure

## Scope
Closed the Settings area as a real admin center, not only tabbed forms.

## Backend
Added:

- `GET /api/v1/admin/settings-overview`

It returns:

- Settings completion score
- Identity/contact/social/SEO/appearance/maintenance/AI/homepage readiness
- Missing setup alerts
- Active identity snapshot
- AI/system status

## Admin Panel
Added:

- `/ar/admin/settings` overview page
- `AdminSettingsOverviewPage`
- Settings overview tab in the settings group
- Settings side navigation now opens the overview center first

Existing detailed tabs remain:

- Identity
- Contact
- Social
- SEO
- Appearance
- Maintenance
- AI Assistant

## Acceptance

Open:

- `/ar/admin/settings`
- `/ar/admin/settings/identity`
- `/ar/admin/settings/contact`
- `/ar/admin/settings/social`
- `/ar/admin/settings/seo`
- `/ar/admin/settings/appearance`
- `/ar/admin/settings/maintenance`
- `/ar/admin/ai`

All routes should load and save settings without breaking the public website.
