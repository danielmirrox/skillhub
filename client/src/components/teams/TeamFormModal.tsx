import React from "react";
import { createPortal } from "react-dom";
import type { TeamDetail, TeamFormPayload, TeamRole, TeamSummary } from "../../api/teams";

type EditableTeam = TeamSummary | TeamDetail | null;

type TeamFormModalProps = {
  title: string;
  submitLabel: string;
  team?: EditableTeam;
  loading?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onFieldChange?: (field: string) => void;
  onSubmit: (payload: TeamFormPayload) => void;
  onClose: () => void;
};

const joinValues = (values: string[] | undefined | null) => values?.join(", ") ?? "";

const toList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeTeamRoles = (value: string) => toList(value).map((role) => role.toLowerCase());

const requiredBadgeClass =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-rose-300/20 bg-rose-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100 leading-none";

const optionalBadgeClass =
  "inline-flex h-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 leading-none";

function validateTeamForm(values: {
  name: string;
  description: string;
  hackathonName: string;
  requiredRoles: string;
  stack: string;
  slotsOpen: string;
  minRating: string;
}) {
  const errors: Record<string, string> = {};

  if (values.name.trim().length < 2) {
    errors.name = "Название должно содержать минимум 2 символа.";
  }

  if (values.description.trim().length < 10) {
    errors.description = "Описание должно содержать минимум 10 символов.";
  }

  if (values.hackathonName.trim().length < 2) {
    errors.hackathonName = "Название хакатона должно содержать минимум 2 символа.";
  }

  if (toList(values.requiredRoles).length === 0) {
    errors.requiredRoles = "Укажи хотя бы одну нужную роль.";
  }

  if (toList(values.stack).length === 0) {
    errors.stack = "Укажи хотя бы один стек.";
  }

  const slots = Number(values.slotsOpen || 0);
  if (!Number.isInteger(slots) || slots < 2 || slots > 20) {
    errors.slotsOpen = "Слотов должно быть от 2 до 20.";
  }

  if (values.minRating.trim()) {
    const minRating = Number(values.minRating);
    if (!Number.isInteger(minRating) || minRating < 0 || minRating > 100) {
      errors.minRating = "Минимальный рейтинг должен быть от 0 до 100.";
    }
  }

  return errors;
}

