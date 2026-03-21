import { Link } from "react-router-dom";
import type { AuthUser } from "../api/auth";

type DashboardPageProps = {
  user: AuthUser;
};

export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Dashboard</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              {(user.displayName ?? user.username).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {user.displayName ?? user.username}
              </h2>
              <p className="mt-2 text-slate-400">Авторизован и готов тестировать product flow.</p>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Dashboard теперь работает как навигационный хаб: с него удобно запускать поиск,
            applications, редактирование профиля и проверку AI-скоринга.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Flow</p>
              <p className="mt-2 text-2xl font-semibold text-white">Search</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Flow</p>
              <p className="mt-2 text-2xl font-semibold text-white">Applications</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Flow</p>
              <p className="mt-2 text-2xl font-semibold text-white">Profile</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick actions</p>
          <Link
            to="/search"
            className="block rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            Поиск участников
          </Link>
          <Link
            to="/applications"
            className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 hover:bg-white/10"
          >
            Applications
          </Link>
          <Link
            to="/profile"
            className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 hover:bg-white/10"
          >
            Мой профиль
          </Link>
          <Link
            to="/profile/edit"
            className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 hover:bg-white/10"
          >
            Редактировать профиль
          </Link>
        </aside>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Статус</p>
          <p className="mt-2 text-xl font-semibold text-white">Демо-режим готов</p>
          <p className="mt-2 text-sm text-slate-400">Можно прогонять все экраны без OAuth.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-sm text-slate-400">UX</p>
          <p className="mt-2 text-xl font-semibold text-white">Более выразительный UI</p>
          <p className="mt-2 text-sm text-slate-400">Карточки, фон, навигация и hero-блоки уже обновлены.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Следующий шаг</p>
          <p className="mt-2 text-xl font-semibold text-white">Подключить прод-данные</p>
          <p className="mt-2 text-sm text-slate-400">Когда будет нужен real backend, этот UI уже готов к нему.</p>
        </article>
      </section>
    </section>
  );
}
