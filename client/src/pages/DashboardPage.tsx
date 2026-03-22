import React from "react";
import { Link } from "react-router-dom";
import type { AuthUser } from "../api/auth";
import { getOwnProfile, type Profile } from "../api/profile";
import { RatingBadge } from "../components/profile/RatingBadge";
import { GithubIcon, SearchIcon, ShieldCheckIcon, SparklesIcon, UserRoundIcon, UsersIcon } from "../components/ui/Icons";

type DashboardPageProps = {
  user: AuthUser;
};

function pluralizeYears(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "год";
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "года";
  return "лет";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DashboardPage({ user }: DashboardPageProps) {
  const [profile, setProfile] = React.useState<Profile | undefined>(undefined);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    getOwnProfile()
      .then((data) => setProfile(data.profile ?? undefined))
      .catch(() => setProfile(undefined))
      .finally(() => setLoadingProfile(false));
  }, []);

  const gradeLabel = profile?.claimedGrade
    ? profile.claimedGrade.charAt(0).toUpperCase() + profile.claimedGrade.slice(1)
    : null;
  const roleLabel = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : null;
  const isDraftProfile =
    Boolean(profile) &&
    !profile?.bio &&
    (profile?.primaryStack?.length ?? 0) === 0 &&
    (profile?.experienceYears ?? 0) === 0 &&
    (profile?.hackathonsCount ?? 0) === 0 &&
    (profile?.projectLinks?.length ?? 0) === 0 &&
    !profile?.rating;

  return (
    <section className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-cyan-300">
            <SparklesIcon className="h-4 w-4" />
            Дашборд
          </p>
          <div className="mt-4 flex flex-wrap items-start gap-4 sm:items-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName ?? user.username}
                className="h-14 w-14 rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/20 sm:h-16 sm:w-16"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/20 sm:h-16 sm:w-16">
                {(user.displayName ?? user.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-balance text-[clamp(1.9rem,5.8vw,3.5rem)] font-semibold tracking-tight text-white">
                  {user.displayName ?? user.username}
                </h2>
                {user.isPro ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    PRO
                  </span>
                ) : null}
              </div>
              {!loadingProfile && (gradeLabel || roleLabel) ? (
                <p className="mt-1 text-slate-400">
                  {[gradeLabel, roleLabel].filter(Boolean).join(" ")}
                </p>
              ) : null}
            </div>
            {!loadingProfile && profile?.rating ? (
              <div className="ml-auto">
                <RatingBadge score={profile.rating.score} />
              </div>
            ) : null}
          </div>

          {!loadingProfile && profile && !isDraftProfile ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">AI-рейтинг</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {profile.rating ? `${profile.rating.score}/100` : "Не рассчитан"}
                </p>
                {profile.rating ? (
                  <p className="mt-1 text-xs text-slate-400">{profile.rating.grade}</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Опыт</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {profile.experienceYears} {pluralizeYears(profile.experienceYears)}
                </p>
                <p className="mt-1 text-xs text-slate-400">Хакатонов: {profile.hackathonsCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Стек</p>
                <p className="mt-2 text-sm font-semibold text-white line-clamp-2">
                  {profile.primaryStack.length > 0
                    ? profile.primaryStack.slice(0, 3).join(", ")
                    : "Не заполнен"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">GitHub</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {profile.githubData?.fetchedAt ? "Подключён" : profile.githubUrl ? "Готов к импорту" : "Не подключён"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {profile.githubData?.fetchedAt
                    ? `Импорт обновлён ${formatDateTime(profile.githubData.fetchedAt)}`
                    : profile.githubUrl
                      ? "Открой профиль и нажми импорт"
                      : "Добавь GitHub URL в профиль"}
                </p>
              </div>
            </div>
          ) : !loadingProfile && profile && isDraftProfile ? (
            <div className="mt-6 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Профиль на старте</p>
              <p className="mt-2 text-lg font-semibold text-white">Профиль ещё пустой, это нормально для первого входа</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Заполни роль, стек и пару проектов. После этого поиск, рейтинг и карточка профиля начнут выглядеть сильнее.
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Если у тебя есть GitHub, подключи его: открытые данные помогут точнее собрать стек, проекты и рекомендации.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/profile/edit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 sm:w-auto"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Заполнить профиль
                </Link>
                <Link
                  to="/profile/edit#github-import"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-100 hover:bg-white/10 sm:w-auto"
                >
                  <GithubIcon className="h-4 w-4" />
                  Импортировать GitHub
                </Link>
              </div>
            </div>
          ) : !loadingProfile ? (
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm text-amber-100">
                Профиль ещё не заполнен.{" "}
                <Link to="/profile/edit" className="underline">
                  Дополните профиль
                </Link>{" "}
                чтобы получить AI-рейтинг.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-slate-950/55" />
              ))}
            </div>
          )}
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Быстрые действия</p>
          <Link
            to="/search"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            <SearchIcon className="h-4 w-4" />
            Поиск участников
          </Link>
          <Link
            to="/teams"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 hover:bg-white/10"
          >
            <UsersIcon className="h-4 w-4" />
            Поиск команд
          </Link>
          <Link
            to="/profile"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 hover:bg-white/10"
          >
            <UserRoundIcon className="h-4 w-4" />
            Мой профиль
          </Link>
        </aside>
      </div>

      {!loadingProfile && profile?.rating?.strengths && profile.rating.strengths.length > 0 ? (
        <section className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-emerald-300">
            <SparklesIcon className="h-4 w-4" />
            Сильные стороны · PRO
          </p>
          <h3 className="mt-2 text-xl font-semibold">Сильные стороны</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {profile.rating.strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
              >
                <span aria-hidden="true" className="mt-0.5 text-emerald-300">
                  ✓
                </span>
                {strength}
              </li>
            ))}
          </ul>
          {profile.rating.improvements && profile.rating.improvements.length > 0 ? (
            <>
              <h3 className="mt-6 text-xl font-semibold">Зоны роста</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {profile.rating.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"
                  >
                    <span aria-hidden="true" className="mt-0.5 text-amber-300">
                      →
                    </span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Статус</p>
            <p className="mt-2 text-xl font-semibold text-white">Сценарий готов</p>
            <p className="mt-2 text-sm text-slate-400">Можно пройти весь сценарий без лишних шагов.</p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-400">AI-скоринг</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {!loadingProfile && profile ? "Готов к запуску" : "Заполни профиль"}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {!loadingProfile && profile
                ? "Нажми «Получить рейтинг» в профиле."
                : "Добавь стек, опыт и проекты."}
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Следующий шаг</p>
            <p className="mt-2 text-xl font-semibold text-white">Найди команду</p>
            <p className="mt-2 text-sm text-slate-400">
              Поиск участников и команды помогут найти нужный стек.
            </p>
          </article>
        </section>
      )}
    </section>
  );
}
