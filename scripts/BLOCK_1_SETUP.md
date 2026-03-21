# SkillHub — Блок 1. Фундамент (0–6ч)

## Дата: 21–22 марта 2026

---

## 📋 Чек-лист Дени на Блок 1

- [x] Создан `.env.example` с описанием переменных
- [x] Настроены все переменные окружения в `.env`
- [x] Локально проверена корректность OAuth callback URL в GitHub App / `.env`
- [x] Сервер Даниэла (express) стартует на `npm run dev` и отвечает на `/health`
- [x] Локальный демо-вход позволяет открыть dashboard и profile без GitHub OAuth
- [ ] БД PostgreSQL подключена и работает

---

## 🚀 Инструкция по настройке окружения

### Шаг 1: Получить GitHub OAuth Credentials

1. Перейди на https://github.com/settings/developers
2. Нажми **OAuth Apps** → **New OAuth Application**
3. Заполни форму:
   - **Application name:** `SkillHub MVP` (или другое)
   - **Homepage URL:** `http://localhost:5173` (frontend URL)
   - **Authorization callback URL:** `http://localhost:5000/auth/github/callback` (server callback)
4. Скопируй:
   - **Client ID** → `GITHUB_CLIENT_ID`
   - **Client Secret** → `GITHUB_CLIENT_SECRET`

### Шаг 2: Получить Yandex Cloud Credentials

1. Перейди на https://console.yandex.cloud
2. Создай или выбери проект
3. Перейди в **API Gateways** или **YandexGPT API**
4. Создай API ключ → скопируй в `YANDEXGPT_API_KEY`
5. Найди ID папки (Folder ID) → скопируй в `YANDEXGPT_FOLDER_ID`

### Шаг 3: PostgreSQL (локально, Windows)

#### 3.1 Установи PostgreSQL

1. Скачай инсталлятор с https://www.postgresql.org/download/windows/
2. Во время установки запомни:
   - пароль пользователя `postgres`
   - порт (обычно `5432`)
3. Проверь, что служба запущена:
   - `Win + R` → `services.msc`
   - служба `postgresql-x64-XX` должна быть в статусе `Running`

#### 3.2 Создай БД и пользователя

Вариант A (через psql):

```powershell
psql -U postgres -h localhost -p 5432
```

Внутри `psql` выполни:

```sql
CREATE DATABASE skillhub;
CREATE USER skillhub_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE skillhub TO skillhub_user;
```

Вариант B (одной командой из PowerShell):

```powershell
psql -U postgres -h localhost -p 5432 -f scripts/local-postgres-setup.sql
```

#### 3.3 Проверь подключение от нового пользователя

```powershell
psql "postgresql://skillhub_user:password123@localhost:5432/skillhub" -c "SELECT current_database(), current_user;"
```

Если получил строку с `skillhub` и `skillhub_user`, всё ок.

#### 3.4 Пропиши DATABASE_URL

В `server/.env`:

```env
DATABASE_URL=postgresql://skillhub_user:password123@localhost:5432/skillhub
```

### Шаг 4: Создать .env файл

**Вариант 1: Интерактивная настройка (рекомендуется)**
```bash
node scripts/setup-env.js
```

**Вариант 2: Ручная копия**
```bash
cp server/.env.example server/.env
# Потом отредактируй server/.env в текстовом редакторе
```

### Шаг 5: Проверить окружение

```bash
node scripts/check-env.js
```

Если все переменные зелёные (✅), можно двигаться дальше!

---

## 📌 Что должно быть к концу Блока 1

✅ `.env.example` создан с описанием  
✅ `.env` заполнен корректными значениями  
✅ `npm run dev` в `server/` поднимает API  
✅ Демо-вход в клиенте работает и открывает другие экраны без GitHub  
✅ БД подключена (можно проверить подключением через psql)  
✅ OAuth callback URL в GitHub App совпадает с `GITHUB_CALLBACK_URL` в `.env`

---

## 🔧 В каких файлах это использует

- **server/.env** — все переменные для Express + API
- **scripts/setup-env.js** — помощь при настройке (ты)
- **scripts/check-env.js** — проверка (ты)
- **Даниэл:** будет читать переменные из `.env` в своих скриптах

---

## ✏️ Примеры значений

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://skillhub_user:password123@localhost:5432/skillhub
GITHUB_CLIENT_ID=Ive123456abcdef789012
GITHUB_CLIENT_SECRET=your_secret_key_123456789
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
YANDEXGPT_API_KEY=AQVNz1234567890abcdef
YANDEXGPT_FOLDER_ID=b1a234567890abcdef
JWT_SECRET=generated_auto_or_your_random_string
CLIENT_URL=http://localhost:5173
CLIENT_URLS=
```

---

## 📞 Вопросы/проблемы?

- **OAuth не работает?** Проверь точное совпадение `GITHUB_CALLBACK_URL` в `.env` и в GitHub App settings
- **БД не подключается?** Проверь `DATABASE_URL` — правильно ли значение user:password@host:port/dbname
- **YandexGPT ошибка?** Убедись, что API ключ и Folder ID из одного проекта Yandex Cloud

---

## 🎯 Контрольная точка 6ч

Когда будет готово всё что выше, переходи на **Блок 2 — Профиль + AI (6–12ч)**

---

## ▶️ Дальнейшие шаги после локального PostgreSQL

1. Проверь env:

```powershell
node scripts/check-env.js
```

2. Подними сервер:

```powershell
cd server
npm install
npm run dev
```

3. Проверь, что API живой (минимум `/auth/me` должен отвечать 401/200, но не 500).

4. Как только сервер стабильно стартует, переходи на Блок 2 по твоей зоне:
   - подготовить 2–3 тестовых профиля (JSON)
   - прогнать AI-скоринг на них
   - зафиксировать кейсы, где ответ AI ломает JSON
