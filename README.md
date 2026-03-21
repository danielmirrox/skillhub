# SkillHub

Платформа мэтчинга для хакатонов. AI-рейтинг навыков, лента участников, лента команд (party finder). Viribus Hackathon 2026.

## Статус по плану

- ✅ Блок 1 (Frontend, Денис): поднят `client/` на React + Vite + Tailwind
- ✅ Реализованы маршруты `/`, `/login`, `/dashboard`
- ✅ Добавлен auth-check через `GET /auth/me` и защита `/dashboard`
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
