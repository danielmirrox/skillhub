# Client - SkillHub

Frontend foundation for SkillHub: React + Vite + Tailwind + routing + auth-check.

## Run locally

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

If port `5173` is busy, Vite can switch to another local port.

## Environment

Create `client/.env` when backend runs on another host/port:

```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_DEMO_AUTH=true
```

If `VITE_API_URL` is not set, app uses `http://localhost:5000`.
`VITE_ENABLE_DEMO_AUTH=true` keeps the demo auth flow available for local development and smoke checks only.

## Implemented in Block 1

- Router with `/`, `/login`, `/dashboard`, `/search`, `/teams`, `/teams/:id`, `/users/:id`, `/applications`
- Protected `/dashboard` route
- Auth check via `GET /api/v1/auth/me` with cookies (`credentials: include`)
- Login screen offers real GitHub OAuth plus demo buttons for local testing
- Demo auth persists in localStorage and is used only when demo mode is explicitly enabled
- Search page uses `GET /api/v1/users` with filters for role, grade, minRating and stack
- Teams page uses `GET /api/v1/teams` with filters for hackathon, role and stack
- Team detail page uses `GET /api/v1/teams/:id` and offers a team join flow
- PRO captains get a visible boost in the teams feed; there is no separate paid teams-only paywall
- Public user detail page uses `GET /api/v1/users/:id` and respects PRO visibility
- Applications page uses `GET /api/v1/applications` and allows accept/decline for incoming items
- Applications now strictly mean joining a team
- Profile page can promote the current demo user to PRO via `POST /api/v1/profile/pro`
- Profile edit page supports GitHub import preview and can post `githubData` to `POST /api/v1/profile/import-github`
- Basic app layout and dashboard entry screen
