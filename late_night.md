# Late Night Audit

Дата: 2026-03-21

## Рабочий план по приоритетам

Ниже не просто аудит, а порядок больших изменений. Идём сверху вниз и не распыляемся, пока не закрыт текущий уровень.

### Уже закрыто

- Нормализация `VITE_API_URL` для GitHub login и всех API-запросов.
- Разделение реального входа и demo-fallback на клиенте.
- Флаг `VITE_ENABLE_DEMO_AUTH` для локальной разработки и smoke-сборки.
- Smoke-сборка переведена на безопасный запуск и снова проходит.
- YandexGPT smoke с реальным запросом проходит при `SMOKE_YANDEXGPT=1`.
- Добавлен базовый набор настоящих иконок для входа, хедера, поиска, команд, профиля и paywall.
- Почищены основные экраны от части внутренних и демо-ярлыков.
- Последние внутренние формулировки на публичных экранах и в ответе PRO-апгрейда заменены на продуктовые.
- Подчищены остаточные локальные формулировки на главной, входе, дашборде и paywall.
- Упрощены главная, вход и paywall; из профиля убраны видимые demo-подсказки.
- Убраны повторяющиеся AI-пояснения из экрана поиска.
- Сокращены лишние быстрые действия на дашборде.
- В профиле и рейтинге убраны остаточные demo-формулировки.
- OAuth-пути исключены из глобального rate-limit, а кнопки входа получили защиту от двойного клика.
- Канонический GitHub callback выровнен на `/api/v1/auth/github/callback`.
- Добавлены плавное мобильное меню и мягкий переход страниц между маршрутами.
- Добавлены базовые touch/mobile polish-правки для кнопок и скролла.
- Улучшены мобильные пропорции и уплотнена сетка на главных экранах.
- Выравнен мобильный spacing-scale для карточек поиска, профиля и paywall.
- Дожаты summary-блок поиска, карточки команд, rating-панель профиля и мобильная модалка создания команды.
- Мобильное меню переведено на fixed drawer с fade/slide анимацией вместо рваного max-height.
- Для VM подготовлен `docker compose`-путь с Postgres, backend и фронтендом через nginx.
- `COOKIE_SECURE` добавлен в конфиг и документацию для HTTP/HTTPS переключения.
- `docker compose config` проходит и подтверждает валидность релизной схемы.
- Healthcheck теперь показывает не только базовый статус, но и OAuth / cookie / YandexGPT конфиги.

### P0. Разделить реальный вход и demo-режим

- [x] Убрать silent demo-fallback из реального auth-path.
- [x] Нормализовать `VITE_API_URL`, чтобы GitHub login не получал двойной `/api/v1`.
- [x] Оставить demo только для smoke и локальной разработки.
- [x] Проверить, что сервер не доверяет demo-заголовку в production.
- [x] Сделать понятный empty/onboarding state для первого OAuth-пользователя.

Критерий готовности:
- GitHub login ведёт только в реальный flow.
- Demo больше не маскирует ошибки входа.
- Новый пользователь не выглядит как “сломанный пустой профиль”.

### P1. Почистить интерфейс до продуктового уровня

- [x] Убрать из основного UX слова `demo`, `mock`, `smoke`, `MVP`, если они не нужны пользователю.
- [x] Сократить лишние карточки, бейджи и вторичные CTA.
- [x] Упростить главную, вход, профиль и поиск до одного основного сценария на экран.
- [x] Привести команды, paywall и профиль к более строгой визуальной подаче.
- [x] Добавить настоящие иконки на ключевые действия.
- [x] Уплотнить мобильную иерархию ключевых экранов, чтобы hero и карточки не выглядели тяжело на телефоне.
- [x] Добавить плавное мобильное меню и легкий page transition между экранами.
- [x] Добавить базовые touch/mobile polish-правки для кнопок и скролла.

Критерий готовности:
- Визуально продукт выглядит собранным и спокойным.
- На экране нет ощущения, что это внутренняя сборка.
- Основные действия читаются за 1-2 секунды.

### P1. Закрыть релизный контур

