# SkillHub

SkillHub — платформа для мэтчинга участников и команд на хакатоне.
Проект помогает находить тиммейтов, оценивать соответствие по скиллам, шарить профили и управлять заявками в команды.
Проект сделан для хакатона «Идея. Код. Релиз» от IT-сообщества МГУ Viribus Unitis.

## Обзор проекта

- AI-скоринг навыков для профилей участников
- поиск участников с фильтрами по роли, стеку, грейду и рейтингу
- лента команд, страницы команд и сценарий заявок
- избранное, голоса и быстрый переход в публичные профили участников
- закрытие набора в командах, удаление участников капитаном и защита от переполнения
- GitHub OAuth с аватаром из профиля и аккуратным fallback-аватаром
- вход через GitHub OAuth
- модель данных на PostgreSQL с seed-данными для демо и smoke-проверок
- интеграция с YandexGPT для оценки профиля
- PRO-режим с расширенной видимостью и инсайтами по профилю

## Технологический стек

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Node.js, Express
- База данных: PostgreSQL
- Авторизация: GitHub OAuth, подписанные session cookies, demo fallback для локальной разработки
- AI: YandexGPT

## Структура репозитория

| Путь | Зона ответственности |
|------|----------------|
| `client/` | Frontend-приложение, UI, роутинг и интеграция с API |
| `server/` | Backend API, авторизация, скоринг и интеграция с данными |
| `scripts/` | Seed-данные, smoke-тесты и служебные скрипты |
| `docs/` | Спецификация продукта, планы, заметки по деплою и чеклисты |

## Команда и зоны ответственности

| Автор | Зона ответственности |
|--------|------------------------|
| Даниэл | Backend, YandexGPT, деплой и стабильность |
| Денис | Frontend, layout, роутинг, поиск, профиль и экраны команд |
| Дени | Seed data, smoke tests, scripts, documentation support, presentation materials, PostgreSQL, GitHub OAuth |

## Текущий статус

- Основные продуктовые флоу реализованы: login, profile, search, teams и applications
- Backend может работать с PostgreSQL, если задан `DATABASE_URL`
- Если база недоступна, сервер может перейти на in-memory demo data для локальной разработки
- GitHub OAuth подключён к backend
- GitHub-аватар и fallback-картинка работают одинаково в API и UI
- GitHub-импорт фильтрует мусорные ссылки и profile README
- Команды поддерживают закрытие набора, удаление участников и контроль свободных слотов
- Избранное и голосование за участников доступны в поиске
- YandexGPT подключён к скорингу профиля
- Для VM предусмотрен `docker compose`-путь с Postgres, backend и фронтендом через nginx
- Документация и smoke-тесты поддерживаются в `docs/` и `scripts/`

## Локальная разработка

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

## Переменные окружения

### Backend

Создай `server/.env` по примеру из `server/.env.example`.

Важные переменные:

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `YANDEXGPT_SA_KEY_PATH`, `YANDEXGPT_IAM_TOKEN` или `YANDEXGPT_API_KEY`
- `YANDEXGPT_MODEL_URI` или `YANDEXGPT_FOLDER_ID`
- `YANDEXGPT_LLM_ENDPOINT`
- `JWT_SECRET`
- `CLIENT_URL`
- `COOKIE_SECURE` для включения secure-cookie режима на HTTPS

### Frontend

Если backend работает не на `http://localhost:5000`, создай `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_DEMO_AUTH=true
```

`VITE_ENABLE_DEMO_AUTH=true` нужен только для локальной разработки и smoke-сборки. В production его не включают.

### Deployment on VM

Для запуска на одной виртуальной машине смотри [docs/DEPLOYMENT_COMPOSE.md](./docs/DEPLOYMENT_COMPOSE.md).
Там описан `docker compose`-путь с PostgreSQL, backend и nginx-контейнером для фронтенда.

## Примечания по API

- Все backend-маршруты доступны под префиксом `/api/v1`
- Вход через GitHub стартует с `/api/v1/auth/github`
- Данные профиля доступны через `/api/v1/profile` и `/api/v1/auth/me`
- Поиск и команды доступны через `/api/v1/users` и `/api/v1/teams`

## Документация

Полная документация проекта лежит в `docs/`.

Рекомендуемые точки входа:

- `docs/PRODUCT_SPEC_FULL.md`
- `docs/IMPLEMENTATION_NOTES.md`
- `docs/HAKATHON_30H_PLAN_V2.md`
- `docs/CHECKLISTS_BY_MEMBER.md`
- `docs/JURY_HANDOFF.md`
- `docs/DEPLOYMENT_SSH.md`
- `docs/DEPLOYMENT.md`
- `docs/DEPLOYMENT_COMPOSE.md`

## Тестирование

- smoke-тесты: `cd server && npm run smoke`
- seed и служебные утилиты: `scripts/`
