# SkillHub — Чеклисты по участникам

---

# Чеклист: Даниэл (Backend)

## Блок 1 — Фундамент (0–6ч)
- [x] Express-сервер, структура папок
- [x] Env-конфиг, CORS
- [ ] PostgreSQL: таблицы users(userRole), profiles(specializationRole, claimedGrade), ratings(gradingContext)
- [ ] Миграции (или SQL-скрипт)
- [ ] GitHub OAuth (Passport): /auth/github, /auth/github/callback
- [ ] OAuth scopes: public_repo + user:email
- [x] GET /auth/me
- [x] Middleware авторизации
- [x] `npm run dev` поднимает API

## Блок 2 — Профиль + AI (6–12ч)
- [ ] Интеграция YandexGPT API (тестовый запрос)
- [ ] Промпт system + user (по PRODUCT_SPEC_FULL §5.3)
- [ ] Парсинг JSON-ответа → score, strengths, improvements
- [x] PUT /profile (создание/обновление профиля, claimedGrade)
- [x] POST /profile/score (лимит 1 раз в 7 дней, 429 + nextAllowedAt)
- [x] GET /profile (свой профиль)
- [x] GET /profile/:userId (публичный профиль)
- [x] GET /users/:id (summary)
- [ ] Сохранение рейтинга в ratings

## Блок 3 — Поиск (12–15ч)
- [x] GET /users с фильтрами: role, minRating, stack, page, limit
- [x] grade фильтрует по claimedGrade, page=1/limit=20 по умолчанию
- [x] Пагинация

## Блок 4 — PRO + Applications (16–21ч)
- [x] Поле is_pro в users
- [x] Логика contactVisible (viewer.isPro + target rating ≥ 80)
- [x] strengths/improvements видны только PRO
- [x] POST /applications
- [x] GET /applications (входящие + исходящие)
- [x] PATCH /applications/:id (принять/отклонить)
- [x] teams/team_members/applications схемы с timestamps и UNIQUE(team_id, user_id)
- [ ] Эндпоинт «стать PRO» (заглушка для демо)

## Блок 5 — Деплой (21–26ч)
- [ ] Деплой backend (Railway / Render / Yandex Cloud)
- [ ] Публичный URL API
- [ ] 404/403/429/503 error responses оформлены

## Блок 6 — Финал (26–30ч)
- [ ] README с инструкцией запуска
- [ ] MIT-лицензия
- [ ] .env.example с перечнем переменных
- [ ] Репозиторий соответствует требованиям хакатона

---

# Чеклист: Денис (Frontend)

## Блок 1 — Фундамент (0–6ч)
- [x] Vite + React + Tailwind
- [x] React Router, base layout
- [x] LoginPage с кнопкой демо-входа вместо GitHub OAuth
- [x] API client (fetch/axios), base URL
- [x] Вызов /auth/me после загрузки
- [x] Редирект: гость → /login, авторизован → /dashboard
- [x] Dashboard-заглушка (навигация)
- [x] SPA запускается

## Блок 2 — Профиль + AI (6–12ч)
- [x] ProfileEditPage: форма (role, claimedGrade, stack, bio, projectLinks, experienceYears, hackathonsCount)
- [x] Сохранение профиля через PUT /profile
- [x] ProfilePage: отображение рейтинга + блок рекомендаций для PRO
- [x] Кнопка «Получить рейтинг» → POST /profile/score
- [x] Loading state при скоринге
- [x] Обработка ошибок (лимит, сеть)
- [x] RatingBadge (число + цвет: 80+ lime, 50–79 amber, 0–49 red)
- [ ] RatingGauge (опционально)
- [x] Отображение strengths и improvements для PRO
- [x] Empty state, если профиля нет

## Блок 3 — Поиск (12–15ч)
- [x] SearchPage
- [x] UserCard (аватар, имя, роль, стек, рейтинг)
- [x] Лента карточек из GET /users
- [x] SearchFilters: роль, мин. рейтинг, стек
- [x] SearchFilters: grade
- [x] Фильтрация при изменении фильтров

