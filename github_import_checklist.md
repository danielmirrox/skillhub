# GitHub Import Checklist

## Branch / setup
- [x] Create a dedicated branch for GitHub import work.
- [ ] Keep the new docs untracked until the user explicitly asks to stage them.

## Product decisions
- [x] Import starts only on button click.
- [x] Manual JSON fallback is limited to dev/smoke.
- [x] Show a clear GitHub connection/import status.
- [x] Do not auto-run import on OAuth login in this release.
- [x] Recommended data set is profile data, public repos, stars/forks, followers, and aggregated activity.
- [x] Commit statistics are postponed to v2.

## UX
1. [x] Replace the manual JSON-first explanation with a button-led flow and a short benefit message.
2. [x] Add a visible import progress state.
3. [x] Show success / error feedback without shifting the rest of the UI.
4. [x] Add a status label for GitHub connection/import.

## Backend
1. [x] Define the button-triggered import contract.
2. [x] Reuse open GitHub REST data to build profile suggestions.
3. [x] Collect profile data, public repos, stars/forks, followers, and aggregated activity recency.
4. [x] Persist `githubData` after import.
5. [x] Return explicit metadata about what was imported.

## Data / safety
1. [x] Keep private repositories out of scope.
2. [x] Avoid silent overwrites of manually edited profile fields.
3. [x] Make repeated import predictable and idempotent.
4. [x] Keep dev/smoke fallback available and isolated.
5. [x] Avoid raw activity feeds; only store aggregated activity signals.
6. [x] Do not add commit statistics to the first release.

## Scoring / suggestions
1. [x] Ensure imported GitHub data affects scoring and AI hints.
2. [x] Confirm the latest imported data is used after profile refresh.
3. [x] Use public repos, stars/forks, followers, and activity recency as the main recommendation inputs.

## Validation
1. [x] Button-driven import works end to end.
2. [x] Dev/smoke fallback still works.
3. [x] Status changes are visible and stable.
4. [ ] No unexpected UI layout shifts appear on import errors.
