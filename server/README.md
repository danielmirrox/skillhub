# SkillHub Server

Backend API for the SkillHub hackathon product.

## Local start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example`.
3. Start the server:

   ```bash
   npm run dev
   ```

## Defaults for local development

- If no auth header is provided in development, the API falls back to the demo viewer `user-daniel`.
- To test other demo identities, pass `X-Demo-User-Id: user-denis`, `user-deni`, or `user-captain`.
- Public profile and team responses are backed by the in-memory demo store for now; PostgreSQL schema is in `sql/schema.sql`.
- Local dev CORS accepts `localhost` and `127.0.0.1` origins on any port, so the frontend can run on a free port.
- For production, set `CLIENT_URL` to the main frontend origin and optionally add more origins in `CLIENT_URLS` as a comma-separated allowlist.

## Main routes

- `GET /health`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/github` and `GET /api/v1/auth/github/callback` are demo placeholders for the OAuth flow
- `GET /api/v1/profile`
- `GET /api/v1/profile/score/history`
- `GET /api/v1/profile/score/status/:jobId`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `GET /api/v1/teams`
- `GET /api/v1/applications`

## Environment

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `YANDEXGPT_API_KEY`
- `CLIENT_URLS` (optional comma-separated extra frontend origins)
