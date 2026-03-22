# SkillHub Deployment Guide

## Local development

Frontend:

```bash
cd client
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm run dev
```

## Docker Compose on one VM

Recommended for the demo and for simple production setup:

```bash
docker compose up -d --build
```

This starts the backend, PostgreSQL, and the web container behind nginx.

## Environment variables

Backend:

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `YANDEXGPT_SA_KEY_PATH` or `YANDEXGPT_IAM_TOKEN` or `YANDEXGPT_API_KEY`
- `YANDEXGPT_MODEL_URI` or `YANDEXGPT_FOLDER_ID`
- `YANDEXGPT_LLM_ENDPOINT`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLIENT_URLS`
- `COOKIE_SECURE`

Frontend:

- `VITE_API_URL`
- `VITE_ENABLE_DEMO_AUTH`

## Operational checklist

- database connection works
- GitHub OAuth callback matches the public backend URL
- cookies are marked secure only behind HTTPS
- `GET /health` is green
- the frontend opens from the public URL and the SPA route fallback works

