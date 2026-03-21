# SkillHub — Полная спецификация продукта

**Версия:** 1.0  
**Дата:** 21 марта 2026  
**Статус:** Спецификация для разработки MVP и пост-MVP

---

## Содержание

1. [Обзор продукта](#1-обзор-продукта)
2. [Архитектура и стек](#2-архитектура-и-стек)
3. [Схема базы данных](#3-схема-базы-данных)
4. [API Endpoints (полный список)](#4-api-endpoints)
5. [AI-скоринг: формат запроса/ответа](#5-ai-скоринг)
6. [GitHub API: парсинг профиля](#6-github-api)
7. [Структура фронтенда и экраны](#7-фронтенд)
8. [Дизайн-система](#8-дизайн-система)
9. [Пользовательские сценарии](#9-пользовательские-сценарии)
10. [Монетизация и ограничения](#10-монетизация)

---

# 1. Обзор продукта

## 1.1 Назначение

SkillHub — платформа для мэтчинга участников студенческих хакатонов с **AI-верификацией навыков**. Решает проблему «кота в мешке»: капитаны видят объективный рейтинг (0–100), а участники получают честную оценку своих навыков.

## 1.2 Основные функции

| Функция | MVP | Пост-MVP |
|---------|-----|----------|
| Авторизация GitHub | ✓ | — |
| Авторизация Telegram | — | ✓ |
| Профиль (ручной ввод) | ✓ | ✓ |
| Импорт из GitHub | — | ✓ |
| AI-скоринг (YandexGPT) | ✓ | ✓ |
| Лента участников | ✓ | ✓ |
| Лента команд (party finder) | ✓ | ✓ |
| Фильтры поиска | ✓ | ✓ |
| PRO — доступ к контактам + буст (капитаны и участники) | ✓ (эмуляция) | ✓ (оплата) |
| Отклики: «Вступить в команду» | ✓ | ✓ |
| Командные чаты | — | ✓ |
| B2B для организаторов | — | ✓ |

---

# 2. Архитектура и стек

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  React 18 + Vite + React Router + TailwindCSS + Zustand/Context  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS / REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Node.js)                         │
│  Express 4.x + CORS + Rate Limiting + Auth Middleware            │
│  Passport.js (GitHub OAuth) + JWT (optional)                     │
└───────┬─────────────────────┬─────────────────────┬─────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────────────┐
│  PostgreSQL   │   │  YandexGPT API  │   │  GitHub API (OAuth +   │
│  (Yandex     │   │  (Yandex Cloud) │   │  REST для парсинга)    │
│   Cloud)     │   │                 │   │                        │
└───────────────┘   └─────────────────┘   └───────────────────────┘
```

---

# 3. Схема базы данных

## 3.1 ER-диаграмма (упрощённо)

```
users ──┬──< profiles (1:1)
        ├──< ratings (1:N, последний активен)
        ├──< applications (как applicant в команду)
        └──< teams (как author — создатель команды)

profiles ───< profile_skills (M:N через связь)
skills (справочник)

teams ───< applications (отклики «вступить в команду»)
teams ───< team_members (M:N)
```

## 3.2 Таблицы и поля

### `users`

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Уникальный ID |
| github_id | BIGINT UNIQUE | ID из GitHub OAuth |
| telegram_id | BIGINT UNIQUE NULL | ID из Telegram (пост-MVP) |
| email | VARCHAR(255) | Из GitHub или ввод |
| username | VARCHAR(100) | Логин GitHub / @username |
| avatar_url | VARCHAR(500) | URL аватара |
| display_name | VARCHAR(150) | Имя для отображения |
| is_pro | BOOLEAN DEFAULT false | Captain PRO статус |
| pro_expires_at | TIMESTAMP NULL | До какого числа PRO |
| role | ENUM('participant','captain','both') | Роль по умолчанию |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `profiles`

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| role | ENUM('frontend','backend','fullstack','design','ml','mobile','other') | Основная роль |
| claimed_grade | ENUM('junior','middle','senior') | Заявленный грейд — пользователь выбирает сам (Junior/Middle/Senior) |
| primary_stack | TEXT[] | Массив: ['React','Node.js'] |
| experience_years | SMALLINT | Опыт в годах (0–10) |
| hackathons_count | SMALLINT | Участие в хакатонах |
| bio | TEXT | О себе (500 символов) |
| project_links | JSONB | `[{url, title, description}]` |
| telegram_username | VARCHAR(100) | @username |
| github_url | VARCHAR(500) | Ссылка на GitHub |
| github_data | JSONB | Кэш данных из GitHub API |
| is_public | BOOLEAN DEFAULT true | Показывать в ленте |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `ratings`

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | |
| profile_id | UUID FK → profiles | |
| score | SMALLINT | 0–100 |
| grade | VARCHAR(50) | "Middle Backend", "Junior Frontend" — грейд в рамках которого оценивали |
| role_label | VARCHAR(50) | "Frontend", "Backend" (legacy, можно выводить из grade) |
| strengths | TEXT[] | Сильные стороны от AI — **не показываем пользователям** |
| improvements | TEXT[] | Зоны роста от AI — **не показываем пользователям** |
| raw_response | JSONB | Полный ответ YandexGPT (для отладки) |
| created_at | TIMESTAMP | |

**Ограничение:** для Free — не чаще 1 раза в 7 дней. Проверка на уровне API.  
**Скоринг без профиля:** если профиль пустой — делаем минимальную оценку по данным GitHub (логин, репо, языки).

### `skills` (справочник)

| Поле | Тип |
|------|-----|
| id | UUID PK |
| name | VARCHAR(100) UNIQUE |
| category | VARCHAR(50) |

### `profile_skills` (M:N)

| Поле | Тип |
|------|-----|
| profile_id | UUID FK |
| skill_id | UUID FK |
| level | VARCHAR(20) — 'beginner','intermediate','advanced' |

### `teams`

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | |
| author_id | UUID FK → users | Капитан / создатель |
| name | VARCHAR(200) | Название команды |
| description | TEXT | Описание, кого ищут |
| hackathon_name | VARCHAR(200) | Название хакатона/проекта |
| required_roles | TEXT[] | Кого ищут: ['backend','frontend'] |
| min_rating | SMALLINT | Мин. рейтинг (опционально) |
| stack | TEXT[] | Стек команды |
| slots_open | SMALLINT | Сколько мест свободно |
| is_active | BOOLEAN | Активна ли команда |
| created_at | TIMESTAMP | |

### `team_members`

| Поле | Тип |
|------|-----|
| team_id | UUID FK |
| user_id | UUID FK |
| role | VARCHAR(50) |

### `applications`

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | |
| applicant_id | UUID FK → users | Кто хочет вступить |
| team_id | UUID FK → teams | В какую команду |
| message | TEXT | Короткое сообщение (опционально) |
| status | ENUM('pending','accepted','declined') | |
| created_at | TIMESTAMP | |

**Логика:** отклик = «Вступить в команду». Капитан (author команды) видит заявки, принимает/отклоняет. При принятии — показываем контакт.

---

# 4. API Endpoints

Базовый URL: `https://api.skillhub.ru/v1` (или `http://localhost:3001/api/v1`)

Аутентификация: Bearer token (сессия после OAuth) или cookie `session`.

## 4.1 Auth

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | `/auth/github` | Редирект на GitHub OAuth | — |
| GET | `/auth/github/callback` | Callback, создаёт сессию | — |
| POST | `/auth/logout` | Выход | ✓ |
| GET | `/auth/me` | Текущий пользователь | ✓ |

### Response: GET /auth/me

```json
{
  "user": {
    "id": "uuid",
    "username": "danieltgrm",
    "displayName": "Даниэл Петров",
    "avatarUrl": "https://avatars.githubusercontent.com/...",
    "email": "dan@example.com",
    "isPro": false,
    "proExpiresAt": null,
    "role": "both"
  },
  "profile": {
    "id": "uuid",
    "role": "backend",
    "primaryStack": ["Node.js", "PostgreSQL"],
    "bio": "...",
    "hasRating": true,
    "lastRatingScore": 78
  }
}
```

---

## 4.2 Profile

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | `/profile` | Свой профиль | ✓ |
| PUT | `/profile` | Обновить профиль | ✓ |
| GET | `/profile/:userId` | Публичный профиль пользователя | ✓ (частично) |
| POST | `/profile/import-github` | Импорт данных из GitHub | ✓ |
| POST | `/profile/score` | Запустить AI-скоринг | ✓ |

### Request: PUT /profile

```json
{
  "role": "backend",
  "claimedGrade": "middle",
  "primaryStack": ["Node.js", "PostgreSQL", "React"],
  "experienceYears": 2,
  "hackathonsCount": 3,
  "bio": "Студент РТУ МИРЭА, интересуюсь backend...",
  "projectLinks": [
    {
      "url": "https://github.com/user/project",
      "title": "Pet-проект",
      "description": "REST API на Express"
    }
  ],
  "telegramUsername": "danieltgrm",
  "githubUrl": "https://github.com/danieltgrm",
  "isPublic": true
}
```

### Response: GET /profile/:userId (публичный)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "displayName": "Даниэл Петров",
  "avatarUrl": "https://...",
  "role": "backend",
  "primaryStack": ["Node.js", "PostgreSQL"],
  "bio": "...",
  "projectLinks": [...],
  "rating": {
    "score": 78,
    "grade": "Middle Backend",
    "roleLabel": "Backend"
  },
  "contactVisible": false,
  "telegramUsername": null
}
```

`contactVisible` = true только если запрашивающий isPro И rating.score >= 80.

---

## 4.3 Scoring (AI)

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| POST | `/profile/score` | Запуск AI-скоринга | ✓ |
| GET | `/profile/score/status/:jobId` | Статус асинхронного скоринга (если async) | ✓ |
| GET | `/profile/score/history` | История скорингов | ✓ |

### Rate limit

- Free: 1 раз в 7 дней
- PRO: 1 раз в 24 часа (или без ограничений)

---

## 4.4 Users / Search

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | `/users` | Лента пользователей с фильтрами | ✓ |
| GET | `/users/:id` | Детали пользователя (краткие) | ✓ |

### Query: GET /users

| Параметр | Тип | Описание |
|----------|-----|----------|
| role | string | frontend, backend, fullstack, design, ml, mobile |
| grade | string | junior, middle, senior — фильтр по грейду |
| minRating | number | 0–100 |
| stack | string | Через запятую: React,Node.js |
| search | string | Поиск по bio, display_name |
| page | number | Пагинация |
| limit | number | До 20 |

### Response: GET /users

```json
{
  "items": [
    {
      "id": "uuid",
      "displayName": "Даниэл Петров",
      "avatarUrl": "https://...",
      "role": "backend",
      "primaryStack": ["Node.js", "PostgreSQL"],
      "rating": {
        "score": 78,
        "grade": "Middle Backend",
        "roleLabel": "Backend"
      },
      "contactVisible": false,
      "isPro": false
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

## 4.5 Teams

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| GET | `/teams` | Лента команд (фильтры: hackathon, role, stack) | ✓ |
| GET | `/teams/:id` | Детали команды + участники | ✓ |
| POST | `/teams` | Создать команду | ✓ |
| PUT | `/teams/:id` | Обновить команду | ✓ |

### Response: GET /teams/:id

```json
{
  "id": "uuid",
  "name": "Команда для Viribus 2026",
  "description": "Ищем backend и дизайнера...",
  "hackathonName": "Viribus Hackathon",
  "requiredRoles": ["backend", "design"],
  "stack": ["Node.js", "React"],
  "slotsOpen": 2,
  "author": { "displayName": "...", "avatarUrl": "..." },
  "members": [
    { "displayName": "...", "role": "frontend", "rating": { "score": 82 } }
  ]
}
```

---

## 4.6 Applications (вступить в команду)

| Method | Endpoint | Описание | Auth |
|--------|----------|----------|------|
| POST | `/applications` | Откликнуться на команду (вступить) | ✓ |
| GET | `/applications` | Мои отклики (входящие по моим командам / исходящие) | ✓ |
| PATCH | `/applications/:id` | Принять/отклонить (капитан) | ✓ |

### Request: POST /applications

```json
{
  "teamId": "uuid",
  "message": "Привет! Ищу команду на хакатон, интересна backend-роль."
}
```

### Response: GET /applications (после Accept — показываем контакт)

```json
{
  "incoming": [
    {
      "id": "uuid",
      "team": { "name": "...", "hackathonName": "..." },
      "applicant": { "displayName": "...", "avatarUrl": "...", "telegramUsername": "@user", "rating": { "score": 82 } },
      "message": "...",
      "status": "accepted",
      "createdAt": "2026-03-21T10:00:00Z"
    }
  ],
  "outgoing": [...]
}
```

**При статусе accepted** — в applicant показываем telegramUsername (контакт).

---

## 4.7 B2B / Organizer (пост-MVP)

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/organizer/hackathons` | Создать хакатон |
| GET | `/organizer/hackathons` | Список хакатонов |
| GET | `/organizer/hackathons/:id/stats` | Аналитика по хакатону |

---

# 5. AI-скоринг

## 5.1 Общий поток

1. Пользователь выбирает **заявленный грейд** (Junior/Middle/Senior) в профиле.
2. Пользователь нажимает «Получить рейтинг».
3. Backend собирает данные: профиль (если есть) + `github_data` (из OAuth). **Если профиль пустой** — делаем минимальную оценку по GitHub (логин, репо, языки).
4. Формируется промпт для YandexGPT — оценка **в рамках заявленного грейда** (например: «Соответствует ли кандидат уровню Middle Backend?»).
5. Ответ парсится в структурированный JSON.
6. Сохраняется в `ratings`, возвращается клиенту.

## 5.2 Входные данные для AI

Объект, который отправляется «в контекст» промпта:

```typescript
interface ScoringInput {
  role: string;           // frontend, backend, fullstack, design, ml, mobile
  claimedGrade: string;   // "junior" | "middle" | "senior" — пользователь выбрал сам
  primaryStack: string[]; // ["React", "Node.js"]
  experienceYears: number;
  hackathonsCount: number;
  bio: string;
  projectLinks: Array<{
    url: string;
    title: string;
    description: string;
  }>;
  githubData?: {
    publicRepos: number;
    followers: number;
    accountAgeYears: number;
    languages: Record<string, number>;  // {"JavaScript": 12000, "TypeScript": 5000}
    repoDescriptions: string[];
    topRepos: Array<{
      name: string;
      description: string;
      stars: number;
      primaryLanguage: string;
    }>;
  };
}
```

## 5.3 Промпт (system + user)

### System prompt

```
Ты — эксперт по оценке IT-навыков студентов для хакатонов. Кандидат сам выбрал свой заявленный грейд (Junior/Middle/Senior + роль). Твоя задача — оценить, насколько он соответствует этому грейду, по шкале 0–100.

Интерпретация балла относительно заявленного грейда:
- 0–40: Не дотягивает до заявленного грейда (переоценка себя)
- 41–60: Близко, но нестабильно соответствует
- 61–80: Соответствует заявленному грейду
- 81–100: Превосходит заявленный грейд (готов к следующему уровню)

Учитывай: заявленный стек, реальные проекты, опыт, участие в хакатонах. Будь строг: завышенная самооценка — частая проблема. Отвечай ТОЛЬКО в формате JSON.
```

### User prompt (шаблон)

```
Кандидат заявил грейд: {{claimedGrade}} {{role}} (например: Middle Backend). Оцени, насколько он соответствует этому уровню.

Роль: {{role}}
Заявленный грейд: {{claimedGrade}}
Стек: {{primaryStack.join(", ")}}
Опыт: {{experienceYears}} лет
Хакатоны: {{hackathonsCount}}
О себе: {{bio}}

Проекты:
{{#each projectLinks}}
- {{title}}: {{description}} ({{url}})
{{/each}}

{{#if githubData}}
Данные GitHub:
- Публичных репозиториев: {{githubData.publicRepos}}
- Подписчиков: {{githubData.followers}}
- Возраст аккаунта: {{githubData.accountAgeYears}} лет
- Языки (байты): {{JSON.stringify githubData.languages}}
- Топ репо: {{#each githubData.topRepos}}{{name}} ({{primaryLanguage}}, {{stars}} ⭐) — {{description}}{{/each}}
{{/if}}

Ответь СТРОГО в формате JSON:
{
  "score": <число 0-100>,
  "grade": "<Junior|Middle|Senior> <Backend|Frontend|...>",
  "roleLabel": "<Frontend|Backend|Fullstack|Design|ML|Mobile>",
  "strengths": ["<сильная сторона 1>", "<сильная сторона 2>"],
  "improvements": ["<зона роста 1>", "<зона роста 2>"]
}
```

## 5.4 Формат запроса к YandexGPT API

YandexGPT использует message-based API. Пример структуры:

```json
{
  "modelUri": "gpt://<folder_id>/yandexgpt/latest",
  "completionOptions": {
    "stream": false,
    "temperature": 0.3,
    "maxTokens": 1024
  },
  "messages": [
    {
      "role": "system",
      "text": "<system prompt>"
    },
    {
      "role": "user",
      "text": "<user prompt с данными>"
    }
  ]
}
```

**Важно:** Точный формат зависит от версии YandexGPT API. Проверьте актуальную документацию: https://cloud.yandex.ru/docs/yandexgpt/

## 5.5 Формат ответа YandexGPT (сырой)

```json
{
  "result": {
    "alternatives": [
      {
        "message": {
          "role": "assistant",
          "text": "{\"score\": 78, \"roleLabel\": \"Backend\", \"strengths\": [\"Хорошо знает Node.js\", \"Опыт с PostgreSQL\"], \"improvements\": [\"Тестирование\", \"Docker\"]}"
        },
        "status": "ALTERNATIVE_STATUS_FINAL"
      }
    ],
    "usage": {
      "inputTextTokens": "450",
      "completionTokens": "85",
      "totalTokens": "535"
    }
  }
}
```

## 5.6 Парсинг ответа

1. Взять `result.alternatives[0].message.text`.
2. Извлечь JSON из текста (модель может обернуть в ```json ... ```).
3. Валидировать: `score` 0–100, `strengths` и `improvements` — массивы строк.
4. Сохранить в БД и вернуть клиенту.

### Response: POST /profile/score

```json
{
  "rating": {
    "id": "uuid",
    "score": 78,
    "grade": "Middle Backend",
    "roleLabel": "Backend",
    "createdAt": "2026-03-21T10:05:00Z"
  },
  "nextAllowedAt": "2026-03-28T10:05:00Z"
}
```

При ошибке (лимит, AI недоступен):

```json
{
  "error": "RATING_LIMIT_EXCEEDED",
  "message": "Бесплатный скоринг доступен раз в 7 дней. Следующий: 28.03.2026",
  "nextAllowedAt": "2026-03-28T10:05:00Z"
}
```

---

# 6. GitHub API: парсинг профиля

## 6.1 Что можно получить (без токена — публичные данные)

| Endpoint | Данные | Использование |
|----------|--------|---------------|
| `GET /user` | login, name, avatar_url, bio, public_repos, followers, created_at | Базовый профиль |
| `GET /users/:username/repos` | Список репозиториев: name, description, stargazers_count, language, pushed_at | Активность, стек |
| `GET /repos/:owner/:repo/languages` | Языки и объём кода в байтах | Реальный стек |

**С токеном OAuth** — те же данные + приватные репо (если нужны).

## 6.2 Алгоритм парсинга

1. Пользователь привязал GitHub при логине → есть `github_id`, `username`.
2. Backend вызывает:
   - `GET https://api.github.com/user` (с токеном) → общая инфа
   - `GET https://api.github.com/user/repos?sort=pushed&per_page=10` → последние репо
3. Для каждого репо (первые 5):
   - `GET /repos/:owner/:repo/languages`
4. Агрегируем:
   - `languages`: сумма байт по языкам
   - `topRepos`: name, description, stars, primaryLanguage
   - `accountAgeYears`: из `created_at`
   - `publicRepos`, `followers` — как есть

## 6.3 Структура `github_data` (храним в profiles.github_data)

```json
{
  "fetchedAt": "2026-03-21T10:00:00Z",
  "publicRepos": 12,
  "followers": 5,
  "accountAgeYears": 3,
  "languages": {
    "JavaScript": 45000,
    "TypeScript": 12000,
    "Python": 3000
  },
  "topRepos": [
    {
      "name": "hackathon-project",
      "description": "REST API for hackathon",
      "stars": 2,
      "primaryLanguage": "TypeScript"
    }
  ]
}
```

## 6.4 Rate limits GitHub API

- Без токена: 60 req/hour
- С OAuth: 5000 req/hour

Рекомендация: кэшировать `github_data` на 24 часа, обновлять по кнопке «Обновить из GitHub».

## 6.5 Endpoint: POST /profile/import-github

Запрос: `{}` (всё из токена)

Ответ:

```json
{
  "success": true,
  "profile": {
    "primaryStack": ["JavaScript", "TypeScript"],
    "githubData": { ... }
  }
}
```

Логика: подтягиваем языки, топ-репо → предлагаем пользователю обновить `primaryStack` и `projectLinks`.

---

# 7. Фронтенд: структура и экраны

## 7.1 Структура папок (React + Vite)

```
src/
├── main.tsx
├── App.tsx
├── router.tsx
├── api/
│   ├── client.ts          # axios/fetch instance
│   ├── auth.ts
│   ├── profile.ts
│   ├── users.ts
│   ├── teams.ts
│   └── applications.ts
├── components/
│   ├── ui/                # Button, Input, Card, Badge, Modal
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── RatingBadge.tsx
│   │   └── RatingGauge.tsx
│   ├── search/
│   │   ├── UserCard.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── UserFeed.tsx
│   │   ├── TeamCard.tsx
│   │   └── TeamFeed.tsx
│   └── auth/
│       └── LoginButton.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── ProfileEditPage.tsx
│   ├── SearchPage.tsx
│   ├── TeamsPage.tsx
│   ├── TeamDetailPage.tsx
│   ├── UserDetailPage.tsx
│   └── ApplicationsPage.tsx
├── store/                 # Zustand или Context
│   └── authStore.ts
└── styles/
    └── globals.css
```

## 7.2 Роутинг

| Путь | Страница | Доступ |
|------|----------|--------|
| `/` | Redirect на /dashboard или /login | — |
| `/login` | LoginPage | Гость |
| `/dashboard` | DashboardPage (мой профиль + быстрые действия) | Auth |
| `/profile` | ProfilePage (просмотр своего) | Auth |
| `/profile/edit` | ProfileEditPage | Auth |
| `/search` | SearchPage (лента участников + фильтры) | Auth |
| `/teams` | TeamsPage (лента команд, party finder) | Auth |
| `/teams/:id` | TeamDetailPage (описание, участники, «Вступить») | Auth |
| `/users/:id` | UserDetailPage | Auth |
| `/applications` | ApplicationsPage (мои отклики) | Auth |

## 7.3 Описание экранов

### LoginPage

- Фон: градиент BG1 → BG2
- По центру: логотип SkillHub + слоган
- Кнопка «Войти через GitHub» (иконка + текст)
- Дополнительно: «Войти через Telegram» (пост-MVP)

### DashboardPage

- Header: логотип, навигация, аватар + выпадающее меню
- Блок «Мой рейтинг»:
  - Крупный Gauge 0–100 (Lime/Amber/Red по уровню)
  - Грейд (бейдж)
  - Кнопка «Обновить рейтинг» (с учётом лимита)
- Блок «Быстрые действия»:
  - «Редактировать профиль»
  - «Участники» (лента)
  - «Команды» (лента, party finder)
  - «Мои отклики»
- Блок «Статус»: Free / PRO Captain

### ProfileEditPage

- Форма:
  - Роль (select)
  - Заявленный грейд (select: Junior / Middle / Senior) — в рамках какой роли оценивать
  - Стек (multi-select или chips + input)
  - Опыт (число), хакатоны (число)
  - О себе (textarea)
  - Ссылки на проекты (динамический список: url, title, description)
  - Telegram (@username)
  - GitHub URL (или «Импорт из GitHub»)
- Кнопка «Сохранить»

### SearchPage (лента участников)

- Фильтры: роль, грейд, мин. рейтинг, стек, поиск
- Лента карточек UserCard (**PRO выше в выдаче** — буст как на Авито)
- Карточка: аватар, имя, роль, грейд, рейтинг, стек, «Открыть» / «Написать» (если PRO и рейтинг 80+)

### TeamsPage (лента команд, party finder)

- Фильтры: хакатон, роль, стек
- Карточки команд: название, хакатон, кого ищут, слоты
- Клик → TeamDetailPage

### TeamDetailPage

- Название, описание, хакатон
- Участники команды (аватар, имя, роль, рейтинг)
- Требования (роли, стек, мин. рейтинг)
- Кнопка **«Вступить в команду»** → модалка с сообщением → POST /applications
- Для капитана: «Мои заявки» (входящие отклики)

### UserDetailPage

- Аватар, имя, роль, грейд, рейтинг
- «О себе», стек, проекты
- **Strengths/improvements не показываем**
- Кнопка «Написать» — если PRO и рейтинг 80+, показываем контакт (Telegram)

### ApplicationsPage

- Табы: «Входящие» (по моим командам) / «Исходящие»
- Входящие: аватар, имя, рейтинг, сообщение, команда
- Кнопки «Принять» / «Отклонить»
- **При принятии — показываем контакт** (Telegram)

---

# 8. Дизайн-система

## 8.1 Цвета (Tailwind)

```css
/* globals.css или tailwind.config.js */
:root {
  --bg-1: #0B1020;
  --bg-2: #0F1733;
  --text-main: #EAF0FF;
  --text-secondary: #AAB7D6;
  --accent-cyan: #00E5FF;
  --accent-lime: #B6FF3B;
  --accent-amber: #FFB020;
  --accent-red: #FF4D4D;
  --card-fill: rgba(255,255,255,0.06);
  --card-stroke: rgba(255,255,255,0.12);
}
```

## 8.2 Рейтинг → цвет

| Диапазон | Цвет | Tailwind |
|----------|------|----------|
| 80–100 | Lime | `#B6FF3B` |
| 50–79 | Amber | `#FFB020` |
| 0–49 | Red | `#FF4D4D` |

## 8.3 Типографика

- H1: 72–84px, Bold
- H2: 48–56px, SemiBold
- Body: 28–32px
- Caption: 18–20px
- Шрифт: Inter (текст), Unbounded (заголовки опционально)

## 8.4 Компоненты

- **Card**: `rounded-2xl`, `bg-[var(--card-fill)]`, `border border-[var(--card-stroke)]`, `backdrop-blur`
- **Button primary**: `bg-[var(--accent-cyan)] text-[var(--bg-1)]`
- **Badge rating**: цвет по диапазону, `rounded-full`, `px-3 py-1`
- **PRO border**: градиент `from-cyan to-lime` на карточке

---

# 9. Пользовательские сценарии

## 9.1 Участник ищет команду

1. Login → GitHub
2. (Опционально) Заполнить профиль. Можно сразу получить рейтинг по данным GitHub
3. «Получить рейтинг» → ждать 5–10 сек → бейдж 78/100 (минимальная оценка даже без профиля)
4. Перейти в **«Команды»** (лента party finder)
5. Листать команды, открыть нужную → описание, участники, требования
6. «Вступить в команду» → написать сообщение → отклик отправлен
7. Ждать ответа в «Мои отклики»
8. При принятии — видим контакт капитана, пишем в TG

## 9.2 Капитан ищет участников

1. Login
2. Создать команду (название, описание, кого ищет, хакатон)
3. (Опционально) PRO — 299 ₽
4. **Лента участников** → фильтр: роль Backend, рейтинг > 75, стек Node.js
5. PRO: выше в выдаче (буст), видит контакты при рейтинге 80+
6. Пишет в Telegram или ждёт откликов на свою команду
7. **Лента команд**: заявки на команду → Принять/Отклонить → при принятии показываем контакт

---

# 10. Монетизация и ограничения

## 10.1 Free

| Функция | Ограничение |
|---------|-------------|
| Профиль | Полный |
| AI-скоринг | 1 раз в 7 дней (можно по минимуму без профиля) |
| Лента участников / команд | Просмотр |
| Контакты | Скрыты |
| Отклики | Можно вступить в команду, контакт — после принятия |
| Выдача в ленте | Стандартная |

## 10.2 PRO (299 ₽/мес) — для капитанов И участников

### Для капитанов
| Функция | Доступ |
|---------|--------|
| Контакты | Видны для пользователей с рейтингом 80+ |
| Буст команды | Команда выше в ленте команд |
| Скоринг | 1 раз в 24 часа |
| Заявки | Приоритет (первым в списке) |

### Для участников
| Функция | Доступ |
|---------|--------|
| Буст в ленте | Профиль выше в выдаче (как на Авито) |
| Бейдж PRO | Подсветка карточки |
| Скоринг | 1 раз в 24 часа |
| Контакты | Видны при рейтинге 80+ (если кто-то с PRO смотрит) |

**Strengths/improvements не показываем никому** — только score и grade.

## 10.3 Ретеншн (пуш «Обнови рейтинг»)

**Пост-MVP.** В MVP не реализуем.

## 10.4 B2B Organizer (пост-MVP)

- Брендированный хакатон на платформе
- Встроенный рейтинг для участников
- Аналитика по командам
- Цена: по запросу

---

# Приложения

## A. Чеклист для разработчика

- [ ] env: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `YANDEXGPT_API_KEY`, `DATABASE_URL`
- [ ] CORS для фронтенда
- [ ] Rate limiting на /profile/score
- [ ] Валидация входных данных (Zod/Joi)
- [ ] Обработка ошибок AI (fallback, retry)

## B. Полезные ссылки

- GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps
- GitHub REST API: https://docs.github.com/en/rest
- YandexGPT: https://cloud.yandex.ru/docs/yandexgpt/
- Yandex Cloud: https://cloud.yandex.ru/

---

*Документ готов к использованию на хакатоне и в пост-MVP разработке.*
