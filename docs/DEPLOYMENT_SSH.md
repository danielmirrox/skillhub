# SkillHub - SSH Deployment

Этот сценарий нужен для деплоя на сервер по SSH с запуском через Docker Compose.

## Что подготовить

На сервере должны быть установлены:

- `git`
- `docker`
- Docker Compose plugin

На локальной машине должны быть доступны:

- `ssh`
- `scp`
- PowerShell

## Первый запуск на сервере

1. Подготовить сервер.
2. Установить Docker и Git.
3. Открыть порт приложения, обычно `8080`, или настроить внешний reverse proxy.
4. Подготовить корневой `.env` для Docker Compose.
5. Подготовить `server/.env` с боевыми значениями.

Минимально важные переменные:

- в корневом `.env`:
  - `PUBLIC_APP_PORT`
  - `PUBLIC_APP_URL`
  - `CLIENT_URLS`
  - `GITHUB_CALLBACK_URL`
  - `COOKIE_SECURE`
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `DATABASE_URL`
- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `CLIENT_URL`
- `CLIENT_URLS`
- `JWT_SECRET`
- `COOKIE_SECURE`
- `YANDEXGPT_*`

## Что изменено для боевого деплоя

`docker-compose.yml` теперь использует переменные:

- `PUBLIC_APP_PORT`
- `PUBLIC_APP_URL`
- `CLIENT_URLS`
- `GITHUB_CALLBACK_URL`
- `COOKIE_SECURE`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`

То есть `localhost` больше не является единственным путём и compose можно поднимать на реальном домене.

## Деплой командой из PowerShell

Из корня репозитория:

```powershell
.\scripts\deploy-ssh.ps1 `
  -HostName your.server.ip.or.domain `
  -UserName deploy `
  -Port 22 `
  -TargetDir /opt/skillhub `
  -Branch main `
  -LocalComposeEnvFile .\.env `
  -LocalServerEnvFile .\server\.env
```

Что делает скрипт:

1. Подключается по SSH.
2. Создаёт директорию приложения на сервере.
3. При необходимости загружает локальный корневой `.env`.
4. При необходимости загружает локальный `server/.env`.
5. Клонирует репозиторий на сервер или делает `git pull`.
6. Выполняет `docker compose up -d --build`.
7. Показывает `docker compose ps`.
8. Проверяет `http://127.0.0.1:8080/health`.

## Повторный деплой

Если `server/.env` уже лежит на сервере, можно не загружать его заново:

```powershell
.\scripts\deploy-ssh.ps1 `
  -HostName your.server.ip.or.domain `
  -UserName deploy
```

## Рекомендуемые боевые значения

Если приложение живёт на `https://skillhub.example.com`, то:

- `PUBLIC_APP_URL=https://skillhub.example.com`
- `CLIENT_URL=https://skillhub.example.com`
- `CLIENT_URLS=https://skillhub.example.com`
- `GITHUB_CALLBACK_URL=https://skillhub.example.com/api/v1/auth/github/callback`
- `COOKIE_SECURE=true`

## Проверка после деплоя

На сервере:

```bash
cd /opt/skillhub
docker compose ps
docker compose logs -f backend
docker compose logs -f web
```

Снаружи:

- открыть главную страницу
- проверить `GET /health`
- проверить GitHub login
- проверить `/match`
- проверить `/teams`
- проверить `/applications`