- [x] Сделать один понятный production path для VM.
- [x] Подготовить `docker-compose` или `systemd + nginx` как финальный способ запуска.
- [x] Добавить/обновить `.env.example`, чтобы не было двусмысленности в конфиге.
- [ ] Живой релизный прогон на стенде:
  - [ ] Проверить GitHub OAuth на реальном callback URL и убедиться, что сессия создаётся и восстанавливается корректно.
  - [ ] Проверить logout и повторный вход без ручной очистки `localStorage` и cookies.
  - [ ] Проверить Postgres на живом запуске: данные, seed и сохранение после перезапуска контейнера или сервиса.
  - [ ] Проверить `GET /health` на живом запуске и убедиться, что статусы DB / auth / YandexGPT читаются корректно.
  - [ ] Проверить YandexGPT scoring на реальных credentials и убедиться, что JSON-парсинг не ломается.
  - [ ] Проверить мобильную версию ключевых экранов: login, home, dashboard, search, profile, teams, paywall.
  - [ ] Проверить соответствие `CLIENT_URL` / `GITHUB_CALLBACK_URL` публичному домену и корректные cookie-флаги `Secure` / `SameSite`.
  - [ ] Убедиться, что demo-режим не включается в production и не подменяет реального пользователя.
- [x] Зафиксировать smoke-процесс как обязательную проверку перед показом.
- [x] Чтоб при входе в окно создания хакатона нельзя было прокручивать остальной фон позади окна
- [x] Лимит скоринга исчерпан. Следующая попытка: 2026-03-28T19:49:59.557Z. Вот тут сократить дату до минуты, меньшее не показывать

Критерий готовности:
- Проект можно поднять по одной инструкции.
- Нет разрыва между документацией и тем, как оно реально стартует.
- Базовый smoke проходит на живых данных.
- Реальный стенд подтверждает, что auth, Postgres, YandexGPT и healthcheck работают вместе.
- Ключевые экраны выглядят нормально на телефоне.

### P2. Довести backend-фичи до видимого UX

- [x] Сделать GitHub import понятным и заметным в интерфейсе.
- [x] Решить, какие API оставить как внутренние, а какие показать пользователю.
- [x] Проверить все списки и карточки на реальных данных, а не на пустых состояниях.
- [x] Упростить paywall до аккуратного placeholder-сценария.
- [x] Модалка создания хакатона блокирует фон и скроллится внутри на маленьких экранах.

Критерий готовности:
- Backend-эндпоинты соответствуют тому, что видит пользователь.
- Нет ощущения “API есть, а продукта нет”.

### P2. Документация и хвосты

- [x] Синхронизировать `README` и `docs` с текущим кодом.
- [x] Пометить старые pitch/hackathon материалы как legacy.
- [x] Убрать лишнее дублирование между документами.
- [x] Оставить один источник правды для релиза и один для локального запуска.
- [x] Поменять в хедере хакатон-матчинг на айти-матчинг и уменьшить расстояние между символами
- [x] Добавить поддержку правильного количества участников, не 1 участников а 1 участник и т.д
- [ ] Подготовить основной логотип приложения: mark, wordmark и favicon.

Критерий готовности:
- Документация отвечает текущему состоянию, а не прошлым планам.
- У команды один понятный маршрут по проекту.

### Что делаем первым

1. Auth и demo separation.
2. Нормализация URL и поток GitHub login.
3. Onboarding для нового пользователя.
4. Уборка лишнего из основных экранов.
5. Релизный запуск на VM.
6. Документация и полировка.

## Что сломано и почему

### 1. GitHub login может уходить в `NOT_FOUND`

Симптом:
- при нажатии входа в GitHub иногда получаем `{"error":"NOT_FOUND","message":"Route not found."}`

Причина:
- фронт строит URL как `${API_BASE_URL}/api/v1/auth/github`
- если `VITE_API_URL` уже содержит `/api/v1`, получается двойной префикс
- в таком случае запрос уходит не туда и попадает в 404

Где смотреть:
- [client/src/api/client.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\client.ts)
- [client/src/pages/LoginPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\LoginPage.tsx)
- [client/src/pages/HomePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\HomePage.tsx)

### 2. Реальный вход маскируется demo-fallback

Симптом:
- после сбоя auth кажется, что пользователь "уже вошёл", но это может быть demo-аккаунт
- на экране иногда висит не тот пользователь, который ожидался

Причина:
- `getCurrentUser()` сначала ходит в `/api/v1/auth/me`
- если запрос падает, он молча возвращает demo-user из `localStorage`
- `apiGet()` добавляет `x-demo-user-id` почти во все запросы
- сервер доверяет `x-demo-user-id` как источнику пользователя

