# Блок 3 — Заметки Дени

## Дата
2026-03-21

## Что проверено
- Подключен seed-датасет через scripts/seed.js
- Базовая выдача пользователей: GET /api/v1/users
- Фильтры: role, grade, minRating, stack
- Пагинация: page, limit

## Сводка валидации
- всего пользователей: 16
- роли: backend, design, frontend, fullstack, ml, mobile, other
- диапазон рейтинга: 45-92
- количество backend: 5
- количество middle: 8
- количество при minRating=70: 12
- количество при stack=TypeScript: 3
- пагинация: page1(limit=5)=5, page2(limit=5)=5

## Наблюдения
- В выдаче достаточно разнообразия для карточек и фильтров в демо.
- Демо user ID из предыдущих шагов сохранены (user-daniel, user-denis, user-deni, user-captain).
- В seed уже включены teams, team members и примеры applications для следующих этапов.

## Риски
- Seed работает в demo/in-memory режиме, данные сбрасываются после перезапуска сервера.
- Фильтрация по stack основана на точном совпадении, похожие метки (TypeScript vs TS) не объединяются.
- Значения score заданы константами и не отражают live AI scoring.

## Следующий шаг
- Переход к Блоку 4: проверить e2e-поток applications с обновлением incoming/outgoing.
