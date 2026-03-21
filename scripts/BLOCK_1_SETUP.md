# SkillHub — План Дени (Блок 4)

## Дата: 21–22 марта 2026

---

## Статус на сейчас

### Уже сделано

- [x] Создан `.env.example` с описанием переменных
- [x] Настроены все переменные окружения в `.env`
- [x] Локально проверена корректность OAuth callback URL в GitHub App / `.env`
- [x] Сервер Даниэла (express) стартует на `npm run dev` и отвечает на `/health`
- [x] Локальный демо-вход позволяет открыть dashboard и profile без GitHub OAuth
- [x] Добавлен локальный SQL-скрипт инициализации PostgreSQL: `scripts/local-postgres-setup.sql`
- [x] Подготовлены утилиты: `scripts/setup-env.js`, `scripts/check-env.js`
- [x] Прогнаны тесты Блока 2 (profile + score + import-github)

### В работе

- [x] Переход на Блок 3: seed-данные и проверка ленты поиска
- [ ] Переход на Блок 4: PRO + Applications end-to-end
- [ ] БД PostgreSQL подключена и работает
- [ ] Финальная проверка: PostgreSQL доступен под `DATABASE_URL` и запросы к API проходят стабильно

---

## Текущий этап (Блок 4: PRO + Applications)

### Цель

Проверить, что сценарий отклика и обработки заявок работает end-to-end, и подключить демо-заглушку активации PRO.

### Что сделать

1. Применить SQL-миграцию для `teams`, `team_members`, `applications`.
2. Проверить `GET /api/v1/teams` и наличие рабочих teamId.
3. Прогнать сценарий отклика: `POST /api/v1/applications`.
4. Проверить уведомления/входящие и исходящие: `GET /api/v1/applications`.
5. Прогнать принятие/отклонение отклика: `PATCH /api/v1/applications/:id`.
6. Проверить демо-заглушку PRO: `POST /api/v1/auth/pro/upgrade` + `GET /api/v1/auth/me`.
7. Зафиксировать наблюдения и риски в короткой заметке для команды.

---

## Файлы для работы (только scripts)

- `scripts/teams-applications-migration.sql` — SQL для Блока 4
- `scripts/check-block4-applications.md` — runbook e2e прогона
- `scripts/BLOCK_3_NOTES.md` — наблюдения и риски с Блока 3

---

## Быстрый запуск для Блока 4

```powershell
# 1) Проверить env
node scripts/check-env.js

Если все переменные зелёные (✅), можно двигаться дальше!

# 2) Поднять backend
cd server
npm install
npm run dev

# 3) В отдельном терминале вернуться в корень
cd ..

# 4) Применить миграцию Блока 4
psql "$env:DATABASE_URL" -f scripts/teams-applications-migration.sql

# 5) Прогнать runbook
# Открыть scripts/check-block4-applications.md и выполнить шаги
```

---

## Проверки API для Блока 4

#### 1) Health-check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/health"
```

#### 2) Dемо-активация PRO

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/pro/upgrade" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body "{}"
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/auth/me" -Headers @{ "X-Demo-User-Id" = "user-denis" }
```

#### 3) Список команд

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/teams" -Headers @{ "X-Demo-User-Id" = "user-denis" }
```

#### 4) Создание отклика

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/applications" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body '{"teamId":"team-viribus","message":"Хочу в команду"}'
```

#### 5) Входящие/исходящие

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers @{ "X-Demo-User-Id" = "user-denis" }
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers @{ "X-Demo-User-Id" = "user-captain" }
```

#### 6) Принятие/отклонение отклика

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:5000/api/v1/applications/<APPLICATION_ID>" -Headers @{ "X-Demo-User-Id" = "user-captain" } -ContentType "application/json" -Body '{"status":"accepted"}'
```

---

## Что считать успешным прогоном Блока 4

1. Миграция применяется без ошибок.
2. PRO-заглушка включает `isPro=true` и выставляет `proExpiresAt`.
3. Отклик создается со статусом `pending`.
4. Отклик виден в `outgoing` у аппликанта и в `incoming` у капитана.
5. `PATCH` меняет статус на `accepted` или `declined`.
6. Нет ошибок `500` на маршрутах Блока 4.

---

## Критерий готовности этапа

- [x] Добавлен SQL-файл `scripts/teams-applications-migration.sql`
- [x] Добавлен runbook `scripts/check-block4-applications.md`
- [x] Добавлена backend-заглушка `POST /api/v1/auth/pro/upgrade`
- [x] Прогнан e2e-сценарий отклика и обработки заявки
- [x] Зафиксированы наблюдения/риски по Блоку 4
