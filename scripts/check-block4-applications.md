# Block 4 E2E Runbook (PRO + Applications)

## Goal
Validate end-to-end flow for applications and demo PRO activation.

## Preconditions
1. Backend is running on http://localhost:5000.
2. Demo users from scripts/seed.js are active in demoStore.
3. Teams endpoint returns at least one team.

## Endpoints
1. POST /api/v1/auth/pro/upgrade
2. GET /api/v1/auth/me
3. GET /api/v1/teams
4. POST /api/v1/applications
5. GET /api/v1/applications
6. PATCH /api/v1/applications/:applicationId

## PowerShell steps

### 1) Activate PRO (demo)
```powershell
$headersPro = @{ "X-Demo-User-Id" = "user-denis" }
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/pro/upgrade" -Headers $headersPro -ContentType "application/json" -Body "{}"
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/auth/me" -Headers $headersPro
```
Expected: `isPro=true` and non-null `proExpiresAt`.

### 2) List teams and pick target teamId
```powershell
$teams = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/teams" -Headers $headersPro
$teams.items
```
Expected: non-empty list.

### 3) Create application (applicant)
```powershell
$teamId = $teams.items[0].id
$appBody = @{ teamId = $teamId; message = "Готов подключиться к задаче и закрыть frontend часть." } | ConvertTo-Json
$app = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/applications" -Headers $headersPro -ContentType "application/json" -Body $appBody
$app
```
Expected: status `pending`.

### 4) Check outgoing applications (applicant)
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers $headersPro
```
Expected: created application appears in `outgoing`.

### 5) Captain checks incoming (notification view)
```powershell
$headersCaptain = @{ "X-Demo-User-Id" = "user-captain" }
$incoming = Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers $headersCaptain
$incoming.incoming
```
Expected: application appears in `incoming` for team author.

### 6) Captain accepts/declines
```powershell
$applicationId = $incoming.incoming[0].id
Invoke-RestMethod -Method Patch -Uri "http://localhost:5000/api/v1/applications/$applicationId" -Headers $headersCaptain -ContentType "application/json" -Body '{"status":"accepted"}'
```
Expected: status becomes `accepted`.

### 7) Applicant sees updated outgoing status
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/applications" -Headers $headersPro
```
Expected: same application status updated from `pending` to `accepted` or `declined`.

## Pass criteria
1. PRO activation endpoint returns success and updates auth/me.
2. Application can be created for active team.
3. Incoming/outgoing lists reflect same application on both sides.
4. PATCH status updates are visible end-to-end.
5. No 500 errors.

## Typical failure cases
1. 409 APPLICATION_ALREADY_EXISTS on repeated POST.
2. 403 FORBIDDEN when non-author tries PATCH.
3. 404 TEAM_NOT_FOUND for invalid teamId.
