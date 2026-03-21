import React from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { createTeam, getTeamById, getTeams, updateTeam, type TeamRole, type TeamSummary, type TeamDetail, type TeamFormPayload } from "../api/teams";
import { TeamFormModal } from "../components/teams/TeamFormModal";
import { ArrowRightIcon, ShieldCheckIcon, UsersIcon } from "../components/ui/Icons";

const ROLE_OPTIONS: Array<{ value: TeamRole | ""; label: string }> = [
  { value: "", label: "Любая роль" },
  { value: "frontend", label: "Фронтенд" },
  { value: "backend", label: "Бэкенд" },
  { value: "fullstack", label: "Фуллстек" },
  { value: "design", label: "Дизайн" },
  { value: "ml", label: "ML" },
  { value: "mobile", label: "Мобильная" },
  { value: "other", label: "Другое" },
];

function TeamCard({ team }: { team: TeamSummary }) {
  const isBoosted = Boolean(team.author?.isPro);

  return (
    <article
      className={[
        "group rounded-[1.75rem] border p-5 shadow-xl backdrop-blur-xl transition duration-300 ease-out hover:shadow-2xl",
        isBoosted
          ? "border-emerald-300/20 bg-gradient-to-br from-emerald-300/10 via-white/5 to-cyan-300/8 shadow-emerald-950/20 hover:border-emerald-300/35 hover:shadow-emerald-950/35"
          : "border-white/10 bg-white/5 shadow-slate-950/20 hover:border-cyan-300/20 hover:bg-white/[0.07] hover:shadow-slate-950/35",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs uppercase tracking-[0.24em] ${isBoosted ? "text-emerald-100/85" : "text-cyan-200/80"}`}>{team.hackathonName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-semibold tracking-tight text-white">{team.name}</h3>
            {team.author?.isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-emerald-100">
                <ShieldCheckIcon className="h-3 w-3" />
                PRO-буст
              </span>
            ) : null}
            {!team.isActive ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Пауза
              </span>
            ) : null}
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{team.description}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-right text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Слоты</p>
          <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-white">
            <UsersIcon className="h-4 w-4 text-cyan-200" />
            {team.slotsOpen}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {team.requiredRoles.map((role) => (
          <span key={role} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-200">
            {role}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {team.stack.map((stack) => (
          <span key={stack} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
            {stack}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="text-sm text-slate-400">
          <p className="flex items-center gap-2">
            {team.author ? <Link to={`/users/${team.author.userId}`} className="text-slate-200 transition duration-300 ease-out hover:text-cyan-200">{team.author.displayName}</Link> : "Автор не указан"}
            {team.author?.isPro ? <span className="text-emerald-200">PRO</span> : null}
          </p>
          <p>{team.membersCount} участников</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/teams/${team.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 ease-out hover:shadow-cyan-500/30"
          >
            <ArrowRightIcon className="h-4 w-4" />
            Открыть
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TeamsPage() {
  const [currentUser, setCurrentUser] = React.useState<{ id: string; isPro?: boolean } | null>(null);
  const [role, setRole] = React.useState<TeamRole | "">("");
  const [stack, setStack] = React.useState("");
  const [hackathon, setHackathon] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [teams, setTeams] = React.useState<TeamSummary[]>([]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<TeamDetail | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");

  const activeFilters = [role, stack, hackathon].filter(Boolean).length;

  React.useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  const loadTeams = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTeams({ role: role || undefined, stack: stack || undefined, hackathon: hackathon || undefined });
      setTeams(response.items);
    } catch {
      setError("Не удалось загрузить команды.");
    } finally {
      setLoading(false);
    }
  }, [hackathon, role, stack]);

  React.useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  const openCreateForm = () => {
    setEditingTeam(null);
    setFormMode("create");
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = async (teamId: string) => {
    setFormError(null);
    try {
      const response = await getTeamById(teamId);
      setEditingTeam(response.team);
      setFormMode("edit");
      setFormOpen(true);
    } catch {
      setFormError("Не удалось загрузить команду для редактирования.");
      setFormOpen(false);
    }
  };

  const handleSubmit = async (payload: TeamFormPayload) => {
    setFormLoading(true);
    setFormError(null);

    try {
      if (formMode === "edit") {
        if (!editingTeam) {
          throw new Error("Не удалось определить команду для редактирования.");
        }

        await updateTeam(editingTeam.id, payload);
      } else {
        await createTeam(payload);
      }

      setFormOpen(false);
      setEditingTeam(null);
      await loadTeams();
    } catch (err) {
      const typed = err as Error;
      setFormError(typed.message || "Не удалось сохранить команду.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Команды</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Лента команд для хакатона</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Здесь видно, кто ищет людей, какие роли нужны и насколько команда уже собрана.
              PRO-капитаны получают более заметную подачу, а страница команды даёт контекст и кнопку вступления.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            <UsersIcon className="h-4 w-4" />
            Создать команду
          </button>
        </div>
      </article>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void loadTeams();
        }}
        className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl md:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Хакатон
          <input
            value={hackathon}
            onChange={(event) => setHackathon(event.target.value)}
            placeholder="Например, Viribus"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Роль
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as TeamRole | "")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Стек
          <input
            value={stack}
            onChange={(event) => setStack(event.target.value)}
            placeholder="react, node"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
          />
        </label>

        <div className="flex flex-col justify-end gap-3 sm:flex-row md:flex-col">
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            Применить
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("");
              setStack("");
              setHackathon("");
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-100 hover:bg-white/10"
          >
            Сбросить
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <p>{activeFilters > 0 ? `Активных фильтров: ${activeFilters}` : "Фильтры не заданы"}</p>
        <Link to="/applications" className="text-cyan-200 hover:text-cyan-100">
          Смотреть заявки
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : teams.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-slate-300">
          <p className="text-lg font-semibold text-white">Команды не найдены</p>
          <p className="mt-2 text-sm text-slate-400">Попробуй снять часть фильтров или изменить стек.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((team) => (
            <div key={team.id} className="space-y-3">
              <TeamCard team={team} />
              {currentUser?.id === team.author?.userId ? (
                <button
                  type="button"
                  onClick={() => {
                    void openEditForm(team.id);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 hover:bg-white/10"
                >
                  Редактировать
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {formOpen ? (
        <TeamFormModal
          title={formMode === "edit" ? "Редактировать команду" : "Создать команду"}
          submitLabel={formMode === "edit" ? "Сохранить" : "Создать"}
          team={editingTeam}
          loading={formLoading}
          error={formError}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false);
            setEditingTeam(null);
          }}
        />
      ) : null}
    </section>
  );
}
