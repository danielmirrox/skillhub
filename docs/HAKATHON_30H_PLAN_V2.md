# SkillHub — План на 30ч для троих (Full Spec)

> Legacy planning material. This file is archived and does not define current product scope.

**Хакатон Viribus · 21–22 марта 2026**  
**Основа:** PRODUCT_SPEC_FULL.md

---

## Распределение ролей (без отдельного дизайнера)

| Участник | Роль | Зона ответственности |
|----------|------|----------------------|
| **Даниэл** | Backend | API, БД, Auth, YandexGPT, деплой |
| **Денис** | Frontend | React, страницы, компоненты, API-клиент, UI (Tailwind — минимально) |
| **Дени** | Integration & Demo | GitHub API-парсинг, seed-данные, applications (бэк), деплой, презентация, pitch |

> Дизайн — минимально: темная тема + Tailwind + компоненты из библиотеки (shadcn/ui или подобное). Визуал можно допилить нейронкой позже.

---

## Структура 30 часов

**День 1:** 15ч  
**День 2:** 15ч  
**Последние 2ч** — только стабилизация и питч, без новых фич.

---

# ДЕНЬ 1 — Суббота (0–15ч)

## Блок 1: Фундамент (0–6ч)

| Час | Задача | Кто | Результат |
|-----|--------|-----|-----------|
| **0** | Репо GitHub, структура (client/, server/), .gitignore, README | Все вместе | Репо, ветки main/dev |
| **0–2** | **Даниэл:** Express, структура сервера, env, CORS | Даниэл | `npm run dev` поднимает API |
| **0–2** | **Денис:** Vite + React + Tailwind, роутинг, base layout | Денис | SPA запускается |
| **1–3** | **Даниэл:** PostgreSQL — users(userRole), profiles(specializationRole, claimedGrade), ratings(gradingContext) (по spec §3) | Даниэл | Миграции, таблицы |
| **2–4** | **Даниэл:** GitHub OAuth (Passport), /auth/github, /auth/github/callback | Даниэл | Вход через GitHub |
| **2–4** | **Дени:** Настройка env (GITHUB_CLIENT_ID, DATABASE_URL), .env.example | Дени | Env готов |
| **3–5** | **Денис:** LoginPage, кнопка «Войти через GitHub» | Денис | Редирект на OAuth |
| **4–6** | **Даниэл:** GET /auth/me, middleware auth | Даниэл | API отдаёт текущего юзера |
| **5–6** | **Денис:** API client (fetch/axios), вызов /auth/me, редирект после логина, Dashboard-заглушка | Денис | Полный цикл: логин → dashboard |

**Чекпоинт 6ч:** Юзер логинится через GitHub и видит dashboard.

---

## Блок 2: Профиль + AI-скоринг (6–12ч)

| Час | Задача | Кто | Результат |
|-----|--------|-----|-----------|
| **6–7** | **Даниэл:** YandexGPT API — тестовый запрос, формат из spec §5 | Даниэл | API отвечает |
| **6–8** | **Денис:** ProfileEditPage — форма (role, claimedGrade, stack, bio, projectLinks, experienceYears, hackathonsCount) | Денис | Форма + локальный state |
| **7–8** | **Даниэл:** Промпт-инжиниринг (system + user по spec §5.3), парсинг JSON | Даниэл | Score 0–100 из ответа |
| **7–9** | **Дени:** Написать 2–3 тестовых профиля (JSON) для проверки AI | Дени | Тест-кейсы |
| **8–10** | **Даниэл:** PUT /profile, POST /profile/score, сохранение в ratings, лимит 1/7д, 429 + nextAllowedAt | Даниэл | Эндпоинты работают |
| **9–11** | **Денис:** ProfilePage — отображение рейтинга, кнопка «Получить рейтинг», loading, ошибки, блок рекомендаций для PRO | Денис | UX скоринга |
| **10–11** | **Даниэл:** GET /profile (свой), GET /profile/:userId (публичный), GET /users/:id (summary), PRO-фильтр для strengths/improvements | Даниэл | Полная спецификация |
| **11–12** | **Денис:** RatingBadge, RatingGauge (цвет по диапазону: 80+ lime, 50–79 amber, 0–49 red) | Денис | Визуал рейтинга |
| **11–12** | **Дени:** Проверка скоринга на тестовых данных, фикс промпта при необходимости | Дени | AI стабильно пашет |

**Чекпоинт 12ч:** Профиль заполняется, AI выдаёт рейтинг 0–100; strengths/improvements доступны для PRO, лимит и nextAllowedAt работают.

---

## Блок 3: Лента и поиск (12–15ч)

| Час | Задача | Кто | Результат |
|-----|--------|-----|-----------|
| **12–13** | **Даниэл:** GET /users с фильтрами (role, minRating, stack, page, limit) по spec §4.4 | Даниэл | API поиска |
| **12–14** | **Дени:** Seed-скрипт — 15–20 юзеров с профилями и рейтингами | Дени | Демо-лента заполнена |
| **13–14** | **Денис:** SearchPage, UserCard, лента карточек | Денис | Лента отображается |
| **14–15** | **Денис:** SearchFilters — роль, мин. рейтинг, стек | Денис | Фильтрация работает |
| **14–15** | **Дени:** Убедиться что seed покрывает разные роли и рейтинги | Дени | Реалистичное демо |

**Чекпоинт 15ч:** Лента с фильтрами, 15+ карточек в выдаче.

---

# ДЕНЬ 2 — Воскресенье (16–30ч)

## Блок 4: PRO + Applications (16–21ч)

