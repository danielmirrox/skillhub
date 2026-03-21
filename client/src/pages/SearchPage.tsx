import React from "react";
import { getUsers, type UsersQuery, type UsersListItem } from "../api/users";
import { SearchFilters } from "../components/search/SearchFilters";
import { UserCard } from "../components/search/UserCard";
import { SearchIcon, SparklesIcon, UsersIcon } from "../components/ui/Icons";

const defaultFilters: UsersQuery = {
  search: "",
  role: "",
  grade: "",
  minRating: "",
  stack: "",
  page: 1,
  limit: 12,
};

export function SearchPage() {
  const [filters, setFilters] = React.useState<UsersQuery>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = React.useState<UsersQuery>(defaultFilters);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<UsersListItem[]>([]);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getUsers(appliedFilters)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setTotal(response.total);
      })
      .catch(() => {
        if (!active) return;
        setError("Не удалось загрузить участников.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  const handleSubmit = () => {
    setAppliedFilters({
      ...filters,
      page: 1,
      limit: 12,
    });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-slate-950 to-violet-400/10 p-7 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Поиск</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Ищи участников по роли, грейду и стеку
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Живой экран поверх API `/api/v1/users`. Фильтры по роли, грейду, минимальному рейтингу и стеку
            работают, а AI-релевантность и PRO-доступ к контактам подтягиваются из бэка.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">
            <SparklesIcon className="h-4 w-4" />
            <span className="font-medium">AI-релевантность и рейтинг подсвечены прямо в карточках</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Всего найдено</p>
            <p className="mt-2 inline-flex items-center gap-2 text-3xl font-semibold text-white">
              <UsersIcon className="h-5 w-5 text-cyan-200" />
              {total}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">На экране</p>
            <p className="mt-2 inline-flex items-center gap-2 text-3xl font-semibold text-white">
              <SearchIcon className="h-5 w-5 text-cyan-200" />
              {items.length}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-slate-400">Фокус</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              PRO-режим открывает рекомендации и контактные данные только там, где это действительно полезно.
            </p>
          </article>
        </div>
      </section>

      <SearchFilters value={filters} onChange={setFilters} onSubmit={handleSubmit} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 backdrop-blur-xl">
        <p>
          Найдено: <span className="text-slate-100">{total}</span>
        </p>
        <p>{appliedFilters.search ? "Сортировка по релевантности и рейтингу" : "Сортировка по AI-рейтингам"}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/10" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="h-7 w-20 animate-pulse rounded-full bg-white/10" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="h-7 w-16 animate-pulse rounded-full bg-white/10" />
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-slate-300 backdrop-blur-xl">
          <p className="text-lg font-semibold text-white">Ничего не нашлось</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Попробуй ослабить фильтры, изменить грейд или убрать лишние ограничения по стеку. Так проще увидеть скрытые совпадения.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              Сбросить фильтры
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100 hover:bg-white/10"
            >
              Повторить поиск
            </button>
          </div>
        </section>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="space-y-4">
          {appliedFilters.search ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-300/15 via-slate-950 to-violet-400/10 px-4 py-3 backdrop-blur-xl">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-200">
                <SparklesIcon className="h-3.5 w-3.5" />
                AI-рейтинг
              </p>
              <p className="mt-2 text-sm text-cyan-50/95">
                Поиск работает гибридно: сначала учитываются совпадения по имени, стеку, био, роли и проектам,
                затем рейтинг.
              </p>
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
