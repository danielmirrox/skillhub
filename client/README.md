# Client - SkillHub

Frontend foundation for Block 1 (Denis scope): React + Vite + Tailwind + routing + auth-check.

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
```

If `VITE_API_URL` is not set, app uses `http://localhost:5000`.

## Implemented in Block 1

- Router with `/`, `/login`, `/dashboard`, `/search`, `/users/:id`, `/applications`
- Protected `/dashboard` route
- Auth check via `GET /api/v1/auth/me` with cookies (`credentials: include`)
- Login button currently uses a demo stub so the rest of the UI can be tested without GitHub OAuth
- Demo auth persists in localStorage and pushes the app into `/dashboard`
- Search page uses `GET /api/v1/users` with filters for role, grade, minRating and stack
- Public user detail page uses `GET /api/v1/users/:id` and respects PRO visibility
- Applications page uses `GET /api/v1/applications` and allows accept/decline for incoming items
- User detail page can send an application with a team picker modal
- Profile page can promote the current demo user to PRO via `POST /api/v1/profile/pro`
- Profile edit page supports GitHub import preview and can post `githubData` to `POST /api/v1/profile/import-github`
- Basic app layout and dashboard placeholder