Где смотреть:
- [client/src/api/auth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\auth.ts)
- [client/src/api/client.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\client.ts)
- [server/src/middleware/auth.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\middleware\auth.js)
- [client/public/smoke.html](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\public\smoke.html)

### 3. По умолчанию подставляется demo-user

Симптом:
- при локальных проверках постоянно всплывает один и тот же пользователь

Причина:
- demo-аккаунты захардкожены в client-side demo auth
- smoke-helper сам пишет demo-пользователя в `localStorage`
- кнопки демо-входа в login специально переключают на этих пользователей

Где смотреть:
- [client/src/api/demoAuth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\demoAuth.ts)
- [client/src/pages/LoginPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\LoginPage.tsx)
- [client/public/smoke.html](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\public\smoke.html)

### 4. Пустые users и teams на вкладках

Симптом:
- вкладки пользователей и команд выглядят пустыми или почти пустыми

Причина:
- это не обязательно проблема БД
- чаще всего это следствие:
  - неправильного `VITE_API_URL`
  - demo-auth вместо реальной сессии
  - нового OAuth-пользователя с пустым профилем

Пояснение:
- seed в проекте есть
- backend умеет сеедить Postgres
- но у нового OAuth-пользователя профиль создаётся с пустыми значениями по умолчанию

Где смотреть:
- [server/src/data/demoStore.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\data\demoStore.js)
- [server/src/data/db.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\data\db.js)
- [scripts/seed.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\scripts\seed.js)

### 5. Новый OAuth-пользователь стартует с пустым профилем

Симптом:
- после первого GitHub login видны пустые role, grade, stack, bio

Причина:
- профиль создаётся автоматически
- значения по умолчанию: `role = other`, `claimedGrade = junior`, пустой стек, пустой bio

Где смотреть:
- [server/src/data/demoStore.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\data\demoStore.js)

### 6. В проекте остался demo-слой, который мешает понять реальный auth-flow

Симптом:
- сложно сразу понять, где реальный вход, а где демо-режим

Причина:
- demo-слой не отделён от production-логики достаточно жёстко
- он нужен для локальной работы, но вносит путаницу при защите

Где смотреть:
- [client/src/api/demoAuth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\demoAuth.ts)
- [client/src/api/auth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\auth.ts)
- [server/src/middleware/auth.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\middleware\auth.js)

## Что надо сделать дальше

1. Нормализовать `VITE_API_URL`, чтобы он был только базовым origin, без `/api/v1`.
2. Убрать silent fallback на demo-user из реального auth-path.
3. Явно отделить demo-режим от production-входа.
4. Сделать onboarding для нового OAuth-пользователя, чтобы профиль не выглядел пустым.
5. Проверить, что список users/teams идёт с живой сессией, а не с `x-demo-user-id`.
6. Для smoke и локалки оставить demo-flow, но не использовать его как скрытый fallback в реальном логине.

## Короткий итог

Проблема сейчас не в одном месте.
Это связка из:
- demo-fallback на клиенте
- доверия к `x-demo-user-id` на сервере
- неочевидного `VITE_API_URL`
- пустого профиля у нового OAuth-пользователя

Если убрать эту связку, логин и списки станут предсказуемыми.

## UI/UX Аудит

Ниже именно продуктовый аудит: что мешает воспринимать SkillHub как серьёзный MVP, который можно уверенно показывать на защите или как основу для прода.

### P0. Убрать всё, что выдаёт демо-режим в пользовательском интерфейсе

Что мешает:
- на экранах видны формулировки `MVP`, `Mock`, `демо`, `PRO-демо`, `демо-пользователь`
- LoginPage предлагает сразу несколько путей: GitHub, обычный demo, PRO demo, reset demo
- ProfilePage показывает текущего demo-пользователя как отдельную сущность
- PaywallPage прямо говорит, что это мок, и слишком явно демонстрирует незавершённость

Почему это плохо:
- пользователь видит не продукт, а внутреннюю сборку
- на защите это снижает доверие и создаёт впечатление временного прототипа
- визуально и смыслово смешиваются production-flow и local-test-flow

