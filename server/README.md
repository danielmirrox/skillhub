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

## Main routes

- `GET /health`
- `GET /api/v1/auth/me`
- `GET /api/v1/profile`
- `GET /api/v1/users`
- `GET /api/v1/teams`
- `GET /api/v1/applications`

## Environment

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `YANDEXGPT_API_KEY`
