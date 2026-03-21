# Block 3 Notes (Deni)

## Date
2026-03-21

## Checks completed
- Seed dataset connected via scripts/seed.js
- Base users feed: GET /api/v1/users
- Filters: role, grade, minRating, stack
- Pagination: page, limit

## Validation summary
- total users: 16
- roles: backend, design, frontend, fullstack, ml, mobile, other
- rating range: 45-92
- backend count: 5
- middle grade count: 8
- minRating=70 count: 12
- stack=TypeScript count: 3
- pagination: page1(limit=5)=5, page2(limit=5)=5

## Observations
- Feed now has enough diversity for demo cards and filters.
- Demo user IDs used in previous scripts (user-daniel, user-denis, user-deni, user-captain) are preserved.
- Seed also includes teams, team members, and sample applications for next steps.

## Risks
- Seed is demo/in-memory; data is reset on server restart.
- Stack filtering is exact-token based; similar labels (TypeScript vs TS) are not matched automatically.
- Scores are seeded constants; they do not represent live AI scoring outputs.

## Next step
- Move to Block 4: validate applications flow end-to-end with incoming/outgoing updates.
