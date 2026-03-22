# SkillHub QA Checklist

## Login and session

- GitHub OAuth starts correctly
- the auth cookie is set and the app redirects into the product
- logout clears the session

## Profile

- profile opens with the right role, grade, stack, and avatar
- edit page has a wider form area and keeps GitHub import visible
- GitHub import applies stack and project hints
- fallback avatar appears when GitHub avatar is missing

## Search and discovery

- search filters work
- favorites and votes update the UI without a full-page reset
- public profile shows the current visibility state clearly

## Teams

- captain can remove a member
- captain can close recruitment
- closed teams disappear from the public feed
- closed teams stay manageable for the captain
- joining a full or closed team is blocked with a clear message

## Applications

- incoming applications can be accepted or rejected
- accepted applications adjust slots
- closed-team applications cannot be accepted

## Build and deploy

- client build passes
- backend routes still check out
- compose stack starts without manual cleanup

