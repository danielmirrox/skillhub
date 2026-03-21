import React from "react";
import type { TeamDetail, TeamFormPayload, TeamRole, TeamSummary } from "../../api/teams";

type EditableTeam = TeamSummary | TeamDetail | null;

type TeamFormModalProps = {
  title: string;
  submitLabel: string;
  team?: EditableTeam;
  loading?: boolean;
  error?: string | null;
  onSubmit: (payload: TeamFormPayload) => void;
  onClose: () => void;
};

const joinValues = (values: string[] | undefined | null) => values?.join(", ") ?? "";

const toList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function TeamFormModal({ title, submitLabel, team, loading, error, onSubmit, onClose }: TeamFormModalProps) {
  const [name, setName] = React.useState(team?.name ?? "");
  const [description, setDescription] = React.useState(team?.description ?? "");
  const [hackathonName, setHackathonName] = React.useState(team?.hackathonName ?? "");
  const [requiredRoles, setRequiredRoles] = React.useState(joinValues(team?.requiredRoles));
  const [stack, setStack] = React.useState(joinValues(team?.stack));
  const [slotsOpen, setSlotsOpen] = React.useState(String(team?.slotsOpen ?? 2));
  const [minRating, setMinRating] = React.useState(team && "minRating" in team && team.minRating !== null ? String(team.minRating) : "");
  const [isActive, setIsActive] = React.useState(team?.isActive ?? true);
  const [status, setStatus] = React.useState<"active" | "paused" | "closed">(
    (team && "status" in team ? (team.status as "active" | "paused" | "closed") : "active") ?? "active"
  );

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  React.useEffect(() => {
    setName(team?.name ?? "");
    setDescription(team?.description ?? "");
    setHackathonName(team?.hackathonName ?? "");
    setRequiredRoles(joinValues(team?.requiredRoles));
    setStack(joinValues(team?.stack));
    setSlotsOpen(String(team?.slotsOpen ?? 2));
    setMinRating(team && "minRating" in team && team.minRating !== null ? String(team.minRating) : "");
    setIsActive(team?.isActive ?? true);
    setStatus((team && "status" in team ? (team.status as "active" | "paused" | "closed") : "active") ?? "active");
  }, [team]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/75 px-4 py-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/30"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">
              Команда выглядит сильнее, когда сразу ясно, кого вы ищете, какой стек нужен и почему сюда хочется откликнуться.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition duration-300 ease-out hover:bg-slate-900"
          >
            Закрыть
          </button>
        </div>

        <form
          className="mt-5 grid flex-1 min-h-0 gap-4 overflow-y-auto pr-1 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const normalizedSlotsOpen = Number(slotsOpen || 0);
            const normalizedMinRating = minRating ? Number(minRating) : null;
            onSubmit({
              name,
              description,
              hackathonName,
              requiredRoles: toList(requiredRoles) as TeamRole[],
              stack: toList(stack),
              slotsOpen: Number.isFinite(normalizedSlotsOpen) ? Math.min(20, Math.max(2, normalizedSlotsOpen)) : 2,
              minRating: Number.isFinite(normalizedMinRating as number)
                ? Math.min(100, Math.max(0, normalizedMinRating as number))
                : null,
              isActive,
              status,
            });
          }}
        >
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Название
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
              placeholder="Команда для Viribus 2026"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Хакатон
            <input
              value={hackathonName}
              onChange={(event) => setHackathonName(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
              placeholder="Viribus Hackathon"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
            Описание
            <textarea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
              placeholder="Ищем backend и дизайнера"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
            Нужные роли
            <input
              value={requiredRoles}
              onChange={(event) => setRequiredRoles(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
              placeholder="backend, design"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
            Стек
            <input
              value={stack}
              onChange={(event) => setStack(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500"
              placeholder="Node.js, React, PostgreSQL"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Слоты
            <input
              type="number"
              min={2}
              max={20}
              value={slotsOpen}
              onChange={(event) => setSlotsOpen(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Мин. рейтинг
            <input
              type="number"
              min={0}
              max={100}
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
              placeholder="Необязательно"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Активная команда
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Статус
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "active" | "paused" | "closed")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
            >
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="closed">closed</option>
            </select>
          </label>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition duration-300 ease-out hover:bg-slate-900"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>

          {error ? <p className="md:col-span-2 text-sm text-red-300">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
