import React from "react";
import { getUsers, type UsersQuery, type UsersListItem } from "../api/users";
import { SearchFilters } from "../components/search/SearchFilters";
import { UserCard } from "../components/search/UserCard";

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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-slate-950 to-violet-400/10 p-7 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Search</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Ищи участников по роли, грейду и стеку
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Живой фронт к API `/api/v1/users`: фильтры по role, grade, minRating и stack работают,
            а PRO-видимость контактов и рекомендаций подтягивается из бэка.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Всего найдено</p>
            <p className="mt-2 text-3xl font-semibold text-white">{total}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">На экране</p>
            <p className="mt-2 text-3xl font-semibold text-white">{items.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <p className="text-sm text-slate-400">Фокус</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              PRO-режим открывает рекомендации и контактные данные только там, где это действительно нужно.
            </p>
          </article>
        </div>
      </section>

      <SearchFilters value={filters} onChange={setFilters} onSubmit={handleSubmit} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 backdrop-blur-xl">
        <p>
          Найдено: <span className="text-slate-100">{total}</span>
        </p>
        <p>Показаны первые {items.length} карточек</p>
      </div>

      {loading ? <p className="text-slate-300">Загружаем участников...</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-slate-300 backdrop-blur-xl">
          Ничего не нашлось. Попробуй ослабить фильтры.
        </section>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : null}
    </div>
  );
}