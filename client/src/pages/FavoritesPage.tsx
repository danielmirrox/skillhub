import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext";
import { getFavoriteUsers, type UsersListItem } from "../api/users";
import { UserCard } from "../components/search/UserCard";
import { ArrowRightIcon, SparklesIcon, StarIcon, UsersIcon } from "../components/ui/Icons";

export function FavoritesPage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<UsersListItem[]>([]);

  const loadFavorites = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getFavoriteUsers();
      setItems(response.items);
    } catch {
      setError("Не удалось загрузить избранных участников.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const total = items.length;

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/10 via-slate-950 to-cyan-300/10 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-emerald-200">
              <StarIcon className="h-4 w-4" />
              Избранные
            </p>
            <h2 className="text-balance mt-3 text-[clamp(1.7rem,5vw,3rem)] font-semibold tracking-tight text-white">
              Избранные участники
            </h2>
            <p className="mt-4 max-w-3xl text-pretty text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Здесь собраны люди, которых ты отметил для быстрого доступа.
            </p>
          </div>

          <div className="grid gap-3">
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">В избранном</p>
              <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-white">
                <UsersIcon className="h-5 w-5 text-emerald-200" />
                {total}
              </p>
            </article>
          </div>
        </div>
      </article>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <article key={index} className="h-72 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : items.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-slate-300 backdrop-blur-xl">
          <p className="text-lg font-semibold text-white">Пока пусто</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Добавляй людей в избранное прямо из карточек поиска или публичного профиля. Потом они появятся здесь.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              <ArrowRightIcon className="h-4 w-4" />
              Перейти к поиску
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-100 hover:bg-white/10"
            >
              <SparklesIcon className="h-4 w-4" />
              На дашборд
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUser?.id ?? null}
              onSocialChange={(next) => {
                setItems((currentItems) => {
                  if (!next.isFavorite) {
                    return currentItems.filter((item) => item.id !== user.id);
                  }

                  return currentItems.map((item) => (
                    item.id === user.id
                      ? { ...item, ...next }
                      : item
                  ));
                });
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
