# Client - SkillHub

Frontend foundation for Block 1 (Denis scope): React + Vite + Tailwind + routing + auth-check.

## Run locally

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Environment

Create `client/.env` when backend runs on another host/port:

```env
VITE_API_URL=http://localhost:5000
```

If `VITE_API_URL` is not set, app uses `http://localhost:5000`.

## Implemented in Block 1

- Router with `/`, `/login`, `/dashboard`
- Protected `/dashboard` route
- Auth check via `GET /auth/me` with cookies (`credentials: include`)
- Login button that redirects to `${API_BASE_URL}/auth/github`
- Basic app layout and dashboard placeholder
