# SkillHub API Reference

## Auth

- `GET /api/v1/auth/github`
- `GET /api/v1/auth/github/callback`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

## Profile

- `GET /api/v1/profile`
- `PUT /api/v1/profile`
- `POST /api/v1/profile/import-github`
- `POST /api/v1/profile/score`
- `POST /api/v1/profile/pro`

## Users

- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `GET /api/v1/users/favorites`
- `POST /api/v1/users/:id/favorite`
- `POST /api/v1/users/:id/vote`

## Teams

- `GET /api/v1/teams`
- `GET /api/v1/teams/:teamId`
- `POST /api/v1/teams`
- `PUT /api/v1/teams/:teamId`
- `DELETE /api/v1/teams/:teamId/members/:userId`

## Applications

- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `PATCH /api/v1/applications/:id`

## Behavioral notes

- closed teams are hidden from the public feed
- full teams reject new applications with a clear server-side conflict
- accepted applications reduce available slots
- removing a member from a team restores a slot

