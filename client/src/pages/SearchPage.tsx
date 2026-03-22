import React from "react";
import { useAuth } from "../authContext";
import { getUsers, type UsersQuery, type UsersListItem } from "../api/users";
import { SearchFilters } from "../components/search/SearchFilters";
import { UserCard } from "../components/search/UserCard";
import { SearchIcon, UsersIcon } from "../components/ui/Icons";

const defaultFilters: UsersQuery = {
  search: "",
  role: "",
  grade: "",
  minRating: "",
  stack: "",
  page: 1,
  limit: 12,
};

function sortUsers(items: UsersListItem[], search: string) {
  return [...items].sort((left, right) => {
    if (search) {
      const relevanceDelta = (right.searchMatch?.score || 0) - (left.searchMatch?.score || 0);
      if (relevanceDelta !== 0) {
        return relevanceDelta;
      }
    }

    const leftScore = (left.rating?.score || 0) + (left.voteScore || 0) * 2 + (left.favoriteCount || 0) * 0.5;
    const rightScore = (right.rating?.score || 0) + (right.voteScore || 0) * 2 + (right.favoriteCount || 0) * 0.5;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return (right.rating?.score || 0) - (left.rating?.score || 0);
  });
}

export function SearchPage() {
  const { user: currentUser } = useAuth();
  const requestIdRef = React.useRef(0);
  const [filters, setFilters] = React.useState<UsersQuery>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = React.useState<UsersQuery>(defaultFilters);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<UsersListItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const currentPage = appliedFilters.page ?? 1;
  const pageSize = appliedFilters.limit ?? defaultFilters.limit ?? 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadUsers = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await getUsers(appliedFilters);
      if (requestIdRef.current !== requestId) {
        return;
      }

      setItems(sortUsers(response.items, String(appliedFilters.search || "")));
      setTotal(response.total);
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError("Не удалось загрузить участников.");
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [appliedFilters]);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

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

  const changePage = (nextPage: number) => {
    setAppliedFilters((current) => ({
      ...current,
      page: Math.min(Math.max(1, nextPage), totalPages),
    }));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-slate-950 to-violet-400/10 p-5 shadow-2xl shadow-slate-950/30 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Поиск</p>
          <h2 className="text-balance mt-3 max-w-2xl text-[clamp(1.7rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Ищи участников по роли, грейду и стеку
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Поиск работает в реальном времени: роль, грейд, минимальный рейтинг и стек быстро сужают выдачу.
            AI-релевантность и PRO-доступ к контактам учитываются автоматически.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 backdrop-blur-xl sm:p-4">
            <p className="text-sm text-slate-400">Всего найдено</p>
            <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-white sm:text-3xl">
              <UsersIcon className="h-5 w-5 text-cyan-200" />
              {total}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 backdrop-blur-xl sm:p-4">
            <p className="text-sm text-slate-400">Показано</p>
            <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-white sm:text-3xl">
              <SearchIcon className="h-5 w-5 text-cyan-200" />
              {items.length}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 backdrop-blur-xl sm:col-span-2 sm:p-4 lg:col-span-1 xl:col-span-2">
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
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={currentUser?.id ?? null}
                onSocialChange={(next) => {
                  setItems((currentItems) =>
                    sortUsers(
                      currentItems.map((item) => (item.id === user.id ? { ...item, ...next } : item)),
                      String(appliedFilters.search || ""),
                    ),
                  );
                }}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-xl">
              <p>
                Страница <span className="text-white">{currentPage}</span> из <span className="text-white">{totalPages}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Вперёд
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
