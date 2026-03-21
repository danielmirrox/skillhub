# Блок 4 — Пошаговая e2e-проверка (PRO + Applications)

## Цель
Проверить end-to-end поток заявок и демо-активацию PRO.

> Примечание: сценарий использует `X-Demo-User-Id` только для локального e2e и smoke-контроля.

## Предусловия
1. Backend запущен на http://localhost:5000.
2. Демо-пользователи из scripts/seed.js активны в demoStore.
3. Эндпоинт teams возвращает хотя бы одну команду.

## Эндпоинты
1. POST /api/v1/auth/pro/upgrade
2. GET /api/v1/auth/me
3. GET /api/v1/teams
4. POST /api/v1/applications
5. GET /api/v1/applications
6. PATCH /api/v1/applications/:applicationId

## Шаги в PowerShell

### 1) Активировать PRO (демо)
```powershell
$headersPro = @{ "X-Demo-User-Id" = "user-denis" }
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/pro/upgrade" -Headers $headersPro -ContentType "application/json" -Body "{}"
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/auth/me" -Headers $headersPro
```
Ожидаемо: `isPro=true` и непустой `proExpiresAt`.

### 2) Получить список команд и выбрать target teamId
```powershell
$teams = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/teams" -Headers $headersPro
$teams.items
```
Ожидаемо: список не пустой.

### 3) Создать заявку (applicant)
```powershell
$teamId = $teams.items[0].id
$appBody = @{ teamId = $teamId; message = "Готов подключиться к задаче и закрыть frontend часть." } | ConvertTo-Json
$app = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/applications" -Headers $headersPro -ContentType "application/json" -Body $appBody
$app
```
Ожидаемо: статус `pending`.

### 4) Проверить исходящие заявки (applicant)
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers $headersPro
```
Ожидаемо: созданная заявка появилась в `outgoing`.

### 5) Капитан проверяет входящие (экран уведомлений)
```powershell
$headersCaptain = @{ "X-Demo-User-Id" = "user-captain" }
$incoming = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers $headersCaptain
$incoming.incoming
```
Ожидаемо: заявка появилась в `incoming` у автора команды.

### 6) Капитан принимает/отклоняет
```powershell
$applicationId = $incoming.incoming[0].id
Invoke-RestMethod -Method Patch -Uri "http://localhost:5000/api/v1/applications/$applicationId" -Headers $headersCaptain -ContentType "application/json" -Body '{"status":"accepted"}'
```
Ожидаемо: статус меняется на `accepted`.

### 7) Applicant видит обновленный статус в outgoing
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers $headersPro
```
Ожидаемо: статус той же заявки обновлен с `pending` на `accepted` или `declined`.

## Критерии успеха
1. Эндпоинт активации PRO возвращает success и обновляет auth/me.
2. Заявка создается для активной команды.
3. Incoming/outgoing показывают одну и ту же заявку у обеих сторон.
4. Обновление статуса через PATCH видно end-to-end.
5. Нет ошибок 500.

## Типовые ошибки
1. 409 APPLICATION_ALREADY_EXISTS при повторном POST.
2. 403 FORBIDDEN, если PATCH делает не автор команды.
3. 404 TEAM_NOT_FOUND для невалидного teamId.