Что нужно сделать:
- оставить demo только для локальной разработки
- убрать demo-кнопки из боевого UX
- скрыть любые упоминания `demo`, `mock`, `smoke` из основных экранов
- в production показывать только один путь: реальный GitHub login

Где смотреть:
- [client/src/pages/LoginPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\LoginPage.tsx)
- [client/src/pages/ProfilePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ProfilePage.tsx)
- [client/src/pages/PaywallPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\PaywallPage.tsx)
- [client/public/smoke.html](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\public\smoke.html)

### P0. Сократить визуальный шум и унифицировать дизайн-систему

Что мешает:
- почти каждый экран собран из множества стеклянных карточек, градиентов и свечений
- hero-блоки, статистика, статусы, бейджи и подсказки конкурируют друг с другом
- одинаковые по смыслу элементы оформлены по-разному
- на экране много декоративных поверхностей, но мало структурной иерархии

Почему это плохо:
- интерфейс выглядит эффектно, но не собранно
- у пользователя уходит внимание на оформление вместо сценария
- для серьёзной подачи нужен более строгий ритм: один главный блок, один второстепенный, один action

Что нужно сделать:
- сократить количество градиентов и glow-эффектов
- оставить 1-2 фирменных акцента, а не применять их на каждом экране
- унифицировать карточки, бейджи, кнопки и пустые состояния
- выстроить один визуальный язык для hero, list, detail и form screens

Где смотреть:
- [client/src/components/layout/Layout.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\components\layout\Layout.tsx)
- [client/src/pages/HomePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\HomePage.tsx)
- [client/src/pages/DashboardPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\DashboardPage.tsx)
- [client/src/pages/SearchPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\SearchPage.tsx)
- [client/src/pages/TeamsPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\TeamsPage.tsx)

### P1. Упростить главную и вход

Что мешает:
- HomePage и LoginPage дублируют часть смысла
- до входа пользователь видит слишком много объяснений, карточек и вторичных CTA
- главная страница рассказывает о продукте, но не ведёт к одному ясному действию
- на login-экране много текста о том, что уже и так понятно из хедера

Почему это плохо:
- человек не понимает, что делать первым шагом
- поток “зашёл → понял → вошёл” слишком длинный
- серьёзному продукту нужна более короткая и уверенная точка входа

Что нужно сделать:
- оставить одну главную CTA-кнопку
- сократить количество вторичных описаний
- убрать дублирование между HomePage и LoginPage
- сделать так, чтобы до входа и после входа продукт ощущался одной системой, а не двумя разными лендингами

Где смотреть:
- [client/src/pages/HomePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\HomePage.tsx)
- [client/src/pages/LoginPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\LoginPage.tsx)
- [client/src/components/layout/Layout.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\components\layout\Layout.tsx)

### P1. Уплотнить dashboard и профиль

Что мешает:
- Dashboard перегружен картами, quick actions и повторяющимися статусами
- ProfilePage смешивает статус, PRO-превью, demo-banner, рейтинг, рекомендации и форму мотивации в одном экране
- важные действия теряются среди второстепенных блоков

Почему это плохо:
- экран выглядит как “много всего сразу”, а не как путь к следующему действию
- у пользователя нет одного очевидного приоритета
- для прода лучше один сильный сценарий: заполнить профиль, получить рейтинг, открыть контакты, перейти в поиск или команду

Что нужно сделать:
- на dashboard оставить короткий summary + 2-3 главных action
- перенести вторичные заметки в менее заметный блок или скрыть их до необходимости
- на profile сделать явную иерархию: статус профиля → рейтинг → сильные стороны → следующий шаг
- убрать любые визуальные вставки, которые комментируют демо-режим

Где смотреть:
- [client/src/pages/DashboardPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\DashboardPage.tsx)
- [client/src/pages/ProfilePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ProfilePage.tsx)

### P1. Сделать поиск более строгим и более “продуктовым”

Что мешает:
- SearchPage содержит слишком много пояснительных блоков вокруг результата
- AI-релевантность повторяется несколько раз: в шапке, в статичном баннере и в карточке
- карточка пользователя показывает одновременно статус контакта, рейтинг, релевантность и набор бейджей

Почему это плохо:
- визуальная иерархия размывается
- главное действие поиска должно быть быстрее: фильтр → список → открытие профиля
- “AI-рейтинг” нужен как полезный сигнал, а не как декоративный слой на каждом уровне

