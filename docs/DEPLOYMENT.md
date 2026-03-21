# SkillHub — Deployment Notes

## Recommendation

For the current state of the project, deploy **without Docker Compose in production** and use managed services instead:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Yandex Cloud
- Database: managed PostgreSQL

This keeps the deployment path shorter and reduces container/debug overhead during the hackathon.

## When Compose is useful

Use Docker Compose only for **local reproducible development** if the team wants one command to start:

- PostgreSQL
- Backend API
- optionally frontend preview

Compose is helpful for onboarding and demos, but it is not required for the production path.

## Why not Compose for production

- Adds an extra container layer to debug
- Can complicate OAuth callback and cookie origin handling
- Managed Postgres is simpler for backups, SSL, and uptime
- Frontend hosting platforms already solve static deploy better than a container does

## Required env for deploy

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `YANDEXGPT_API_KEY` or `YANDEXGPT_IAM_TOKEN` or `YANDEXGPT_SA_KEY_PATH`
- `YANDEXGPT_FOLDER_ID` or `YANDEXGPT_MODEL_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLIENT_URLS` if there are extra allowed origins

## Checklist before deploy

- Healthcheck returns `ok`
- GitHub OAuth callback URL matches the deployed API URL
- Frontend origin is listed in `CLIENT_URL`
- CORS allowlist includes the frontend domain
- Database migrations are applied
- YandexGPT credentials are present via API key, IAM token, or service-account JSON
- Session cookie is `HttpOnly` and `Secure` in production
