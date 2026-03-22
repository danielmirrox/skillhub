# SkillHub Features and Behavior

## Profile

- manual profile editing covers role, grade, stack, bio, links, experience, and hackathon count
- GitHub import can prefill stack and project hints
- GitHub avatars are preferred when available
- fallback avatars are used everywhere else, so the UI never shows an empty image

## Rating and recommendations

- the profile can be scored by YandexGPT
- the rating is persisted and reused on the profile page
- recommendations and strengths are hidden from free viewers where appropriate

## Discovery

- search supports filters for role, stack, grade, and rating
- participant cards support favorites and votes
- public profile pages explain who is visible and why

## Teams

- captains can create and edit teams
- captains can remove members
- captains can close recruitment
- closed teams remain manageable for the captain but stop accepting new joins
- accepted applications and team slots stay in sync

## Applications

- applications are the single path to joining a team
- incoming and outgoing applications are both visible to the user
- the UI surfaces closed/full states instead of silently failing