Что нужно сделать:
- оставить один сильный AI-акцент на экран и один на карточку
- убрать дублирующие пояснения
- увеличить читаемость карточек за счёт более спокойной композиции
- лучше отделить вторичный контент от основного результата

Где смотреть:
- [client/src/pages/SearchPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\SearchPage.tsx)
- [client/src/components/search/UserCard.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\components\search\UserCard.tsx)

### P1. Привести команды к более серьёзной подаче

Что мешает:
- TeamCard использует много декоративных акцентов, badge-слоёв и цветовых вариаций
- PRO-буст виден, но остальная лента тоже слишком “шумная”
- форма создания команды выглядит как dev-form, а не как продуктовый сценарий

Почему это плохо:
- команда должна продаваться через ясность: кто, кого, зачем, сколько мест осталось
- сейчас блоки соревнются за внимание с самой сутью команды
- карточка и модалка воспринимаются как прототип, а не как финальный продукт

Что нужно сделать:
- сделать одну строгую карточку с сильным заголовком, ролью, слотом и одним CTA
- PRO-буст оставить как один акцент, без лишней декоративности
- форму создания команды сократить до обязательных полей и прогрессивно раскрывать остальное
- убрать из формы техническое ощущение “админки”

Где смотреть:
- [client/src/pages/TeamsPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\TeamsPage.tsx)
- [client/src/components/teams/TeamFormModal.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\components\teams\TeamFormModal.tsx)

### P2. Убрать языковую и терминологическую мешанину

Что мешает:
- в интерфейсе одновременно живут русский, английский и внутренние технические термины
- встречаются `AI insight`, `Score`, `PRO-viewer`, `Ready`, `applications`, `GitHub visible`
- часть экранов говорит на языке продукта, часть — на языке внутренней разработки

Почему это плохо:
- это режет ощущение цельности
- для серьёзной подачи нужен один тон и одна терминология

Что нужно сделать:
- перевести пользовательский интерфейс на один язык
- оставить английский только там, где это часть контекста модели или интеграции
- заменить внутренние термины на продуктовые формулировки

Где смотреть:
- [client/src/pages/UserDetailPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\UserDetailPage.tsx)
- [client/src/pages/ApplicationsPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ApplicationsPage.tsx)
- [client/src/pages/ProfilePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ProfilePage.tsx)

### P2. Paywall сделать серьёзнее

Что мешает:
- сейчас paywall выглядит как демо-заглушка, а не как платёжный экран
- он слишком явно говорит “mock” и “потом подключится”

Почему это плохо:
- для защиты это допустимо, но для серьёзной подачи выглядит недостроенным

Что нужно сделать:
- сделать paywall как “ожидаемый платёжный экран”
- убрать фразу, что это мок, из основного пользовательского текста
- оставить технический комментарий только в документации

Где смотреть:
- [client/src/pages/PaywallPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\PaywallPage.tsx)

## Пометки по mock/demo-местам, кроме YuMoney

### Можно оставить как локальный контур

- [client/public/smoke.html](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\public\smoke.html) и [scripts/smoke.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\scripts\smoke.js) как smoke и CI-контур.
- [server/src/data/demoStore.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\data\demoStore.js) как in-memory fallback при проблемах с БД.
- [server/src/middleware/auth.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\middleware\auth.js) только если demo-auth жёстко ограничен local development.
- [server/README.md](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\README.md) и [client/README.md](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\README.md) с явной пометкой local-only / test-only.

### Лучше убрать или спрятать перед релизом

- [client/src/api/demoAuth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\demoAuth.ts) как основной client-side mock auth.
- [client/src/api/auth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\auth.ts) из-за silent fallback на demo-user после ошибки `/auth/me`.
- [client/src/api/client.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\client.ts) из-за автоматической подстановки `x-demo-user-id` в обычные запросы.
- [client/src/pages/LoginPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\LoginPage.tsx) из-за demo-кнопок и смешения реального GitHub OAuth с mock-входом.
- [client/src/pages/ProfilePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ProfilePage.tsx) из-за кнопки включения PRO-демо.
- [client/src/pages/PaywallPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\PaywallPage.tsx) из-за симуляции оплаты и текста про mock.
- [scripts/BLOCK_1_SETUP.md](C:\Users\Daniel\Desktop\Tinkoff\skillhub\scripts\BLOCK_1_SETUP.md) и [scripts/check-block4-applications.md](C:\Users\Daniel\Desktop\Tinkoff\skillhub\scripts\check-block4-applications.md) как local-only runbook, не как пользовательский flow.

