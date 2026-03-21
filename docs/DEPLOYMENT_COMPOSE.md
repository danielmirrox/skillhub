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
- pass `DATABASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `YANDEXGPT_SA_KEY_PATH` or `YANDEXGPT_IAM_TOKEN` or `YANDEXGPT_API_KEY`, `YANDEXGPT_MODEL_URI` or `YANDEXGPT_FOLDER_ID`, `YANDEXGPT_LLM_ENDPOINT`, `JWT_SECRET`, `CLIENT_URL`
- expose only the internal app port to the compose network

### YandexGPT auth

- preferred path: mount the service-account JSON into the backend container and point `YANDEXGPT_SA_KEY_PATH` to that file
- optional fallback: use a pre-generated `YANDEXGPT_IAM_TOKEN`
- legacy fallback: use `YANDEXGPT_API_KEY` only if that is what the current Yandex setup provides
- set `YANDEXGPT_MODEL_URI` explicitly when possible, for example `gpt://<folder_id>/yandexgpt-4-lite/latest`
- keep `YANDEXGPT_LLM_ENDPOINT` on the completion endpoint used by the backend

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
YANDEXGPT_SA_KEY_PATH=/run/secrets/yandex-service-account.json
YANDEXGPT_MODEL_URI=gpt://b1gcdrk0le310t723e9o/yandexgpt-4-lite/latest
YANDEXGPT_LLM_ENDPOINT=https://llm.api.cloud.yandex.net/foundationModels/v1/completion
# Optional fallback if you already have them:
YANDEXGPT_IAM_TOKEN=...
YANDEXGPT_API_KEY=...
YANDEXGPT_FOLDER_ID=b1gcdrk0le310t723e9o
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
- `YANDEXGPT_SA_KEY_PATH` points to a mounted service-account JSON file, or `YANDEXGPT_IAM_TOKEN` / `YANDEXGPT_API_KEY` are present as fallback.
- `YANDEXGPT_MODEL_URI` matches the real Yandex model URI, or `YANDEXGPT_FOLDER_ID` plus `YANDEXGPT_MODEL` can build it.
- `YANDEXGPT_LLM_ENDPOINT` points to the completion endpoint used by the backend.
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