## Блок 4 — PRO + Applications (16–21ч)
- [x] UserDetailPage (профиль пользователя)
- [x] Кнопка «Откликнуться» → модалка с сообщением
- [x] Затемнение/скрытие контакта для Free
- [x] Показ контакта если PRO и rating ≥ 80
- [x] Скрытие strengths/improvements для Free
- [x] ApplicationsPage: табы «Входящие» / «Исходящие»
- [x] Кнопки «Принять» / «Отклонить» для входящих
- [x] Обновление списка после действия
- [x] 404 page / error boundary для неизвестных маршрутов

## Блок 5 — Деплой (21–26ч)
- [ ] Кнопка «Импорт из GitHub» на ProfileEditPage
- [ ] Preview suggestedPrimaryStack / suggestedProjectLinks
- [ ] Деплой frontend (Vercel / Netlify / статика)
- [ ] Публичный URL SPA
- [ ] Адаптив (работа на мобилке)
- [ ] Пустые состояния (нет данных, нет рейтинга)

## Блок 6 — Финал (26–30ч)
- [ ] Фикс критичных багов после прогона
- [ ] Репетиция питча (знать свой блок)

---

# Чеклист: Дени (Integration & Demo)

## Блок 1 — Фундамент (0–6ч)
- [ ] Настройка env (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DATABASE_URL)
- [ ] .env.example с описанием переменных
- [ ] Проверка: OAuth callback URL в настройках GitHub App

## Блок 2 — Профиль + AI (6–12ч)
- [ ] 2–3 тестовых профиля (JSON) для проверки AI
- [ ] Прогон скоринга на тестовых данных
- [ ] Фикс промпта при некорректных ответах (если нужно)

## Блок 3 — Поиск (12–15ч)
- [ ] Seed-скрипт: 15–20 юзеров с профилями и рейтингами
- [ ] Разные роли: frontend, backend, fullstack, design
- [ ] Разброс рейтингов: от 45 до 92
- [ ] Проверка: лента показывает разнообразные карточки

## Блок 4 — PRO + Applications (16–21ч)
- [ ] Миграция: tables teams/team_members/applications (team_id, applicant_id, message, status, timestamps)
- [ ] Заглушка «Стать PRO» (UI-кнопка, передаёт на бэк)
- [x] Прогон полного флоу: отклик → уведомление → принятие/отклонение
- [x] Проверка: сценарий работает end-to-end

## Блок 5 — GitHub Import + Деплой (21–26ч)
- [x] Черновик UI для GitHub import в редактировании профиля
- [ ] POST /profile/import-github: вызовы GitHub API (user, repos, languages)
- [ ] Сохранение в profiles.github_data
- [x] CORS на проде (разрешён origin фронта)
- [ ] Проверка OAuth callback URL на проде
- [ ] Презентация: 8–10 слайдов (проблема, решение, демо, команда, CTA)
- [ ] Слайды готовы к показу

## Блок 6 — Финал (26–30ч)
- [ ] QR-код на деплой
- [ ] Проверка открытия с телефона
- [ ] Подготовка ответов на типовые вопросы жюри («А если…», «Как монетизация?»)
- [ ] Репетиция питча (знать свой блок)

---

# Общий чеклист (все)

- [ ] Репо: client/ и server/ в одном или раздельно
- [ ] Ветки: main, dev
- [ ] Чекпоинт 6ч: логин → dashboard работает
- [ ] Чекпоинт 12ч: профиль + AI-рейтинг работает
- [ ] Чекпоинт 15ч: лента с фильтрами работает
- [ ] Чекпоинт 21ч: отклики + PRO работают
- [ ] Чекпоинт 26ч: деплой + презентация готовы
- [ ] Чекпоинт 30ч: готово к защите
