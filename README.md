# SkillHub

Платформа мэтчинга для хакатонов. AI-рейтинг навыков, лента участников, лента команд (party finder). Viribus Hackathon 2026.

## Статус по плану

- ✅ Блок 1 (Frontend, Денис): поднят `client/` на React + Vite + Tailwind
- ✅ Реализованы маршруты `/`, `/login`, `/dashboard`
- ✅ Добавлен auth-check через `GET /api/v1/auth/me` и защита `/dashboard`
- ✅ Добавлен демо-вход для тестирования интерфейсов без GitHub OAuth
- ✅ Добавлены `search` и public user detail экраны для проверки поиска и PRO-видимости
- ✅ Добавлены `applications` и отклик через модалку с accept/decline
- ✅ Добавлен демо-UI для GitHub import в редактировании профиля, с превью подсказок для стека и проектов
- 🔄 Backend и интеграция продолжаются параллельно

> [!WARNING]
> **ВАЖНО: как работаем параллельно на одной ветке**
> - Даниэл — backend и БД, Денис — client и UI, Дени — scripts, seed, презентация, docs.
> - Не трогаем один и тот же файл одновременно. Общие файлы редактирует только один человек за раз.
> - Коммиты маленькие и частые. Сначала `git pull`, потом работа, потом `git push`.
> - Конфликты решаем сразу, не копим до конца дня.
> - Если меняется `README`, `docs`, `package.json`, `.env.example` или схема БД — синхронизируемся перед правкой.

## Структура

| Папка | Кто | Описание |
|-------|-----|----------|
| `client/` | Денис | React, Vite, Tailwind |
| `server/` | Даниэл | Node.js, Express, PostgreSQL |
| `scripts/` | Дени | Seed, миграции |
| `docs/` | Все | Спеки, планы, чеклисты |

## Запуск

```bash
cd server
npm install
npm run dev

cd ../client
npm install
npm run dev
```

## Переменные окружения (frontend)

Создайте `client/.env`, если backend не на `http://localhost:5000`:

```env
VITE_API_URL=http://localhost:5000
```

## Документация

Всё в `docs/` — PRODUCT_SPEC_FULL.md, HAKATHON_30H_PLAN_V2.md, CHECKLISTS_BY_MEMBER.md.

## Моя зона сейчас

- Даниэл: backend, серверная структура, API, auth-обвязка, проверки, схема БД и базовые эндпоинты.
- GitHub, YandexGPT и реальная БД-интеграция будут подключаться позже другим человеком, поэтому сейчас не отвлекаемся на них в основной ветке задач.
- Для этой итерации держим рабочий демо-слой, чтобы фронт и интеграции могли идти параллельно.
- Локальный демо-вход позволяет тестировать dashboard, profile и edit profile без GitHub OAuth.

## Что я делаю дальше по плану

1. Довожу backend API до стабильного состояния на демо-слое: профили, поиск, заявки, PRO-правила.
2. Согласую контракт с фронтом по ответам `/profile`, `/users`, `/applications`, чтобы потом без боли заменить демо-слой на БД.
3. Когда другой человек принесёт GitHub/Yandex/DB-интеграции, подключаю их к уже готовым эндпоинтам без переделки структуры сервера.
4. Для локальной разработки держим поддержку `localhost` origin и демо-пользователя, чтобы можно было гонять UI на свободных портах.

## Контракт для фронта

- Базовый префикс API: `/api/v1`
- Все маршруты ниже доступны именно под этим префиксом, без дополнительных алиасов.

### `GET /api/v1/auth/me`

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
		"role": "both",
		"userRole": "both"
	},
	"profile": {
		"id": "uuid",
		"role": "backend",
		"claimedGrade": "middle",
		"primaryStack": ["Node.js", "PostgreSQL"],
		"experienceYears": 2,
		"hackathonsCount": 3,
		"bio": "...",
		"projectLinks": [],
		"telegramUsername": "@danieltgrm",
		"githubUrl": "https://github.com/...",
		"isPublic": true,
		"hasRating": true,
		"lastRatingScore": 78,
		"rating": {
			"score": 78,
			"grade": "Middle Backend",
			"roleLabel": "Backend"
		}
	}
}
```

### `GET /api/v1/profile`

Возвращает тот же объект, что и `GET /api/v1/auth/me`.

### `PUT /api/v1/profile`

```json
{
	"profile": {
		"id": "uuid",
		"role": "backend",
		"claimedGrade": "middle",
		"primaryStack": ["Node.js", "PostgreSQL"],
		"experienceYears": 2,
		"hackathonsCount": 3,
		"bio": "...",
		"projectLinks": [],
		"telegramUsername": "@danieltgrm",
		"githubUrl": "https://github.com/...",
		"isPublic": true,
		"hasRating": true,
		"lastRatingScore": 78,
		"rating": {
			"score": 78,
			"grade": "Middle Backend",
			"roleLabel": "Backend"
		}
	}
}
```

### `POST /api/v1/profile/score`

- Free user success:

```json
{
	"rating": {
		"score": 78,
		"grade": "Middle Backend",
		"roleLabel": "Backend"
	},
	"profile": {},
	"nextAllowedAt": null
}
```

- PRO user success:

```json
{
	"rating": {
		"score": 78,
		"grade": "Middle Backend",
		"roleLabel": "Backend",
		"strengths": ["..."],
		"improvements": ["..."]
	},
	"profile": {},
	"nextAllowedAt": null
}
```

- Rate limit `429`:

```json
{
	"error": "RATE_LIMITED",
	"message": "Profile scoring is temporarily limited.",
	"nextAllowedAt": "2026-03-28T10:00:00.000Z"
}
```

### URL prefix confirmation

- Используем только `/api/v1/...`
- Без `api/` без версии и без отдельных dev-алиасов

## Коротко для фронта

Backend сейчас работает на префиксе `/api/v1`.

Финальные форматы:

- `GET /api/v1/auth/me` — `user` и `profile`
- `GET /api/v1/profile` — тот же формат, что и `auth/me`
- `PUT /api/v1/profile` — `{ profile: ... }`
- `POST /api/v1/profile/score` —
	- Free: `{ rating: { score, grade, roleLabel }, profile, nextAllowedAt: null }`
	- PRO: `{ rating: { score, grade, roleLabel, strengths, improvements }, profile, nextAllowedAt: null }`
	- 429: `{ error: 'RATE_LIMITED', message, nextAllowedAt }`

Поля `strengths` и `improvements` показываем только PRO.
