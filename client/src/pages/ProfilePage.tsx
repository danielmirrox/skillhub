import React from "react";
import { Link } from "react-router-dom";
import { getOwnProfile, scoreProfile } from "../api/profile";
import { RatingBadge } from "../components/profile/RatingBadge";
import { ArrowRightIcon, LockIcon, ShieldCheckIcon, SparklesIcon } from "../components/ui/Icons";

export function ProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [scoring, setScoring] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profileData, setProfileData] = React.useState<Awaited<
    ReturnType<typeof getOwnProfile>
  > | null>(null);

  React.useEffect(() => {
    getOwnProfile()
      .then((data) => setProfileData(data))
      .catch(() => setError("Не удалось загрузить профиль."))
      .finally(() => setLoading(false));
  }, []);

  const onScore = async (options?: { bypassRateLimit?: boolean }) => {
    setScoring(true);
    setError(null);
    try {
      await scoreProfile({}, options);
      const fresh = await getOwnProfile();
      setProfileData(fresh);
    } catch (err) {
      const typed = err as Error & { status?: number; nextAllowedAt?: string | null };
      if (typed.status === 429) {
        const formattedNextAllowedAt = typed.nextAllowedAt
          ? new Intl.DateTimeFormat("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(typed.nextAllowedAt))
          : "позже";
        setError(
          `Лимит скоринга исчерпан. Следующая попытка: ${formattedNextAllowedAt}.`,
        );
      } else {
        setError(typed.message || "Не удалось выполнить скоринг.");
      }
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-12 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/5" />
          <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
        </aside>
      </div>
    );
  }

  if (error && !profileData) {
    return <p className="text-red-300">{error}</p>;
  }

  const profile = profileData?.profile;
  const isDraftProfile =
    Boolean(profile) &&
    !profile?.bio &&
    (profile?.primaryStack?.length ?? 0) === 0 &&
    (profile?.experienceYears ?? 0) === 0 &&
    (profile?.hackathonsCount ?? 0) === 0 &&
    (profile?.projectLinks?.length ?? 0) === 0 &&
    !profile?.rating;

  if (!profile) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Профиль</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Профиль ещё не создан</h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Сначала заполни базовые данные, чтобы поиск, AI-рейтинг и рекомендации работали на твою видимость в продукте.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Шаг 1</p>
            <p className="mt-2 text-lg font-semibold text-white">Заполни роль и стек</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Шаг 2</p>
            <p className="mt-2 text-lg font-semibold text-white">Добавь проекты и опыт</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Шаг 3</p>
            <p className="mt-2 text-lg font-semibold text-white">Запусти AI-скоринг</p>
          </article>
        </div>
        <Link
          to="/profile/edit"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
        >
          Перейти к заполнению
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Мой профиль</p>
              <h2 className="text-balance mt-3 text-[clamp(2rem,6.2vw,3.5rem)] font-semibold tracking-tight text-white">{profileData?.user.displayName ?? profileData?.user.username}</h2>
              <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Профиль, рейтинг и рекомендации уже доступны. Отсюда удобно обновить данные и понять, как тебя видят другие участники.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              {profileData?.user.isPro ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  PRO-режим
                </span>
              ) : (
                <Link
                  to="/paywall"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-300 ease-out hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <LockIcon className="h-3.5 w-3.5" />
                  Стать PRO
                </Link>
              )}
              <Link
                to="/profile/edit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 hover:bg-white/10 sm:w-auto"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
                Редактировать
              </Link>
            </div>
          </div>

          {!profileData?.user.isPro ? (
            <div className="mt-6 rounded-[1.75rem] border border-cyan-300/20 bg-gradient-to-r from-cyan-300/10 via-slate-950 to-violet-400/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">PRO-превью</p>
                  <p className="mt-2 text-lg font-semibold text-white">Открой скрытые контакты и рекомендации</p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    В PRO видно то, что ускоряет решение: контакты, рекомендации и более уверенный сценарий связи.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                  1 попытка / 7 дней
                </div>
              </div>
            </div>
          ) : null}

          {profileData?.user.isPro ? (
            <div className="mt-6 rounded-[1.75rem] border border-emerald-300/20 bg-emerald-300/10 p-5 text-emerald-100">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">PRO активно</p>
              <p className="mt-2 text-lg font-semibold text-white">Контактные детали и AI-слой уже доступны</p>
              <p className="mt-2 text-sm leading-7 text-emerald-50/80">
                Здесь можно смелее сосредоточиться на качестве профиля: рейтинг, проекты и ясное описание.
              </p>
            </div>
          ) : null}

          {isDraftProfile ? (
            <div className="mt-6 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Стартовый профиль</p>
              <p className="mt-2 text-lg font-semibold text-white">Собери профиль за 3 шага</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Заполни роль, стек и пару проектов, чтобы профиль выглядел завершённым и сразу читался другими участниками.
                  </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/profile/edit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 sm:w-auto"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  Заполнить профиль
                </Link>
                <Link
                  to="/profile/edit#github-import"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-100 hover:bg-white/10 sm:w-auto"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Импортировать GitHub
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Роль</p>
              <p className="mt-2 text-lg font-semibold text-white">{profile.role}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Грейд</p>
              <p className="mt-2 text-lg font-semibold text-white">{profile.claimedGrade}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Стек</p>
              <p className="mt-2 text-lg font-semibold text-white">{profile.primaryStack.join(", ") || "не указан"}</p>
            </article>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Описание и проекты</p>
            <p className="mt-3 text-slate-300">
              {profile.bio || "Добавь описание, чтобы профиль выглядел убедительнее."}
            </p>

            {profile.projectLinks.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {profile.projectLinks.map((project, index) => (
                  <article key={`${project.url}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{project.description}</p>
                    <a
                      className="mt-2 inline-flex text-sm font-medium text-cyan-200 hover:text-cyan-100"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {project.url}
                    </a>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-slate-400">
            <SparklesIcon className="h-4 w-4" />
            AI-рейтинг
          </p>

          {typeof profile.rating?.score === "number" ? (
            <>
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Текущий рейтинг</p>
                    <p className="mt-2 text-[clamp(2.5rem,10vw,4.5rem)] font-semibold tracking-tight text-white">{profile.rating.score}</p>
                  </div>
                  <RatingBadge score={profile.rating.score} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{profile.rating.grade}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {profileData?.user.isPro ? "Без лимита в PRO" : "1 попытка / 7 дней в стандартном режиме"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Сильные стороны</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {profile.rating.strengths?.length ? (
                      profile.rating.strengths.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                    ) : (
                      <li>Пока без дополнительных заметок</li>
                    )}
                  </ul>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Рекомендации</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {profile.rating.improvements?.length ? (
                      profile.rating.improvements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                    ) : (
                      <li>Пока без рекомендаций</li>
                    )}
                  </ul>
                </article>
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-5 text-slate-300">
              <p className="text-lg font-semibold text-white">Рейтинг пока не рассчитан</p>
              <p className="mt-2 text-sm text-slate-400">Нажми кнопку ниже, чтобы прогнать скоринг и получить рекомендации.</p>
            </div>
          )}

          <div className="min-h-[4.5rem]">
            {error ? (
              <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              void onScore();
            }}
            disabled={scoring}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="currentColor">
              <path d="M8 1.5l1.2 3.61h3.8l-3.08 2.24 1.18 3.65L8 8.76l-3.1 2.24 1.18-3.65L3 5.11h3.8z" />
            </svg>
            {scoring ? "Считаем рейтинг..." : "Получить рейтинг"}
          </button>

          {import.meta.env.DEV ? (
            <button
              type="button"
              onClick={() => {
                void onScore({ bypassRateLimit: true });
              }}
              disabled={scoring}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100 transition duration-300 ease-out hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Обойти лимит (временно)
            </button>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
