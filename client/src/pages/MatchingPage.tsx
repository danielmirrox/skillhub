import { Link } from "react-router-dom";
import { ArrowRightIcon, SearchIcon, SparklesIcon, UsersIcon } from "../components/ui/Icons";

export function MatchingPage() {
  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-slate-950 to-emerald-300/10 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-cyan-200">
          <SparklesIcon className="h-4 w-4" />
          Подбор
        </p>
        <h2 className="text-balance mt-3 text-[clamp(1.7rem,5vw,3rem)] font-semibold tracking-tight text-white">
          Быстрый подбор
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
          Найти участников или подобрать команду.
        </p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-cyan-200">
            <SearchIcon className="h-4 w-4" />
            Для капитана
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Подобрать участников</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Открой поиск людей, отфильтруй роли, стек, грейд и рейтинг, затем перейди в профиль или добавь человека в избранное.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              <ArrowRightIcon className="h-4 w-4" />
              Открыть поиск участников
            </Link>
            <Link
              to="/favorites"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-100 hover:bg-white/10"
            >
              Список избранного
            </Link>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-emerald-200">
            <UsersIcon className="h-4 w-4" />
            Для участника
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Подобрать команду</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Открой ленту команд, посмотри роли, стек и свободные слоты, затем отправь заявку в подходящую команду.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              <ArrowRightIcon className="h-4 w-4" />
              Открыть команды
            </Link>
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-100 hover:bg-white/10"
            >
              Мои заявки
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
