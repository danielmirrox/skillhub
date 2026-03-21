# Scripts — SkillHub

Seed-данные, миграции, импорт из GitHub.

**Ответственный:** Дени (Integration)

```bash
node seed.js   # проверка и summary seed-датасета
```

## Что делает `seed.js`

- Хранит seed-датасет для Блока 3: users, profiles, ratings, teams, team_members, applications.
- Покрывает роли: frontend, backend, fullstack, design, ml, mobile, other.
- Держит диапазон рейтингов 45-92 для проверки фильтров поиска.

## Где используется

- `server/src/data/demoStore.js` подключает данные из `scripts/seed.js`.
- Это позволяет сразу проверять `GET /api/v1/users` и фильтры без ручного наполнения.

## Block 4 helpers

- `scripts/teams-applications-migration.sql` — SQL helper для teams/team_members/applications.
- `scripts/check-block4-applications.md` — e2e runbook для PRO + applications.
- `scripts/BLOCK_4_NOTES.md` — результаты прогона и риски.
