# GitHub Import Release Plan

## Goal
Turn the current GitHub import helper into a real user flow that is launched manually from the profile page, uses GitHub OAuth/open data, and keeps a visible connection/import status.

## Recommended data set
- User profile data: GitHub username, display name, avatar, bio, githubUrl.
- Public repositories: repo list, names, descriptions, primary languages.
- Repository quality signals: stars and forks.
- Social signal: followers.
- Aggregated activity: last activity / recency buckets, not raw event streams.
- Later v2 candidate: commit statistics, but not in the first release.

## Current state
- GitHub import is now button-led on the profile edit page.
- Manual JSON fallback exists only as a dev/smoke path.
- Server accepts `githubData`, can fetch open GitHub REST API data from `githubUrl`, and returns import metadata.
- `githubData` is persisted and now feeds scoring / AI hints with richer GitHub signals.
- GitHub OAuth still exists for login, but import stays separate and profile-driven in this release.

## Product rules
- Import starts only by button click.
- Manual JSON fallback is kept only for dev/smoke.
- No private repos, background sync, or silent profile overwrites in the first release.
- UI must show a GitHub connection/import status.

## Release scope
1. Show why connecting GitHub helps: it improves stack, project, and recommendation quality.
2. Add a clear GitHub import button in the profile flow and use open GitHub REST data to fetch recommended profile signals.
3. Persist fetched `githubData`, refresh suggestions, and show import status and last update state in the UI.
4. Keep manual JSON as dev/smoke fallback only.

## Implementation stages
### Stage 1. UX and contract
- Redesign the profile edit import block.
- Define import status states: idle, ready, importing, success, error.
- Keep a visible connection/import status near the profile and/or import block.

### Stage 2. Backend import flow
- Add or extend an endpoint for button-triggered GitHub fetch.
- Reuse open GitHub REST data and store it in `githubData`.
- Collect profile data, public repos, stars/forks, followers, and aggregated activity recency.
- Return suggestions and explicit metadata about the import result.

### Stage 3. Persistence and scoring
- Save imported GitHub data in the profile store/database.
- Make sure scoring and AI hints read the latest imported data.
- Use public repo signals, stars/forks, followers, and recency as the main recommendation inputs.
- Avoid overwriting manual profile fields unless explicitly intended.

### Stage 4. Fallbacks and safety
- Preserve manual JSON import for dev/smoke only.
- Keep private data out of the first version.
- Make repeated imports idempotent and predictable.

### Stage 5. Validation
- Test button-triggered import end to end.
- Test the dev/smoke fallback.
- Test that the status changes correctly and the profile data stays stable.

## Out of scope for the first release
- Private repositories
- Background sync / webhooks
- Auto-import right after OAuth login
- Long-lived token management for secondary flows
- Raw commit history statistics as a primary signal

## Success criteria
- A user can click one button and import GitHub data into the profile.
- The UI clearly shows whether GitHub is connected or imported.
- Imported data improves profile suggestions and scoring using the recommended data set.
- Manual JSON remains only a dev/smoke path.
