import { Link } from "react-router-dom";
import { RatingBadge } from "../profile/RatingBadge";
import type { UsersListItem } from "../../api/users";

type UserCardProps = {
  user: UsersListItem;
};

export function UserCard({ user }: UserCardProps) {
  const contactLabel = user.contactVisible ? "Контакт открыт" : "Контакт скрыт";
  const relevance = user.searchMatch?.score ?? null;

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition duration-300 ease-out hover:border-cyan-300/25 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-slate-950/35">
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
            {user.role ?? "роль не указана"} · {user.claimedGrade ?? "грейд не указан"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{user.bio || "Описание пока не заполнено."}</p>
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
            Стек не указан
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

      {user.searchMatch ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/8 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Релевантность</p>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              {relevance}/100
            </span>
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-300">
            {user.searchMatch.reasons.length > 0
              ? `Почему найден: ${user.searchMatch.reasons.join(' · ')}`
              : 'Результат ранжирован по совпадению с запросом и рейтингом.'}
          </p>
          {user.searchMatch.matchedTerms.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-cyan-100/90">
              {user.searchMatch.matchedTerms.slice(0, 4).map((term) => (
                <span key={term} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1">
                  {term}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Контакты</p>
          {user.contactVisible ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
              <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true" fill="currentColor">
                <path d="M6.5 8.75 4.75 7l-1 1 2.75 2.75 6-6-1-1z" />
              </svg>
              PRO unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
              <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true" fill="currentColor">
                <path d="M5 6V4a3 3 0 1 1 6 0v2h1.5A1.5 1.5 0 0 1 14 7.5v5A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-5A1.5 1.5 0 0 1 3.5 6H5Zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v2Z" />
              </svg>
              Только предпросмотр
            </span>
          )}
        </div>
        {user.contactVisible ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Telegram открыт</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">GitHub открыт</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Прямой контакт открыт</span>
          </div>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition duration-300 ease-out group-hover:border-amber-300/20 group-hover:bg-amber-300/10">
              <span className="blur-[2px]">@username</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true" fill="currentColor">
                  <path d="M5 6V4a3 3 0 1 1 6 0v2h1.5A1.5 1.5 0 0 1 14 7.5v5A1.5 1.5 0 0 1 12.5 14h-9A1.5 1.5 0 0 1 2 12.5v-5A1.5 1.5 0 0 1 3.5 6H5Zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v2Z" />
                </svg>
                Telegram
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition duration-300 ease-out group-hover:border-amber-300/20 group-hover:bg-amber-300/10">
              <span className="blur-[2px]">github.com/hidden</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true" fill="currentColor">
                  <path d="M8 .75a7.25 7.25 0 0 0-2.29 14.12c.36.07.49-.15.49-.34v-1.2c-2.01.44-2.43-.86-2.43-.86-.33-.85-.82-1.08-.82-1.08-.67-.46.05-.45.05-.45.75.05 1.14.78 1.14.78.66 1.14 1.73.81 2.15.62.07-.48.26-.81.46-.99-1.61-.18-3.3-.8-3.3-3.57 0-.79.28-1.44.74-1.95-.08-.18-.32-.93.07-1.94 0 0 .6-.19 1.96.74a6.77 6.77 0 0 1 1.78-.24c.6 0 1.2.08 1.78.24 1.36-.93 1.96-.74 1.96-.74.39 1.01.15 1.76.07 1.94.46.51.74 1.16.74 1.95 0 2.78-1.69 3.39-3.3 3.57.27.23.5.68.5 1.38v2.04c0 .19.13.41.5.34A7.25 7.25 0 0 0 8 .75Z" />
                </svg>
                GitHub
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-sm text-slate-400">
          {user.rating ? `AI-рейтинг ${user.rating.score}/100` : "Рейтинг не рассчитан"}
        </p>
        <Link
          to={`/users/${user.id}`}
          className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition duration-300 ease-out hover:bg-cyan-300/20 hover:text-white"
        >
          Открыть профиль
        </Link>
      </div>

      {!user.contactVisible ? <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-amber-300/10" /> : null}
    </article>
  );
}