# Скрипты — SkillHub

Seed-данные, миграции, импорт из GitHub.

**Ответственный:** Дени (интеграция)

```bash
node seed.js   # проверка и сводка seed-датасета
```

## Что делает `seed.js`

- Хранит seed-датасет для Блока 3: users, profiles, ratings, teams, team_members, applications.
- Покрывает роли: frontend, backend, fullstack, design, ml, mobile, other.
- Держит диапазон рейтингов 45-92 для проверки фильтров поиска.

## Где используется

- `server/src/data/demoStore.js` подключает данные из `scripts/seed.js`.
- Это позволяет сразу проверять `GET /api/v1/users` и фильтры без ручного наполнения.

## Файлы Блока 4

- `scripts/teams-applications-migration.sql` — SQL-файл для teams/team_members/applications.
- `scripts/check-block4-applications.md` — пошаговая проверка PRO + applications.
- `scripts/BLOCK_4_NOTES.md` — результаты прогона и риски.

## Файлы Блока 5

- `scripts/BLOCK_5_NOTES.md` — результаты Блока 5 и ограничения по текущему объему работ.

## Файлы Блока 2

- `scripts/BLOCK_2_NOTES.md` — аккуратная сводка по проверке профиля, скоринга и импорта GitHub.