### Что ещё важно помнить

- Реальные маршруты OAuth, profile и teams не надо считать моками целиком, у них только часть поведения demo-only.
- Главный риск сейчас не в YuMoney, а в том, что demo-fallback попадает в основной пользовательский путь и маскирует живую авторизацию.
- Если чистить перед релизом, первым делом надо убирать silent fallback, `x-demo-user-id` и demo-кнопки из основного UX.

### Что оставить

- один стабильный header
- живой список users
- живую ленту teams
- AI-рейтинг как ключевую фичу
- PRO как визуально выделенный, но не кричащий режим
- настоящий GitHub OAuth как основной путь входа

### Итог для прода

Если коротко, продукт сейчас нужно довести до состояния:
- меньше демонстрации внутренностей
- меньше визуального шума
- больше иерархии
- один смысл на один экран
- один основной CTA на сценарий

Тогда он будет выглядеть не как “ещё один хакатонный проект”, а как уже собранный продукт с ясной подачей.

## Release Gaps

Ниже список того, чего не хватает именно для стабильной работы и релиза, если смотреть на код и всю документацию целиком.

### P0. Нет полноценной production-packaging поставки

Что отсутствует:
- в репозитории нет `Dockerfile`
- в корне нет `docker-compose.yml`
- нет готового `nginx.conf` или `caddy` конфига
- нет `systemd`-юнитов или готового VM deployment bundle

Почему это важно:
- есть документы по деплою, но нет реального артефакта, который можно сразу поднять на сервере
- для релиза это означает ручную сборку окружения
- для защиты это ещё терпимо, для стабильной поставки уже нет

Что нужно добавить:
- один понятный production-run path: Compose или systemd + nginx
- Dockerfile для backend и frontend или один сборочный процесс
- конфиг обратного прокси
- явный startup guide по одной схеме, без альтернатив “возможно так, возможно иначе”

Где смотреть:
- корень репозитория
- [docs/DEPLOYMENT.md](C:\Users\Daniel\Desktop\Tinkoff\skillhub\docs\DEPLOYMENT.md)
- [docs/DEPLOYMENT_COMPOSE.md](C:\Users\Daniel\Desktop\Tinkoff\skillhub\docs\DEPLOYMENT_COMPOSE.md)

### P0. Demo-fallback всё ещё слишком близко к production-flow

Что отсутствует:
- жёсткое разделение между production auth и local demo auth
- единый “режим продакшена” без `localStorage`-подмены пользователя
- отдельная логика для smoke/local, не вмешивающаяся в релизный UX

Почему это важно:
- реальный вход и демо-режим всё ещё смешиваются
- пользователю проще увидеть “что-то странное”, чем стабильный сценарий

Что нужно добавить:
- явный feature flag или env-guard
- demo only for local/smoke
- prod only for GitHub OAuth and real session cookie

Где смотреть:
- [client/src/api/auth.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\auth.ts)
- [client/src/api/client.ts](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\api\client.ts)
- [server/src/middleware/auth.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\middleware\auth.js)

### P1. Есть реализованный backend, который фронт использует только частично

Что уже есть в backend, но не полностью раскрыто на фронте:
- `GET /api/v1/profile/score/history`
- `GET /api/v1/profile/score/status/:jobId`
- `POST /api/v1/profile/import-github` умеет принимать готовый JSON или подтягивать GitHub по `githubUrl`, но фронт пока в основном работает с ручным JSON-превью
- `POST /api/v1/pro` есть как переключатель статуса, но это демо-эмуляция, а не реальная платёжная операция

Что это значит:
- backend шире, чем текущий UX
- часть API пока не выглядит как завершённый user flow
- релизный фронт должен либо использовать эти endpoints осознанно, либо их надо убрать из публичной поверхности

Что нужно решить:
- либо сделать их видимыми в UX
- либо оставить только как внутренние вспомогательные API
- либо убрать из релизной спецификации, чтобы не создавать лишних ожиданий

### P1. Не хватает настоящего onboarding для первого GitHub-пользователя

