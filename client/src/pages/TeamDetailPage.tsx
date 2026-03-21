import React from "react";
import { Link, useParams } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { createApplication } from "../api/applications";
import { getTeamById, updateTeam, type TeamDetail, type TeamFormPayload } from "../api/teams";
import { ApplicationModal } from "../components/applications/ApplicationModal";
import { RatingBadge } from "../components/profile/RatingBadge";
import { TeamFormModal } from "../components/teams/TeamFormModal";

export function TeamDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [team, setTeam] = React.useState<TeamDetail | null>(null);
  const [currentUser, setCurrentUser] = React.useState<{ id: string; isPro?: boolean } | null>(null);
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [applyError, setApplyError] = React.useState<string | null>(null);
  const [applyStatus, setApplyStatus] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [editLoading, setEditLoading] = React.useState(false);

  React.useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Команда не найдена.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getTeamById(id)
      .then((response) => {
        if (active) {
          setTeam(response.team);
        }
      })
      .catch(() => {
        if (active) {
          setError("Не удалось загрузить команду.");
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
    return <p className="text-slate-300">Загружаем команду...</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  if (!team) {
    return <p className="text-red-300">Команда не найдена.</p>;
  }

  const canEdit = currentUser?.id === team.authorId;
  const isBoosted = Boolean(team.author?.isPro);

  const submitApplication = async ({ teamId, message }: { teamId: string; message: string }) => {
    setApplyError(null);
    setApplyStatus(null);

    try {
      await createApplication(teamId, message);
      setApplyStatus("Заявка отправлена в раздел заявок.");
      setApplyOpen(false);
    } catch (err) {
      const typed = err as Error & { status?: number };
      setApplyError(typed.message || "Не удалось отправить заявку.");
    }
  };

  const submitEdit = async (payload: TeamFormPayload) => {
    setEditLoading(true);
    setEditError(null);

    try {
      const response = await updateTeam(team.id, payload);
      setTeam(response.team);
      setEditOpen(false);
    } catch (err) {
      const typed = err as Error;
      setEditError(typed.message || "Не удалось сохранить команду.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Команда</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{team.name}</h2>
            {isBoosted ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                PRO-буст капитана
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm uppercase tracking-[0.24em] text-slate-400">{team.hackathonName}</p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{team.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              Вступить в команду
            </button>
            <Link
              to="/applications"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 transition duration-300 ease-out hover:bg-white/10"
            >
              Мои заявки
            </Link>
            <Link
              to="/teams"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 transition duration-300 ease-out hover:bg-white/10"
            >
              Назад к командам
            </Link>
            {canEdit ? (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 transition duration-300 ease-out hover:bg-white/10"
              >
                Редактировать
              </button>
            ) : null}
          </div>

          {applyStatus ? <p className="mt-4 text-sm text-lime-200">{applyStatus}</p> : null}
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Капитан</p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src={team.author?.avatarUrl ?? ""}
                alt={team.author?.displayName ?? "Капитан"}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div>
                {team.author?.userId ? (
                  <Link
                    to={`/users/${team.author.userId}`}
                    className="font-medium text-white transition duration-300 ease-out hover:text-cyan-200"
                  >
                    {team.author.displayName}
                  </Link>
                ) : (
                  <p className="font-medium text-white">{team.author?.displayName ?? "Автор не указан"}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {team.author?.isPro ? (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 font-semibold uppercase tracking-[0.2em] text-emerald-100">
                      PRO
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {team.isActive ? "Активна" : "Пауза"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Участники</p>
            <div className="mt-3 space-y-3">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2">
                  <img src={member.avatarUrl} alt={member.displayName} className="h-11 w-11 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-white">{member.displayName}</p>
                      {member.rating ? <RatingBadge score={member.rating.score} /> : null}
                    </div>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Требования</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {team.requiredRoles.map((role) => (
                <span key={role} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-200">
                  {role}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {team.stack.map((stack) => (
                <span key={stack} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                  {stack}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <p>Мин. рейтинг: {team.minRating ?? "нет"}</p>
              <p>Свободных слотов: {team.slotsOpen}</p>
              <p>Статус: {team.status === "active" ? "активна" : team.status === "paused" ? "пауза" : "закрыта"}</p>
            </div>
          </div>
        </aside>
      </div>

      {applyOpen ? (
        <ApplicationModal
          teams={[team]}
          selectedTeam={team}
          error={applyError}
          onSubmit={submitApplication}
          onClose={() => setApplyOpen(false)}
        />
      ) : null}

      {editOpen ? (
        <TeamFormModal
          title="Редактировать команду"
          submitLabel="Сохранить"
          team={team}
          loading={editLoading}
          error={editError}
          onSubmit={submitEdit}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </section>
  );
}
