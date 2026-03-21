import React from "react";
import { Link, useParams } from "react-router-dom";
import { getUserSummary, type UserSummary } from "../api/users";
import { RatingBadge } from "../components/profile/RatingBadge";
import { ArrowRightIcon, GithubIcon, LockIcon, SendIcon, ShieldCheckIcon, SparklesIcon, UsersIcon } from "../components/ui/Icons";

export function UserDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<UserSummary | null>(null);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Пользователь не найден.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getUserSummary(id)
      .then((response) => {
        if (active) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (active) {
          setError("Не удалось загрузить профиль участника.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 animate-pulse rounded-[1.5rem] bg-white/10" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-8 w-2/3 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="h-12 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="h-12 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/5" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </aside>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  if (!user) {
    return <p className="text-red-300">Профиль не найден.</p>;
  }

  const telegramLink = user.contactVisible && user.telegramUsername ? `https://t.me/${user.telegramUsername.replace(/^@/, "")}` : null;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex flex-wrap items-start gap-5">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-24 w-24 rounded-[1.5rem] border border-white/10 object-cover shadow-lg shadow-black/20"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-white">{user.displayName}</h2>
                {user.rating ? <RatingBadge score={user.rating.score} /> : null}
              </div>
              <p className="mt-2 text-slate-400">
                {user.role ?? "роль не указана"} · {user.claimedGrade ?? "грейд не указан"}
              </p>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">{user.bio || "О себе пока ничего не добавлено."}</p>
              <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {user.contactVisible ? (
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                    Контакты открыты
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <LockIcon className="h-3.5 w-3.5" />
                    Контакты скрыты для PRO
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Стек</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.primaryStack.length > 0 ? (
                  user.primaryStack.map((stack) => (
                    <span key={stack} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                      {stack}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-300">Не указан</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Контакт</p>
              {user.contactVisible ? (
                <div className="mt-3 space-y-2 text-slate-200">
                  <p>Контакт открыт для PRO-режима.</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/15 px-3 py-1 text-emerald-100">Telegram открыт</span>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/15 px-3 py-1 text-emerald-100">GitHub открыт</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-slate-200">Контакт скрыт: нужен PRO и рейтинг 80+</p>
                  <div className="grid gap-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="blur-[2px]">@username</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <LockIcon className="h-3 w-3" />
                        Telegram
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="blur-[2px]">github.com/hidden</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <GithubIcon className="h-3 w-3" />
                        GitHub
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {telegramLink ? (
              <a
                href={telegramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
              >
                <SendIcon className="h-4 w-4" />
                Написать
              </a>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
              >
                <ArrowRightIcon className="h-4 w-4" />
                Открыть контакты в PRO
              </Link>
            )}
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 hover:bg-white/10"
            >
              <UsersIcon className="h-4 w-4" />
              Смотреть команды
            </Link>
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-slate-400">
            <SparklesIcon className="h-4 w-4" />
            AI-рейтинг
          </p>

          {user.rating ? (
            <>
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Рейтинг</p>
                    <p className="mt-2 text-5xl font-semibold tracking-tight text-white">{user.rating.score}</p>
                  </div>
                  <RatingBadge score={user.rating.score} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{user.rating.grade}</p>
              </div>

              <div className="rounded-[1.5rem] border border-amber-300/15 bg-amber-300/10 p-4 text-sm text-amber-100">
                {user.contactVisible
                  ? "Этот профиль уже открыт для PRO-режима и выглядит как сильный кандидат для быстрого отклика."
                  : "Здесь хорошо видно, что именно откроется после PRO: контакты, рекомендации и более тёплый сценарий связи."}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Сильные стороны</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {user.rating.strengths?.length ? (
                      user.rating.strengths.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                    ) : (
                      <li>Пока без дополнительных заметок</li>
                    )}
                  </ul>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Рекомендации</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {user.rating.improvements?.length ? (
                      user.rating.improvements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                    ) : (
                      <li>Пока без рекомендаций</li>
                    )}
                  </ul>
                </article>
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-5 text-slate-300">
              <p className="text-lg font-semibold text-white">AI-рейтинг не рассчитан</p>
              <p className="mt-2 text-sm text-slate-400">После скоринга профиль станет более убедительным для других участников, а рекомендации появятся прямо здесь.</p>
            </div>
          )}
        </aside>
      </div>

    </section>
  );
}
