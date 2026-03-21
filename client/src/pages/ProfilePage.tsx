import React from "react";
import { Link } from "react-router-dom";
import { getDemoAuthUser, DEMO_PRO_AUTH_USER, setDemoAuthUser, promoteDemoAuthUserToPro } from "../api/demoAuth";
import { getOwnProfile, scoreProfile, upgradeToPro } from "../api/profile";
import { RatingBadge } from "../components/profile/RatingBadge";

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

  const onScore = async () => {
    setScoring(true);
    setError(null);
    try {
      await scoreProfile();
      const fresh = await getOwnProfile();
      setProfileData(fresh);
    } catch (err) {
      const typed = err as Error & { status?: number; nextAllowedAt?: string | null };
      if (typed.status === 429) {
        setError(
          `Лимит скоринга исчерпан. Следующая попытка: ${typed.nextAllowedAt ?? "позже"}.`,
        );
      } else {
        setError(typed.message || "Не удалось выполнить скоринг.");
      }
    } finally {
      setScoring(false);
    }
  };

  const onUpgradePro = async () => {
    setError(null);
    try {
      await upgradeToPro();
      promoteDemoAuthUserToPro();
      const fresh = await getOwnProfile();
      setProfileData(fresh);
    } catch (err) {
      const typed = err as Error;
      setError(typed.message || "Не удалось включить PRO-режим.");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
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

  const currentDemoUser = getDemoAuthUser();
  const profile = profileData?.profile;
  if (!profile) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Профиль</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Профиль еще не создан</h2>
        <p className="mt-3 max-w-2xl text-slate-300">Заполни профиль, чтобы запустить AI-скоринг и показать себя в поиске.</p>
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
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Мой профиль</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">{profileData?.user.displayName ?? profileData?.user.username}</h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-300">
                Профиль, рейтинг и рекомендации уже доступны. Отсюда удобно обновить данные и посмотреть,
                как тебя видят другие участники.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {profileData?.user.isPro ? (
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  PRO-режим
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onUpgradePro}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-300 ease-out hover:shadow-emerald-500/30"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="currentColor">
                    <path d="M5 6V4a3 3 0 1 1 6 0v2h1.5A1.5 1.5 0 0 1 14 7.5v5A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-5A1.5 1.5 0 0 1 3.5 6H5Zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v2Z" />
                  </svg>
                  Стать PRO
                </button>
              )}
              {!profileData?.user.isPro ? (
                <button
                  type="button"
                  onClick={() => {
                    setDemoAuthUser(DEMO_PRO_AUTH_USER);
                    window.location.reload();
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 hover:bg-white/10"
                >
                  Включить PRO-демо
                </button>
              ) : null}
              <Link
                to="/profile/edit"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 hover:bg-white/10"
              >
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

          {currentDemoUser?.id ? (
            <p className="mt-6 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
              Демо-пользователь: {currentDemoUser.displayName ?? currentDemoUser.username}
            </p>
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
            <p className="mt-3 text-slate-300">{profile.bio || "Добавь описание, чтобы профиль выглядел убедительнее."}</p>

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

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI-рейтинг</p>

          {typeof profile.rating?.score === "number" ? (
            <>
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Текущий рейтинг</p>
                    <p className="mt-2 text-5xl font-semibold tracking-tight text-white">{profile.rating.score}</p>
                  </div>
                  <RatingBadge score={profile.rating.score} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{profile.rating.grade}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {profileData?.user.isPro ? "Без лимита в PRO" : "1 попытка / 7 дней в демо"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
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

          {error ? <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

          <button
            type="button"
            onClick={onScore}
            disabled={scoring}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="currentColor">
              <path d="M8 1.5l1.2 3.61h3.8l-3.08 2.24 1.18 3.65L8 8.76l-3.1 2.24 1.18-3.65L3 5.11h3.8z" />
            </svg>
            {scoring ? "Считаем рейтинг..." : "Получить рейтинг"}
          </button>
        </aside>
      </div>
    </section>
  );
}
