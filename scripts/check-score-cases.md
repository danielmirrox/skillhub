# Score Test Runbook (Deni)

## Goal
Validate profile scoring and github import flows before demo.

## Preconditions
1. Server is running on http://localhost:5000.
2. Development mode is enabled (fallback demo user works).
3. Test payloads are available in scripts/test-profiles.json.

## API Endpoints
1. PUT /api/v1/profile
2. POST /api/v1/profile/score
3. POST /api/v1/profile/import-github
4. GET /api/v1/profile/score/history

## Manual test sequence per case
1. Copy profile payload from scripts/test-profiles.json.
2. Send profile update request.
3. Send scoring request.
4. Check score range and required fields.
5. For github case, send import-github request before scoring and compare result.

## PowerShell examples

### 1) Update profile
```powershell
$profile = @{
  role = "backend"
  claimedGrade = "middle"
  primaryStack = @("Node.js", "PostgreSQL", "Express")
  experienceYears = 2
  hackathonsCount = 3
  bio = "Backend разработчик."
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

### 2) Trigger score
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/profile/score" -ContentType "application/json" -Body "{}"
```

### 3) Import githubData (for senior-fullstack case)
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

### 4) Score history
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/profile/score/history"
```

## Pass criteria
1. Response contains rating.score, rating.grade, rating.roleLabel.
2. score is in expected range from scripts/test-profiles.json.
3. No 500 errors.
4. score history is updated after each run.

## Fail criteria
1. 400/500 on valid payload.
2. Missing rating fields.
3. score outside expected range with same input.
4. import-github does not affect suggested stack/links.