export function TeamFormModal({
  title,
  submitLabel,
  team,
  loading,
  error,
  fieldErrors,
  onFieldChange,
  onSubmit,
  onClose,
}: TeamFormModalProps) {
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
  const [localErrors, setLocalErrors] = React.useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

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
    setLocalErrors({});
    setSubmitAttempted(false);
  }, [team]);

  if (typeof document === "undefined") {
    return null;
  }

  const mergedErrors = { ...(fieldErrors || {}), ...localErrors };

  const labelClassName = "flex flex-col gap-2 text-sm text-slate-300";
  const inputBaseClass =
    "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 transition duration-300 ease-out focus:border-cyan-300/30 focus:bg-white/[0.07] focus:outline-none";
  const inputErrorClass = "border-rose-300/40 bg-rose-300/10 focus:border-rose-300/50";
  const hasFieldError = (field: string) => Boolean(mergedErrors[field]);
  const fieldErrorText = (field: string) => mergedErrors[field];
  const setFieldAndClearError = <K extends "name" | "description" | "hackathonName" | "requiredRoles" | "stack" | "slotsOpen" | "minRating">(key: K, setter: (value: string) => void) =>
    (value: string) => {
      setter(value);
      onFieldChange?.(key);
      setLocalErrors((current) => {
        if (!current[key]) {
          return current;
        }

        const next = { ...current };
        delete next[key];
        return next;
      });
    };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 px-4 py-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center py-2 sm:items-center sm:py-4" onClick={(event) => event.stopPropagation()}>
        <div className="relative flex w-full max-w-2xl max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-950/30 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[1.75rem]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
          <div className="shrink-0 border-b border-white/10 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-balance text-xl font-semibold text-white sm:text-2xl">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Команда выглядит сильнее, когда сразу ясно, кого вы ищете, какой стек нужен и почему сюда хочется откликнуться.
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Поля со * обязательны, остальные можно оставить без изменений.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-300 transition duration-300 ease-out hover:bg-slate-900 sm:w-auto sm:px-3 sm:py-1"
              >
                Закрыть
              </button>
            </div>
          </div>

          <form
            className="grid flex-1 min-h-0 gap-4 overflow-y-auto overscroll-contain px-4 py-4 pr-3 pb-5 sm:px-6 sm:pb-6 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitAttempted(true);
              const normalizedSlotsOpen = Number(slotsOpen || 0);
              const normalizedMinRating = minRating ? Number(minRating) : null;

              const nextErrors = validateTeamForm({
                name,
                description,
                hackathonName,
                requiredRoles,
                stack,
                slotsOpen,
                minRating,
              });

              if (Object.keys(nextErrors).length > 0) {
                setLocalErrors(nextErrors);
                return;
              }

              setLocalErrors({});
              onSubmit({
                name,
                description,
                hackathonName,
                requiredRoles: normalizeTeamRoles(requiredRoles) as TeamRole[],
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
            <label className={labelClassName}>
              <span className="flex items-center gap-2">
                Название
                <span className={requiredBadgeClass}>*</span>
              </span>
              <input
                value={name}
                onChange={(event) => setFieldAndClearError("name", setName)(event.target.value)}
                required
                minLength={2}
                className={`${inputBaseClass} ${hasFieldError("name") ? inputErrorClass : ""}`}
                placeholder="Команда для Viribus 2026"
              />
              {submitAttempted && fieldErrorText("name") ? <span className="text-xs text-rose-200">{fieldErrorText("name")}</span> : null}
            </label>

            <label className={labelClassName}>
              <span className="flex items-center gap-2">
                Событие
                <span className={requiredBadgeClass}>*</span>
              </span>
              <input
                value={hackathonName}
                onChange={(event) => setFieldAndClearError("hackathonName", setHackathonName)(event.target.value)}
                required
                minLength={2}
                className={`${inputBaseClass} ${hasFieldError("hackathonName") ? inputErrorClass : ""}`}
                placeholder="Viribus Unitis 2026"
              />
              {submitAttempted && fieldErrorText("hackathonName") ? <span className="text-xs text-rose-200">{fieldErrorText("hackathonName")}</span> : null}
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                Описание
                <span className={requiredBadgeClass}>*</span>
              </span>
              <textarea
                rows={5}
                value={description}
                onChange={(event) => setFieldAndClearError("description", setDescription)(event.target.value)}
                required
                minLength={10}
                className={`${inputBaseClass} ${hasFieldError("description") ? inputErrorClass : ""}`}
                placeholder="Ищем backend и дизайнера для запуска продукта"
              />
              <span className="text-xs text-slate-500">Минимум 10 символов. Короткое описание не проходит проверку.</span>
              {submitAttempted && fieldErrorText("description") ? <span className="text-xs text-rose-200">{fieldErrorText("description")}</span> : null}
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                Нужные роли
                <span className={requiredBadgeClass}>*</span>
                <span className={optionalBadgeClass}>через запятую</span>
              </span>
              <input
                value={requiredRoles}
                onChange={(event) => setFieldAndClearError("requiredRoles", setRequiredRoles)(event.target.value)}
                required
                className={`${inputBaseClass} ${hasFieldError("requiredRoles") ? inputErrorClass : ""}`}
                placeholder="backend, design"
              />
              <span className="text-xs text-slate-500">Например: backend, design, mobile. Можно вводить с заглавной буквы, система приведёт роли к нужному виду.</span>
              {submitAttempted && fieldErrorText("requiredRoles") ? <span className="text-xs text-rose-200">{fieldErrorText("requiredRoles")}</span> : null}
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                Стек
                <span className={requiredBadgeClass}>*</span>
                <span className={optionalBadgeClass}>через запятую</span>
              </span>
              <input
                value={stack}
                onChange={(event) => setFieldAndClearError("stack", setStack)(event.target.value)}
                required
                className={`${inputBaseClass} ${hasFieldError("stack") ? inputErrorClass : ""}`}
                placeholder="Node.js, React, PostgreSQL"
              />
              <span className="text-xs text-slate-500">Покажи стек, по которому команду будут находить участники.</span>
              {submitAttempted && fieldErrorText("stack") ? <span className="text-xs text-rose-200">{fieldErrorText("stack")}</span> : null}
            </label>

            <label className={labelClassName}>
              <span className="flex items-center gap-2">
                Слоты
                <span className={requiredBadgeClass}>*</span>
              </span>
              <input
                type="number"
                min={2}
                max={20}
                value={slotsOpen}
                onChange={(event) => setFieldAndClearError("slotsOpen", setSlotsOpen)(event.target.value)}
                required
                inputMode="numeric"
                className={`${inputBaseClass} ${hasFieldError("slotsOpen") ? inputErrorClass : ""}`}
              />
              <span className="text-xs text-slate-500">От 2 до 20. Для команды нужен хотя бы один свободный слот.</span>
              {submitAttempted && fieldErrorText("slotsOpen") ? <span className="text-xs text-rose-200">{fieldErrorText("slotsOpen")}</span> : null}
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                Мин. рейтинг
                <span className={optionalBadgeClass}>необязательно</span>
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={minRating}
                onChange={(event) => setFieldAndClearError("minRating", setMinRating)(event.target.value)}
                inputMode="numeric"
                className={`${inputBaseClass} ${hasFieldError("minRating") ? inputErrorClass : ""}`}
                placeholder="Необязательно"
              />
              <span className="text-xs text-slate-500">Можно оставить пустым. Если указать, значение должно быть от 0 до 100.</span>
              {submitAttempted && fieldErrorText("minRating") ? <span className="text-xs text-rose-200">{fieldErrorText("minRating")}</span> : null}
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                Активная команда
                <span className={optionalBadgeClass}>необязательно</span>
              </span>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                Статус
                <span className={optionalBadgeClass}>необязательно</span>
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "active" | "paused" | "closed")}
                className={inputBaseClass}
              >
                <option value="active">Активна</option>
                <option value="paused">На паузе</option>
                <option value="closed">Закрыта</option>
              </select>
            </label>

            <div className="md:col-span-2 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-slate-700 px-4 py-3 text-slate-200 transition duration-300 ease-out hover:bg-slate-900 sm:w-auto sm:py-2"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
              >
                {submitLabel}
              </button>
            </div>

            {error ? <p className="md:col-span-2 text-sm text-red-300">{error}</p> : null}
          </form>
        </div>
      </div>
    </div>
    ,
    document.body
  );
}
