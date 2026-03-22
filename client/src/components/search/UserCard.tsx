import { Link } from "react-router-dom";
import { RatingBadge } from "../profile/RatingBadge";
import type { UsersListItem } from "../../api/users";
import { ArrowRightIcon, GithubIcon, LockIcon, ShieldCheckIcon, SparklesIcon } from "../ui/Icons";

type UserCardProps = {
  user: UsersListItem;
};

export function UserCard({ user }: UserCardProps) {
  const contactLabel = user.contactVisible ? "Контакт открыт" : "Контакт скрыт";
  const relevance = user.searchMatch?.score ?? null;

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition duration-300 ease-out hover:border-cyan-300/25 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-slate-950/35 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-14 w-14 rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/20 sm:h-16 sm:w-16"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-balance text-[1.05rem] font-semibold tracking-tight text-white sm:text-lg">{user.displayName}</h3>
            {user.isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                PRO
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {user.role ?? "роль не указана"} · {user.claimedGrade ?? "грейд не указан"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{user.bio || "Описание пока не заполнено."}</p>
        </div>
        {user.rating ? (
          <div className="flex items-start justify-between gap-2 sm:flex-col sm:items-end">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <SparklesIcon className="h-3.5 w-3.5" />
              AI-рейтинг
            </span>
            <RatingBadge score={user.rating.score} />
          </div>
        ) : null}
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
              ? `Причина совпадения: ${user.searchMatch.reasons.join(' · ')}`
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
              <ShieldCheckIcon className="h-3 w-3" />
              PRO открыт
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
              <LockIcon className="h-3 w-3" />
              Контакты скрыты
            </span>
          )}
        </div>
        {user.contactVisible ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Telegram открыт</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">GitHub открыт</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Контакт доступен</span>
          </div>
        ) : (
          <div className="mt-3 grid select-none gap-2 text-xs text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition duration-300 ease-out group-hover:border-amber-300/20 group-hover:bg-amber-300/10">
              <span className="pointer-events-none select-none blur-[2px]">@username</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <LockIcon className="h-3 w-3" />
                Telegram
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition duration-300 ease-out group-hover:border-amber-300/20 group-hover:bg-amber-300/10">
              <span className="pointer-events-none select-none blur-[2px]">github.com/hidden</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <GithubIcon className="h-3 w-3" />
                GitHub
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          {user.rating ? `AI-рейтинг ${user.rating.score}/100` : "Рейтинг не рассчитан"}
        </p>
        <Link
          to={`/users/${user.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition duration-300 ease-out hover:bg-cyan-300/20 hover:text-white sm:w-auto"
        >
          <ArrowRightIcon className="h-4 w-4" />
          Открыть профиль
        </Link>
      </div>

      {!user.contactVisible ? <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-amber-300/10" /> : null}
    </article>
  );
}
