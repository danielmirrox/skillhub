# SkillHub — Deployment on VM with Docker Compose

This note describes the recommended deployment path when the project is hosted on a single virtual machine.

## Recommended stack

- `nginx` or `caddy` as the public entry point
- `backend` API container
- `postgres` container with a persistent volume
- optional `frontend` static files served by `nginx`

## Why Compose on a VM

- one command starts the whole stack
- easier to reproduce the same environment locally and on the server
- simpler Postgres setup than manual installation
- easier to restart, inspect logs, and move between environments

## Suggested layout

```text
/opt/skillhub
├── docker-compose.yml
├── .env
├── nginx/
│   └── default.conf
└── data/
    └── postgres/
```

## Services

### 1. postgres

- use a named volume or bind mount for data persistence
- do not expose port `5432` to the public internet
- keep credentials only in `.env`

### 2. backend

- build from the `server/` folder
- pass `DATABASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `YANDEXGPT_API_KEY`, `YANDEXGPT_FOLDER_ID`, `JWT_SECRET`, `CLIENT_URL`
- expose only the internal app port to the compose network

### 3. frontend

- either serve the built static assets with `nginx`
- or keep the frontend external if you want a simpler production setup

### 4. nginx

- terminate HTTPS
- proxy `/api/v1` to backend
- serve the frontend app
- redirect all unknown routes to `index.html` for SPA routing

## Example environment variables

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://skillhub_user:strong_password@postgres:5432/skillhub
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=https://api.example.com/api/v1/auth/github/callback
YANDEXGPT_API_KEY=...
YANDEXGPT_FOLDER_ID=...
JWT_SECRET=long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://skillhub.example.com
CLIENT_URLS=https://www.skillhub.example.com
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment flow

1. Prepare the VM.
2. Install Docker and Docker Compose.
3. Copy the repo to `/opt/skillhub`.
4. Create `.env`.
5. Build the frontend.
6. Start the stack with `docker compose up -d --build`.
7. Check `GET /health`.
8. Test GitHub OAuth callback.
9. Test profile loading, search, teams, and applications.

## Operational checklist

- `DATABASE_URL` points to the `postgres` service inside Compose.
- `CLIENT_URL` matches the public frontend origin.
- `GITHUB_CALLBACK_URL` matches the public backend URL.
- `skillhub.session` cookie is `HttpOnly`.
- `Secure` cookies are enabled if HTTPS is used.
- Postgres data is persisted across restarts.
- Logs are readable via `docker compose logs -f`.

## Useful commands

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
docker compose logs -f postgres
docker compose down
docker compose down -v
```

## Notes

- Keep the public port only on `nginx`.
- Do not publish Postgres to the internet.
- If you want the simplest production path, keep frontend and backend separate and use Compose only for backend + Postgres.
