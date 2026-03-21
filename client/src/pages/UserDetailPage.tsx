import React from "react";
import { Link, useParams } from "react-router-dom";
import { getUserSummary, type UserSummary } from "../api/users";
import { RatingBadge } from "../components/profile/RatingBadge";
import { ApplicationModal } from "../components/applications/ApplicationModal";
import { createApplication } from "../api/applications";
import { getTeams, type TeamSummary } from "../api/teams";

export function UserDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<UserSummary | null>(null);
  const [teams, setTeams] = React.useState<TeamSummary[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [teamsError, setTeamsError] = React.useState<string | null>(null);
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [applyError, setApplyError] = React.useState<string | null>(null);
  const [applyStatus, setApplyStatus] = React.useState<string | null>(null);

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
    return <p className="text-slate-300">Загружаем профиль участника...</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  if (!user) {
    return <p className="text-red-300">Профиль не найден.</p>;
  }

  const openApply = async () => {
    setApplyError(null);
    setApplyStatus(null);
    setApplyOpen(true);

    if (teams.length > 0 || teamsLoading) {
      return;
    }

    setTeamsLoading(true);
    setTeamsError(null);

    try {
      const response = await getTeams();
      setTeams(response.items);
    } catch {
      setTeamsError("Не удалось загрузить команды для отклика.");
    } finally {
      setTeamsLoading(false);
    }
  };

  const submitApplication = async ({ teamId, message }: { teamId: string; message: string }) => {
    setApplyError(null);
    setApplyStatus(null);

    try {
      await createApplication(teamId, message);
      setApplyStatus("Отклик отправлен.");
      setApplyOpen(false);
    } catch (err) {
      const typed = err as Error & { status?: number };
      setApplyError(typed.message || "Не удалось отправить отклик.");
    }
  };

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
                {user.role ?? "role not set"} · {user.claimedGrade ?? "grade not set"}
              </p>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">{user.bio || "О себе пока ничего не добавлено."}</p>
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
              <p className="mt-3 text-slate-200">
                {user.contactVisible
                  ? "Контакт открыт: viewer сейчас видит этот профиль как PRO"
                  : "Контакт скрыт: нужен PRO и рейтинг 80+"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openApply}
              className="rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              Откликнуться
            </button>
            <Link to="/search" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 hover:bg-white/10">
              Назад к поиску
            </Link>
            <Link to="/profile" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 hover:bg-white/10">
              Мой профиль
            </Link>
          </div>

          {applyStatus ? <p className="mt-4 text-sm text-lime-200">{applyStatus}</p> : null}
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI insight</p>

          {user.rating ? (
            <>
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Score</p>
                    <p className="mt-2 text-5xl font-semibold tracking-tight text-white">{user.rating.score}</p>
                  </div>
                  <RatingBadge score={user.rating.score} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{user.rating.grade}</p>
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
              <p className="mt-2 text-sm text-slate-400">После скоринга профиль станет более убедительным для других участников.</p>
            </div>
          )}
        </aside>
      </div>

      {applyOpen ? (
        <ApplicationModal
          teams={teams}
          loadingTeams={teamsLoading}
          error={teamsError || applyError}
          onSubmit={submitApplication}
          onClose={() => setApplyOpen(false)}
        />
      ) : null}
    </section>
  );
}