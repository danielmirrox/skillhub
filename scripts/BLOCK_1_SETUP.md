# SkillHub — План Дени (Переход к Блоку 5)

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
- [x] Переход на Блок 4: PRO + Applications end-to-end
- [ ] БД PostgreSQL подключена и работает
- [ ] Финальная проверка: PostgreSQL доступен под `DATABASE_URL` и запросы к API проходят стабильно
- [x] Переход на Блок 5: усиление импорта GitHub и чеклист деплоя
- [ ] Финальная проверка callback URL для прод-среды
- [ ] Презентация (8-10 слайдов) и готовность к показу
- [ ] Изменения backend/frontend по Блоку 5 (вне рамок Дени в этой итерации)

---

## Текущий этап (Блок 5: импорт GitHub и деплой)

### Цель

Закрыть задачи по импорту GitHub и подготовить деплой/презентацию к защите.

### Что сделать

1. Убедиться, что `POST /api/v1/profile/import-github` корректно работает для двух режимов: `githubData` в теле запроса и импорт через `githubUrl`.
2. Проверить обработку ошибок импорта: невалидный `githubUrl`, ответ GitHub API != 200, отсутствие токена.
3. Зафиксировать чеклист деплоя backend/frontend (переменные, CORS, callback URL, health).
4. Сверить OAuth callback URL для production и локалки.
5. Подготовить короткий сценарий демо для презентации (поток: профиль -> импорт -> скоринг -> поиск -> отклик).
6. Обновить отметки в командном чеклисте по блоку Дени.
7. Зафиксировать результаты усиления в отдельной заметке Блока 5.

---

## Файлы для работы (только scripts)

- `scripts/BLOCK_3_NOTES.md` — наблюдения и риски с Блока 3
- `scripts/BLOCK_4_NOTES.md` — наблюдения и риски с Блока 4
- `scripts/BLOCK_5_NOTES.md` — наблюдения и риски с Блока 5
- `scripts/README.md` — актуальные утилиты и команды

---

## Быстрый запуск для Блока 5

> Примечание: `X-Demo-User-Id` и demo-активация ниже предназначены только для локальной проверки и демо-сценариев, не для production.

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

# 4) Проверить импорт GitHub (payload-режим)
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/import-github" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body '{"githubData":{"publicRepos":3,"followers":2,"languages":{"TypeScript":2}}}'

# 5) Проверить score и users-фильтры как демо-поток
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/score" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body '{}'
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/users?role=backend&minRating=70&page=1&limit=5"
```

---

## Проверки API для перехода 4 -> 5

#### 1) Health-check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/health"
```

#### 2) Dемо-активация PRO

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/pro/upgrade" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body "{}"
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/auth/me" -Headers @{ "X-Demo-User-Id" = "user-denis" }
```

#### 3) Импорт GitHub

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/import-github" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body '{"githubData":{"publicRepos":8,"followers":12,"languages":{"TypeScript":6,"JavaScript":3}}}'
```

#### 4) Список команд

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/teams" -Headers @{ "X-Demo-User-Id" = "user-denis" }
```

#### 5) Создание отклика

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/applications" -Headers @{ "X-Demo-User-Id" = "user-denis" } -ContentType "application/json" -Body '{"teamId":"team-viribus","message":"Хочу в команду"}'
```

#### 6) Входящие/исходящие

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers @{ "X-Demo-User-Id" = "user-denis" }
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers @{ "X-Demo-User-Id" = "user-captain" }
```

#### 7) Принятие/отклонение отклика

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:5000/api/v1/applications/<APPLICATION_ID>" -Headers @{ "X-Demo-User-Id" = "user-captain" } -ContentType "application/json" -Body '{"status":"accepted"}'
```

---

## Что считать успешным переходом к Блоку 5

1. `POST /api/v1/profile/import-github` успешно обновляет профиль при валидном `githubData`.
2. Импорт по `githubUrl` работает стабильно.
3. `POST /api/v1/profile/score` отвечает корректно (или предсказуемо возвращает `429` по ограничению частоты).
4. Поиск пользователей (`/users` + фильтры + пагинация) работает стабильно.
5. Сценарий отклика (Блок 4) остается рабочим: create/list/patch.
6. Ошибки импорта возвращают предсказуемые коды вместо неожиданных `500`.
7. Нет неожиданных ошибок `500` в ключевых маршрутах демо-потока.

Примечание по рамкам: в текущей итерации Дени работает только в `scripts`, без правок backend/frontend.

---

## Критерий готовности этапа

- [x] Добавлен SQL-файл `scripts/teams-applications-migration.sql`
- [x] Добавлен runbook `scripts/check-block4-applications.md`
- [x] Добавлена backend-заглушка `POST /api/v1/auth/pro/upgrade`
- [x] Прогнан e2e-сценарий отклика и обработки заявки
- [x] Зафиксированы наблюдения/риски по Блоку 4
- [x] Проведен контрольный API-аудит блоков 1-4 перед переходом
- [ ] Добавлено усиление для `POST /api/v1/profile/import-github` (режимы + ошибки)
- [ ] Прогнана проверка Блока 5 (githubData/githubUrl/error cases)
- [x] Подготовлена заметка по Блоку 5 в `scripts`
