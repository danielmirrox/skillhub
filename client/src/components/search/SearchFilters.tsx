import type { ClaimedGrade, UserRole, UsersQuery } from "../../api/users";
import { SearchIcon, SlidersIcon } from "../ui/Icons";

type SearchFiltersProps = {
  value: UsersQuery;
  onChange: (next: UsersQuery) => void;
  onSubmit: () => void;
};

const roleOptions: Array<{ label: string; value: UserRole | "" }> = [
  { label: "Все роли", value: "" },
  { label: "Фронтенд", value: "frontend" },
  { label: "Бэкенд", value: "backend" },
  { label: "Фуллстек", value: "fullstack" },
  { label: "Дизайн", value: "design" },
  { label: "ML", value: "ml" },
  { label: "Мобильная", value: "mobile" },
  { label: "Другое", value: "other" },
];

const gradeOptions: Array<{ label: string; value: ClaimedGrade | "" }> = [
  { label: "Все грейды", value: "" },
  { label: "Джун", value: "junior" },
  { label: "Мидл", value: "middle" },
  { label: "Сеньор", value: "senior" },
];

export function SearchFilters({ value, onChange, onSubmit }: SearchFiltersProps) {
  const activeFiltersCount = [value.search, value.role, value.grade, value.minRating, value.stack].filter(Boolean).length;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Filters</p>
          <h2 className="text-balance mt-2 text-2xl font-semibold">Фильтры поиска участников</h2>
          <p className="mt-2 text-sm text-slate-400">Настрой выдачу под команду, а не под шум.</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Активных фильтров: {activeFiltersCount}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => onChange({ search: "", role: "", grade: "", minRating: "", stack: "", page: 1, limit: 12 })}
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 sm:w-auto"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="w-full rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/25 sm:w-auto"
          >
            <SearchIcon className="mr-2 inline h-4 w-4" />
            Обновить результаты
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="flex flex-col gap-2 text-sm xl:col-span-2">
          Поиск
          <input
            className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 sm:text-sm"
            value={value.search ?? ""}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Имя, описание, био или стек"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Роль
          <select
            className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 sm:text-sm"
            value={value.role ?? ""}
            onChange={(event) => onChange({ ...value, role: event.target.value as UserRole | "" })}
          >
            {roleOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Грейд
          <select
            className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 sm:text-sm"
            value={value.grade ?? ""}
            onChange={(event) => onChange({ ...value, grade: event.target.value as ClaimedGrade | "" })}
          >
            {gradeOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Мин. рейтинг
          <input
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 sm:text-sm"
            value={value.minRating ?? ""}
            onChange={(event) => onChange({ ...value, minRating: event.target.value })}
            placeholder="70"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm xl:col-span-3">
          Стек
          <input
            className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 sm:text-sm"
            value={value.stack ?? ""}
            onChange={(event) => onChange({ ...value, stack: event.target.value })}
            placeholder="React, TypeScript"
          />
        </label>

        <div className="flex items-end xl:col-span-2">
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30"
          >
            <SlidersIcon className="h-4 w-4" />
            Применить фильтры
          </button>
        </div>
      </div>
    </section>
  );
}
