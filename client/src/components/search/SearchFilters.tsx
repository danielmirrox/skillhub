import type { ClaimedGrade, UserRole, UsersQuery } from "../../api/users";

type SearchFiltersProps = {
  value: UsersQuery;
  onChange: (next: UsersQuery) => void;
  onSubmit: () => void;
};

const roleOptions: Array<{ label: string; value: UserRole | "" }> = [
  { label: "Все роли", value: "" },
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Fullstack", value: "fullstack" },
  { label: "Design", value: "design" },
  { label: "ML", value: "ml" },
  { label: "Mobile", value: "mobile" },
  { label: "Other", value: "other" },
];

const gradeOptions: Array<{ label: string; value: ClaimedGrade | "" }> = [
  { label: "Все грейды", value: "" },
  { label: "Junior", value: "junior" },
  { label: "Middle", value: "middle" },
  { label: "Senior", value: "senior" },
];

export function SearchFilters({ value, onChange, onSubmit }: SearchFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Filters</p>
          <h2 className="mt-2 text-2xl font-semibold">Поиск участников</h2>
          <p className="mt-2 text-sm text-slate-400">Настрой точность выдачи под команду, а не под шум.</p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/25"
        >
          Обновить выдачу
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="flex flex-col gap-2 text-sm xl:col-span-2">
          Поиск
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20"
            value={value.search ?? ""}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Имя, описание, био"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Роль
          <select
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-inner shadow-black/20"
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
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-inner shadow-black/20"
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
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20"
            value={value.minRating ?? ""}
            onChange={(event) => onChange({ ...value, minRating: event.target.value })}
            placeholder="70"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm xl:col-span-3">
          Стек
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20"
            value={value.stack ?? ""}
            onChange={(event) => onChange({ ...value, stack: event.target.value })}
            placeholder="React, TypeScript"
          />
        </label>

        <div className="flex items-end xl:col-span-2">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30"
          >
            Применить фильтры
          </button>
        </div>
      </div>
    </section>
  );
}