import { Link } from "react-router-dom";
import { RatingBadge } from "../profile/RatingBadge";
import type { UsersListItem } from "../../api/users";

type UserCardProps = {
  user: UsersListItem;
};

export function UserCard({ user }: UserCardProps) {
  const contactLabel = user.contactVisible ? "Контакт открыт" : "Контакт скрыт";

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition hover:border-cyan-300/25 hover:bg-white/[0.07]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="flex items-start gap-4">
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-16 w-16 rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-white">{user.displayName}</h3>
            {user.isPro ? (
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                PRO
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {user.role ?? "role not set"} · {user.claimedGrade ?? "grade not set"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{user.bio || "Bio is empty."}</p>
        </div>
        {user.rating ? <RatingBadge score={user.rating.score} /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {user.primaryStack.slice(0, 4).map((stack) => (
          <span
            key={stack}
            className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-200"
          >
            {stack}
          </span>
        ))}
        {user.primaryStack.length === 0 ? (
          <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-400">
            Stack not set
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={`rounded-full border px-3 py-1 ${user.contactVisible ? "border-emerald-300/20 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300"}`}
        >
          {contactLabel}
        </span>
        {user.rating ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
            {user.rating.grade}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-sm text-slate-400">
          {user.rating ? `AI-рейтинг ${user.rating.score}/100` : "Рейтинг не рассчитан"}
        </p>
        <Link
          to={`/users/${user.id}`}
          className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-300/20 hover:text-white"
        >
          Открыть профиль
        </Link>
      </div>
    </article>
  );
}