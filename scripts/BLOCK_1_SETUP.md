# SkillHub — План Дени (актуальный)

## Дата: 21–22 марта 2026

---

## Статус на сейчас

### Уже сделано

- [x] Настроен `.env` и базовые переменные окружения
- [x] Проверен OAuth callback URL
- [x] Поднят backend и проверен `/health`
- [x] Добавлен локальный SQL-скрипт инициализации PostgreSQL: `scripts/local-postgres-setup.sql`
- [x] Подготовлены утилиты: `scripts/setup-env.js`, `scripts/check-env.js`

### В работе

- [ ] Финальная проверка: PostgreSQL доступен под `DATABASE_URL` и запросы к API проходят стабильно

---

## Следующий этап (Блок 2: Profile + AI)

### Цель

Проверить, что scoring и импорт GitHub работают на реальных тест-кейсах для демо.

### Что сделать

1. Подготовить 3 тестовых профиля (junior, middle, senior) с разными ролями.
2. Прогнать сценарий:
   - `PUT /api/v1/profile`
   - `POST /api/v1/profile/score`
   - `POST /api/v1/profile/import-github` (для github-кейса)
3. Проверить, что в ответе есть `rating.score`, `rating.grade`, `rating.roleLabel`.
4. Проверить диапазоны score и обновление истории `GET /api/v1/profile/score/history`.
5. Зафиксировать проблемные кейсы (если есть): невалидный JSON, ошибки 400/500, нестабильные ответы.

---

## Файлы для работы (только scripts)

- `scripts/test-profiles.json` — тестовые payloads
- `scripts/check-score-cases.md` — runbook прогона
- `scripts/local-postgres-setup.sql` — локальная инициализация БД

---

## Быстрый запуск прогона

```powershell
# 1) Проверить env
node scripts/check-env.js

# 2) Поднять backend
cd server
npm install
npm run dev

# 3) В новом терминале вернуться в корень и выполнить тесты по runbook
cd ..
# Открыть scripts/check-score-cases.md и прогнать команды
```

### Если ты уже на этапе `npm run dev`

Отлично. Оставь сервер в этом терминале запущенным и открой второй терминал в корне проекта `skillhub`.

#### 1) Проверка, что API живой

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/health"
```

Ожидаемо: ответ со `status: ok`.

#### 2) Тест-кейс 1: junior frontend

```powershell
$headers1 = @{ "X-Demo-User-Id" = "user-denis" }

$profile1 = @{
   role = "frontend"
   claimedGrade = "junior"
   primaryStack = @("HTML", "CSS", "JavaScript")
   experienceYears = 0
   hackathonsCount = 0
   bio = "Начинающий frontend-разработчик, делаю учебные проекты."
   projectLinks = @(
      @{
         url = "https://github.com/example/junior-frontend-landing"
         title = "Landing page"
         description = "Учебный лендинг на чистом JS"
      }
   )
   telegramUsername = "junior_front"
   githubUrl = "https://github.com/example"
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/v1/profile" -Headers $headers1 -ContentType "application/json" -Body $profile1
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/score" -Headers $headers1 -ContentType "application/json" -Body "{}"
```

#### 3) Тест-кейс 2: middle backend

```powershell
$headers2 = @{ "X-Demo-User-Id" = "user-deni" }

$profile2 = @{
   role = "backend"
   claimedGrade = "middle"
   primaryStack = @("Node.js", "PostgreSQL", "Express")
   experienceYears = 2
   hackathonsCount = 3
   bio = "Backend разработчик. Пишу REST API, работаю с PostgreSQL."
   projectLinks = @(
      @{
         url = "https://github.com/example/task-api"
         title = "Task API"
         description = "CRUD API с авторизацией"
      },
      @{
         url = "https://github.com/example/queue-worker"
         title = "Queue Worker"
         description = "Фоновая обработка задач"
      }
   )
   telegramUsername = "middle_back"
   githubUrl = "https://github.com/example"
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/v1/profile" -Headers $headers2 -ContentType "application/json" -Body $profile2
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/score" -Headers $headers2 -ContentType "application/json" -Body "{}"
```

#### 4) Тест-кейс 3: senior fullstack + github import

```powershell
$headers3 = @{ "X-Demo-User-Id" = "user-captain" }

$profile3 = @{
   role = "fullstack"
   claimedGrade = "senior"
   primaryStack = @("TypeScript", "React", "Node.js", "PostgreSQL")
   experienceYears = 6
   hackathonsCount = 9
   bio = "Fullstack lead. Архитектура, backend и продуктовый frontend."
   projectLinks = @(
      @{
         url = "https://github.com/example/saas-platform"
         title = "SaaS platform"
         description = "Многомодульная платформа с RBAC"
      }
   )
   telegramUsername = "senior_full"
   githubUrl = "https://github.com/example"
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/v1/profile" -Headers $headers3 -ContentType "application/json" -Body $profile3

$githubData = @{
   githubData = @{
      fetchedAt = "2026-03-21T10:00:00Z"
      publicRepos = 42
      followers = 120
      accountAgeYears = 7
      languages = @{
         TypeScript = 160000
         JavaScript = 95000
         SQL = 34000
         Python = 27000
      }
      topRepos = @(
         @{
            name = "platform-core"
            description = "Core platform services"
            stars = 320
            primaryLanguage = "TypeScript"
         }
      )
   }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/import-github" -Headers $headers3 -ContentType "application/json" -Body $githubData
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/score" -Headers $headers3 -ContentType "application/json" -Body "{}"
```

#### 5) Проверка истории скоринга

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/profile/score/history" -Headers $headers3
```

Ожидаемо: в `items` есть результаты последних запусков.

#### 6) Что считать успешным прогоном

1. Нет ошибок `500` на всех шагах.
2. В ответе есть `rating.score`, `rating.grade`, `rating.roleLabel`.
3. История скоринга обновилась.
4. Если есть ошибка, сохрани текст ошибки и payload в заметку для команды.

### Частая проблема: RATE_LIMITED

Если получил `RATE_LIMITED`, это нормально для одного и того же пользователя (лимит скоринга).

Что делать:

1. Запускай кейсы с разными заголовками `X-Demo-User-Id` (как в примерах выше).
2. Для повторного прогона используй другого demo-user: `user-daniel`, `user-denis`, `user-deni`, `user-captain`.

---

## Критерий готовности этапа

- [ ] Все 3 кейса из `scripts/test-profiles.json` проходят без 500
- [ ] Ответы scoring содержат обязательные поля
- [ ] История score обновляется после каждого прогона
- [ ] Есть краткий список наблюдений/рисков для команды
