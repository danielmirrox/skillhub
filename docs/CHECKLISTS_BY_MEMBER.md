# SkillHub — Чеклисты по участникам

---

# Чеклист: Даниэл (Backend)

## Блок 1 — Фундамент (0–6ч)
- [ ] Express-сервер, структура папок
- [ ] Env-конфиг, CORS
- [ ] PostgreSQL: таблицы users(userRole), profiles(specializationRole, claimedGrade), ratings(gradingContext)
- [ ] Миграции (или SQL-скрипт)
- [ ] GitHub OAuth (Passport): /auth/github, /auth/github/callback
- [ ] OAuth scopes: public_repo + user:email
- [ ] GET /auth/me
- [ ] Middleware авторизации
- [ ] `npm run dev` поднимает API

## Блок 2 — Профиль + AI (6–12ч)
- [ ] Интеграция YandexGPT API (тестовый запрос)
- [ ] Промпт system + user (по PRODUCT_SPEC_FULL §5.3)
- [ ] Парсинг JSON-ответа → score, strengths, improvements
- [ ] PUT /profile (создание/обновление профиля, claimedGrade)
- [ ] POST /profile/score (лимит 1 раз в 7 дней, 429 + nextAllowedAt)
- [ ] GET /profile (свой профиль)
- [ ] GET /profile/:userId (публичный профиль)
- [ ] GET /users/:id (summary)
- [ ] Сохранение рейтинга в ratings

## Блок 3 — Поиск (12–15ч)
- [ ] GET /users с фильтрами: role, minRating, stack, page, limit
- [ ] grade фильтрует по claimedGrade, page=1/limit=20 по умолчанию
- [ ] Пагинация

## Блок 4 — PRO + Applications (16–21ч)
- [ ] Поле is_pro в users
- [ ] Логика contactVisible (viewer.isPro + target rating ≥ 80)
- [ ] strengths/improvements видны только PRO
- [ ] POST /applications
- [ ] GET /applications (входящие + исходящие)
- [ ] PATCH /applications/:id (принять/отклонить)
- [ ] teams/team_members/applications схемы с timestamps и UNIQUE(team_id, user_id)
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
- [ ] Vite + React + Tailwind
- [ ] React Router, base layout
- [ ] LoginPage с кнопкой «Войти через GitHub»
- [ ] API client (fetch/axios), base URL
- [ ] Вызов /auth/me после загрузки
- [ ] Редирект: гость → /login, авторизован → /dashboard
- [ ] Dashboard-заглушка (навигация)
- [ ] SPA запускается

## Блок 2 — Профиль + AI (6–12ч)
- [ ] ProfileEditPage: форма (role, claimedGrade, stack, bio, projectLinks, experienceYears, hackathonsCount)
- [ ] Сохранение профиля через PUT /profile
- [ ] ProfilePage: отображение рейтинга + блок рекомендаций для PRO
- [ ] Кнопка «Получить рейтинг» → POST /profile/score
- [ ] Loading state при скоринге
- [ ] Обработка ошибок (лимит, сеть)
- [ ] RatingBadge (число + цвет: 80+ lime, 50–79 amber, 0–49 red)
- [ ] RatingGauge (опционально)
- [ ] Отображение strengths и improvements для PRO
- [ ] Empty state, если профиля нет

## Блок 3 — Поиск (12–15ч)
- [ ] SearchPage
- [ ] UserCard (аватар, имя, роль, стек, рейтинг)
- [ ] Лента карточек из GET /users
- [ ] SearchFilters: роль, мин. рейтинг, стек
- [ ] SearchFilters: grade
- [ ] Фильтрация при изменении фильтров

## Блок 4 — PRO + Applications (16–21ч)
- [ ] UserDetailPage (профиль пользователя)
- [ ] Кнопка «Откликнуться» → модалка с сообщением
- [ ] Затемнение/скрытие контакта для Free
- [ ] Показ контакта если PRO и rating ≥ 80
- [ ] Скрытие strengths/improvements для Free
- [ ] ApplicationsPage: табы «Входящие» / «Исходящие»
- [ ] Кнопки «Принять» / «Отклонить» для входящих
- [ ] Обновление списка после действия
- [ ] 404 page / error boundary для неизвестных маршрутов

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
- [ ] Прогон полного флоу: отклик → уведомление → принятие/отклонение
- [ ] Проверка: сценарий работает end-to-end

## Блок 5 — GitHub Import + Деплой (21–26ч)
- [ ] POST /profile/import-github: вызовы GitHub API (user, repos, languages)
- [ ] Сохранение в profiles.github_data
- [ ] CORS на проде (разрешён origin фронта)
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
