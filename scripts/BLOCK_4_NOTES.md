# Block 4 Notes (Deni)

## Date
2026-03-21

## Implemented
- Added SQL helper migration: scripts/teams-applications-migration.sql
- Added E2E runbook: scripts/check-block4-applications.md
- Added demo PRO endpoint: POST /api/v1/auth/pro/upgrade

## E2E verification summary
- PRO activation: success=true
- auth/me after upgrade: isPro=true, proExpiresAt is set
- teams list count: 3
- applications outgoing (applicant): visible
- applications incoming (captain): visible
- PATCH accepted: works, status updated to accepted

## Important observation
- POST /applications returned 409 APPLICATION_ALREADY_EXISTS for repeated create attempt.
- This is expected behavior because seed already has application for that team/user pair.

## Risks
- In-memory demo store resets after server restart.
- Repeated application creation for the same pair always returns 409 due to UNIQUE behavior.
- PRO endpoint is a demo stub and does not include payment flow.

## Next step
- Block 5: GitHub import hardening and deployment checklist.
