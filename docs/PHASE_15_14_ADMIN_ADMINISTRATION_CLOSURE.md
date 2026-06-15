# Phase 15.14 — Admin Administration Closure

## Scope
This phase closes the Administration section of the admin panel.

## What changed
- Replaced the old `/admin/administration` redirect with a real administration center.
- Added backend endpoint: `GET /api/v1/admin/administration-overview`.
- Added frontend component: `AdminAdministrationOverviewPage`.
- The overview now summarizes:
  - Users
  - Active users
  - Super admins
  - Locked accounts
  - Roles
  - System/custom roles
  - Available permissions
  - Audit logs
  - Failed login attempts in the last week
- Added role distribution cards.
- Added latest audit activity.
- Added operational alerts for missing roles, missing active super admin, locked accounts, suspended accounts, and repeated failed logins.
- Updated admin release-check to assert the administration center exists.

## Acceptance checks
- `/ar/admin/administration` opens an overview page, not a redirect.
- Users, roles, audit logs, and profile links open correctly.
- Cards display real backend values.
- No invalid icon errors.
- No raw fetch calls outside the shared API client.
