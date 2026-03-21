# Блок 4 — Заметки Дени

## Дата
2026-03-21

## Что реализовано
- Добавлен SQL-файл: scripts/teams-applications-migration.sql
- Добавлен e2e-runbook: scripts/check-block4-applications.md
- Добавлен demo PRO endpoint: POST /api/v1/auth/pro/upgrade

## Сводка e2e-проверки
- Активация PRO: success=true
- auth/me после апгрейда: isPro=true, proExpiresAt установлен
- Количество команд в списке: 3
- applications outgoing у аппликанта: отображаются
- applications incoming у капитана: отображаются
- PATCH accepted: работает, статус меняется на accepted

## Важное наблюдение
- POST /applications возвращает 409 APPLICATION_ALREADY_EXISTS при повторном создании.
- Это ожидаемо: в seed уже есть заявка для этой пары team/user.

## Риски
- In-memory demo store сбрасывается после перезапуска сервера.
- Повторное создание заявки для той же пары всегда вернет 409 из-за UNIQUE-поведения.
- PRO endpoint — демо-заглушка, без платежного процесса.

## Следующий шаг
- Блок 5: усиление импорта GitHub и чеклист деплоя.