Что отсутствует:
- сценарий “первый вход → заполнение профиля → рекомендация следующих шагов”
- объяснение, что делать, если профиль пустой
- мягкий empty state без ощущения недоделки

Почему это важно:
- сейчас новый пользователь после OAuth может попасть в пустой профиль
- для защиты это выглядит как незаполненное состояние, а не как умышленный onboarding

Что нужно добавить:
- onboarding wizard или хотя бы один понятный `start here` экран
- автоподсказки по профилю
- call-to-action к заполнению профиля и скорингу

Где смотреть:
- [client/src/pages/ProfilePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ProfilePage.tsx)
- [server/src/data/demoStore.js](C:\Users\Daniel\Desktop\Tinkoff\skillhub\server\src\data\demoStore.js)

### P1. GitHub import есть, но реальный пользовательский сценарий ещё слабый

Что сейчас:
- есть импорт из `githubData` и backend-обработка GitHub по `githubUrl`
- в UI это выглядит как ручной JSON-пэйст

Чего не хватает:
- кнопки “подтянуть из GitHub” как основного сценария
- автоматического заполнения по данным OAuth-профиля
- понятного результата импорта в UX

Вывод:
- backend-фича есть
- фронтовый сценарий ещё не продаёт её как завершённую

### P2. Paywall пока слишком явный мок

Что отсутствует:
- финальная платёжная логика
- реальный checkout
- аккуратное состояние “платёж недоступен / скоро подключим” без слова mock в интерфейсе

Что нужно для релиза:
- либо интеграция оплаты,
- либо очень нейтральный paywall без демонстрации заглушки пользователю

### P2. Не хватает строгой документационной синхронизации

Что видно по документам:
- `HAKATHON_30H_PLAN_V2.md` и `CHECKLISTS_BY_MEMBER.md` до сих пор содержат много чекбоксов и демо-формулировок
- `PRODUCT_SPEC_FULL.md` описывает более широкий продукт, чем текущая релизная сборка
- `skillrank_pitch_blueprint.md` и `docs/prev/*` полезны как история, но не как релизный источник истины

Что нужно сделать:
- выделить один canonical release doc
- архивировать или пометить как legacy всё, что относится к pitch/hackathon pre-stage
- убрать старые чек-листы из активного потока, если они уже не отражают реальный статус

### Что ещё не хватает в целом

- единый production startup path
- final UX cleanup без demo-артефактов
- onboarding для пустого профиля
- нормальная история для paywall/pro
- чёткое разделение `reality vs smoke/demo`
- релизная документация, совпадающая с кодом

### Мой вывод

Для стабильной работы проект уже близок, но для релиза не хватает не столько фич, сколько упаковки:
- production deployment artifact
- жёсткого отделения demo от prod
- цельного onboarding flow
- более чистого UX без внутренних технических следов
- обновлённой документации, где есть один источник правды

Если это добить, проект можно будет показывать как аккуратный продукт, а не как “MVP с хорошим потенциалом”.

## Icons And UI Polish

Отдельно про иконки: сейчас часть интерфейса держится на буквенных плейсхолдерах вроде `GH`, текстовых ярлыках и повторяющихся бейджах. Для серьёзной подачи это лучше заменить на настоящую иконографику.

### Что менять в первую очередь

#### 1. GitHub login

Что сейчас не хватает:
- кнопка входа визуально читается как текстовая плашка
- внутри неё можно поставить реальную GitHub-иконку вместо букв `GH`

Что сделать:
- добавить иконку GitHub слева от текста
- оставить короткий label: `Войти через GitHub`
- убрать лишние подписи внутри кнопки, чтобы action был чище

Где:
- [client/src/pages/LoginPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\LoginPage.tsx)
- [client/src/pages/HomePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\HomePage.tsx)

#### 2. Header actions

Что сейчас не хватает:
- в хедере actions выглядят как текстовые чипы
- кнопке `Выход` и пункту `Профиль` полезна маленькая иконка для более живого, но спокойного вида

Что сделать:
- `Профиль` с иконкой пользователя
- `Выход` с иконкой logout
- `Команды`, `Поиск`, `Заявки` можно сделать с маленькими символами только если не перегрузит шапку

Где:
- [client/src/components/layout/Layout.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\components\layout\Layout.tsx)

#### 3. Search cards