| Час | Задача | Кто | Результат |
|-----|--------|-----|-----------|
| **16–17** | **Даниэл:** is_pro в users, логика contactVisible (viewer.isPro + target rating≥80) | Даниэл | PRO-логика |
| **16–18** | **Дени:** Таблицы teams, team_members, applications (team_id, applicant_id, status, timestamps, UNIQUE(team_id,user_id)) | Дени | Схема + миграция |
| **17–18** | **Даниэл:** POST /applications, GET /applications, PATCH /applications/:id, 404/403 ответы | Даниэл | API откликов |
| **18–19** | **Денис:** UserDetailPage — профиль, кнопка «Откликнуться», затемнение контакта для Free | Денис | Отклик работает |
| **18–20** | **Дени:** Заглушка «Стать PRO» (кнопка без оплаты) | Дени | UI для монетизации |
| **19–20** | **Даниэл:** Эндпоинт «стать PRO» — выставляет is_pro=true (демо) | Даниэл | Можно «включить» PRO |
| **20–21** | **Денис:** ApplicationsPage — входящие/исходящие, кнопки принять/отклонить | Денис | Управление откликами |
| **20–21** | **Дени:** Проверка полного флоу: отклик → уведомление → принятие | Дени | Сценарий работает |

**Чекпоинт 21ч:** PRO-эмуляция, отклики, принять/отклонить.

---

## Блок 5: GitHub Import + деплой (21–26ч)

| Час | Задача | Кто | Результат |
|-----|--------|-----|-----------|
| **21–23** | **Дени:** POST /profile/import-github — вызовы GitHub API (user, repos, languages), сохранение в github_data + suggestedPrimaryStack | Дени | Импорт из GitHub |
| **22–23** | **Денис:** Кнопка «Импорт из GitHub» на ProfileEditPage | Денис | Юзер может подтянуть данные |
| **23–24** | **Даниэл:** Деплой backend (Railway/Render/Yandex Cloud) | Даниэл | API в облаке |
| **23–24** | **Денис:** Деплой frontend (Vercel/Netlify или статика на тот же хост) | Денис | SPA в облаке |
| **24–25** | **Дени:** CORS, env на проде, проверка OAuth callback URL, GitHub cache fallback | Дени | Всё работает по ссылке |
| **24–26** | **Дени:** Презентация (Google Slides / Figma) — 8–10 слайдов по spec | Дени | Питч готов |
| **25–26** | **Денис:** Адаптив, 404/error states, пустые состояния | Денис | Работает на мобилке |

**Чекпоинт 26ч:** Деплой, импорт GitHub, презентация.

---

## Блок 6: Питч и стабилизация (26–30ч)

| Час | Задача | Кто | Результат |
|-----|--------|-----|-----------|
| **26–27** | Репетиция питча (3–5 мин), распределение слайдов | Все | Каждый знает блок |
| **27–28** | Прогон демо, фикс критичных багов | Все | Демо не падает |
| **28–29** | QR-код на деплой, проверка с телефона | Дени | Жюри может потрогать |
| **29–30** | README, MIT-лицензия, .env.example | Даниэл | Репо соответствует требованиям |
| **29–30** | Подготовка ответов на вопросы жюри | Дени | «А если…» — есть ответы |

**Чекпоинт 30ч:** Готово к защите.

---

# Сводка по ролям

## Даниэл (Backend)

| Блок | Задачи |
|------|--------|
| 1 | Express, БД, GitHub OAuth, /auth/me |
| 2 | YandexGPT, промпт, PUT/POST /profile, POST /profile/score |
| 3 | GET /users с фильтрами |
| 4 | is_pro, contactVisible, applications API |
| 5 | Деплой backend |
| 6 | README, лицензия |

## Денис (Frontend)

| Блок | Задачи |
|------|--------|
| 1 | Vite, React, Tailwind, LoginPage, Dashboard |
| 2 | ProfileEditPage, ProfilePage, RatingBadge, RatingGauge |
| 3 | SearchPage, UserCard, SearchFilters |
| 4 | UserDetailPage, ApplicationsPage, PRO-блокировка контактов |
| 5 | Кнопка импорт GitHub, деплой frontend, адаптив |
| 6 | Багфиксы |

## Дени (Integration & Demo)

| Блок | Задачи |
|------|--------|
| 1 | Env, .env.example |
| 2 | Тест-профили для AI, проверка скоринга |
| 3 | Seed-скрипт (15–20 юзеров) |
| 4 | Таблица applications, «Стать PRO», проверка флоу |
| 5 | POST /profile/import-github (GitHub API), CORS, презентация |
| 6 | QR-код, ответы жюри |

---

# Чеклист MVP (по full spec)

- [ ] Auth: GitHub OAuth, /auth/me
- [ ] Profile: GET/PUT /profile, форма редактирования
- [ ] Scoring: POST /profile/score, YandexGPT, strengths/improvements
- [ ] Search: GET /users, фильтры role/minRating/stack
- [ ] Applications: POST/GET/PATCH
- [ ] PRO: contactVisible при is_pro и rating≥80
- [ ] Import: POST /profile/import-github (опционально, если успеем)
- [ ] Seed: 15+ демо-профилей
- [ ] Deploy: API + SPA доступны по URL
- [ ] Repo: MIT, README
- [ ] Pitch: 8–10 слайдов, QR на демо

---

# Приоритеты при нехватке времени

1. **Критично:** Auth, профиль, скоринг, лента, фильтры.
2. **Важно:** Applications, PRO-эмуляция.
3. **Желательно:** Import из GitHub.
4. **Можно срезать:** Детальный PRO-UI, лишние экраны.

---

*Дизайн — по минимуму. Функционал и демо — в приоритете.*
