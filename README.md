# SkillHub

SkillHub is a hackathon matchmaking platform for participants and teams.
The product helps users find teammates, evaluate skill fit, share profiles, and manage team applications.

## Project Overview

- AI-based skill scoring for participant profiles
- participant search with filters by role, stack, grade, and rating
- team feed with team detail pages and application workflow
- GitHub OAuth login
- PostgreSQL-backed data model with seed data for demo and smoke testing
- YandexGPT integration for profile scoring
- PRO mode with expanded visibility and profile insights

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: GitHub OAuth, signed session cookies, demo fallback for local development
- AI: YandexGPT

## Repository Structure

| Path | Responsibility |
|------|----------------|
| `client/` | Frontend application, UI, routing, and API integration |
| `server/` | Backend API, authentication, scoring, and database integration |
| `scripts/` | Seed data, smoke tests, and maintenance scripts |
| `docs/` | Product specification, plans, deployment notes, and checklists |

## Team and Responsibilities

| Author | Zone of Responsibility |
|--------|------------------------|
| Даниэл | Backend, PostgreSQL, GitHub OAuth, YandexGPT, deployment and stability |
| Денис | Frontend, layout, routing, search, profile and team screens |
| Дени | Seed data, smoke tests, scripts, documentation support, presentation materials |

## Current Status

- Core product flows are implemented: login, profile, search, teams, and applications
- Backend can work with PostgreSQL when `DATABASE_URL` is provided
- If the database is unavailable, the server can fall back to in-memory demo data for local development
- GitHub OAuth is wired into the backend
- YandexGPT is wired into profile scoring
- Documentation and smoke tests are maintained in `docs/` and `scripts/`

## Local Development

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Backend

Create `server/.env` based on `server/.env.example`.

Important variables:

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `YANDEXGPT_SA_KEY_PATH`, `YANDEXGPT_IAM_TOKEN`, or `YANDEXGPT_API_KEY`
- `YANDEXGPT_MODEL_URI` or `YANDEXGPT_FOLDER_ID`
- `YANDEXGPT_LLM_ENDPOINT`
- `JWT_SECRET`
- `CLIENT_URL`

### Frontend

If the backend is not running on `http://localhost:5000`, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## API Notes

- All backend routes are exposed under `/api/v1`
- GitHub login starts at `/api/v1/auth/github`
- Profile data is available via `/api/v1/profile` and `/api/v1/auth/me`
- Search and teams are available through `/api/v1/users` and `/api/v1/teams`

## Documentation

Full project documentation is stored in `docs/`.

Recommended starting points:

- `docs/PRODUCT_SPEC_FULL.md`
- `docs/HAKATHON_30H_PLAN_V2.md`
- `docs/CHECKLISTS_BY_MEMBER.md`
- `docs/DEPLOYMENT.md`
- `docs/DEPLOYMENT_COMPOSE.md`

## Testing

- smoke tests: `cd server && npm run smoke`
- seed and maintenance utilities: `scripts/`

## Notes

- Demo flow is kept for local development and smoke testing.
- For production or defense, use the real GitHub OAuth flow and a configured PostgreSQL instance.
- If you change environment variables, deployment settings, or schema, update the corresponding files in `docs/` and `server/.env.example`.