Что сейчас не хватает:
- AI-рейтинг, контакт, PRO-метки и поиск могут быть визуально сгруппированы через иконки

Что сделать:
- иконка у `AI-рейтинг`
- иконка у `Контакт открыт / скрыт`
- маленькая иконка у CTA `Открыть профиль`

Где:
- [client/src/components/search/UserCard.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\components\search\UserCard.tsx)

#### 4. Team cards and actions

Что сейчас не хватает:
- у команд есть цветовой акцент, но мало визуальных маркеров смысла

Что сделать:
- иконка у слотов
- иконка у PRO-буст бейджа
- иконка у CTA `Открыть`

Где:
- [client/src/pages/TeamsPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\TeamsPage.tsx)

#### 5. Profile and paywall

Что сейчас не хватает:
- в профиле и paywall лучше выделять primary actions и ключевые статусы через иконки

Что сделать:
- иконка у `Стать PRO`
- иконка у `Получить рейтинг`
- иконка у `Написать`
- иконка у `Открыть контакты`

Где:
- [client/src/pages/ProfilePage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\ProfilePage.tsx)
- [client/src/pages/PaywallPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\PaywallPage.tsx)
- [client/src/pages/UserDetailPage.tsx](C:\Users\Daniel\Desktop\Tinkoff\skillhub\client\src\pages\UserDetailPage.tsx)

### Как вставлять настоящие иконки

Самый простой и аккуратный путь:
- использовать `lucide-react` или `phosphor-react`
- держать один набор иконок на весь проект
- не смешивать несколько библиотек

Если делать через `lucide-react`, схема обычно такая:

```tsx
import { Github, LogOut, UserRound, Search, Users, Send, ShieldCheck, Stars } from "lucide-react";
```

Дальше:
- иконка должна быть `size={16}` или `size={18}`
- цвет должен наследоваться от текста или быть мягким акцентом
- не ставь иконку рядом с каждым словом, если она не помогает сканированию

### Практические правила

1. Иконка должна усиливать смысл, а не дублировать текст.
2. В одной кнопке одна иконка.
3. В одном экране один стиль иконок.
4. Если иконка декоративная, она должна быть очень спокойной.
5. Для primary action иконка должна быть короткой и знакомой: GitHub, logout, user, search, send.

### Где иконки реально полезны

- GitHub login
- вход/выход
- поиск
- заявки
- PRO-статус
- контакт открыт / закрыт
- paywall / purchase
- empty states

### Где иконки не нужны

- длинные объясняющие карточки
- перегруженные хедеры
- вторичные тексты
- рядом с каждым числом в статистике

### Короткий вывод

Иконки нужны не ради красоты, а ради сканируемости:
- меньше текста в кнопках
- быстрее считывание действий
- более взрослый вид продукта

Если заменить буквенные плейсхолдеры и часть текстовых ярлыков на нормальные иконки, интерфейс сразу станет выглядеть собраннее и дороже.

## Конкурсный трек и защита

На этот файл дополнительно важно смотреть через призму финальной сдачи проекта.

### Что нельзя пропустить

- Стоп-кодинг — завтра в 17:00. После этого ничего доделывать нельзя.
- Нужно сдать 3 ссылки: презентация, открытый GitHub-репозиторий и домен или ссылку на работающий проект.
- Жюри будет проверять проекты со смартфонов, поэтому мобильная верстка домена обязательна.
- Если проект не адаптирован под телефон, баллы за UX будут снижены.
- Сдать проект можно здесь: https://forms.yandex.ru/cloud/69beb924902902c4698e50c8/.

### На что смотрит жюри

- Решает ли проект реальную проблему конкретной целевой аудитории.
- Готов ли продукт к использованию.
- Насколько решение оригинально.
- Понятны ли следующие шаги и потенциал развития.
- Соответствует ли архитектура задаче.
- Понимает ли команда свой код и принятые решения.
- Работает ли продукт без критических багов.
- Насколько уверенно проходит защита: тайминг, ответы на вопросы, общее впечатление.

### Что это значит для нас

- До стоп-кодинга нужно проверить мобильный UX, особенно главную, вход, профиль и поиск.
- В демо не должно остаться лишнего шума, который отвлекает от основного сценария.
- Лучше заранее прогнать рабочий путь от входа до результата на телефоне и в браузере.
