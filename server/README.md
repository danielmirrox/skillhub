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

- If no real session is present, the API can still resolve a demo viewer by `X-Demo-User-Id` or the demo buttons in the client.
- GitHub OAuth issues a signed `skillhub.session` cookie on callback and validates OAuth `state`.
- If `DATABASE_URL` is set, the server boots PostgreSQL from `sql/schema.sql` and hydrates the demo store from the database.
- If the database is unavailable, the server logs a warning and falls back to in-memory demo data instead of crashing.
- Local dev CORS accepts `localhost` and `127.0.0.1` origins on any port, so the frontend can run on a free port.
- For production, set `CLIENT_URL` to the main frontend origin and optionally add more origins in `CLIENT_URLS` as a comma-separated allowlist.
- `GET /health` reports database, GitHub OAuth, and YandexGPT readiness.

## Main routes

- `GET /health`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/github` and `GET /api/v1/auth/github/callback` run the GitHub OAuth flow
- `GET /api/v1/profile`
- `POST /api/v1/profile/pro`
- `POST /api/v1/profile/import-github`
- `GET /api/v1/profile/score/history`
- `GET /api/v1/profile/score/status/:jobId`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `GET /api/v1/teams`
- `GET /api/v1/teams/:teamId`
- `POST /api/v1/teams`
- `PUT /api/v1/teams/:teamId`
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `PATCH /api/v1/applications/:id`

## Environment

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `YANDEXGPT_API_KEY`
- `YANDEXGPT_FOLDER_ID`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `CLIENT_URLS` (optional comma-separated extra frontend origins)
- `LOG_LEVEL`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
