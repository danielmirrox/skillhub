# Проверка Score-кейсов (Дени)

## Цель
Проверить профильный скоринг и поток импорта GitHub перед демо.

## Предусловия
1. Сервер запущен на http://localhost:5000.
2. Включен development mode (работает fallback demo user).
3. Тестовые payload доступны в scripts/test-profiles.json.

## API-эндпоинты
1. PUT /api/v1/profile
2. POST /api/v1/profile/score
3. POST /api/v1/profile/import-github
4. GET /api/v1/profile/score/history

## Ручная последовательность проверки
1. Скопировать profile payload из scripts/test-profiles.json.
2. Отправить запрос обновления профиля.
3. Отправить запрос скоринга.
4. Проверить диапазон score и обязательные поля.
5. Для GitHub-кейса отправить import-github перед скорингом и сравнить результат.

## Примеры PowerShell

### 1) Обновить профиль
```powershell
$profile = @{
  role = "backend"
  claimedGrade = "middle"
  primaryStack = @("Node.js", "PostgreSQL", "Express")
  experienceYears = 2
  hackathonsCount = 3
  bio = "Backend-разработчик."
  projectLinks = @(
    @{
      url = "https://github.com/example/task-api"
      title = "Task API"
      description = "CRUD API"
    }
  )
  telegramUsername = "middle_back"
  githubUrl = "https://github.com/example"
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/v1/profile" -ContentType "application/json" -Body $profile
```

### 2) Запустить скоринг
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/score" -ContentType "application/json" -Body "{}"
```

### 3) Импортировать githubData (для senior-fullstack кейса)
```powershell
$github = @{
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

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/import-github" -ContentType "application/json" -Body $github
```

### 4) История скоринга
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/profile/score/history"
```

## Критерии успеха
1. Ответ содержит rating.score, rating.grade, rating.roleLabel.
2. score находится в ожидаемом диапазоне из scripts/test-profiles.json.
3. Нет ошибок 500.
4. История скоринга обновляется после каждого прогона.

## Критерии ошибки
1. 400/500 на валидном payload.
2. Отсутствуют поля rating.
3. score выходит за ожидаемый диапазон при одинаковом входе.
4. import-github не влияет на suggested stack/links.
