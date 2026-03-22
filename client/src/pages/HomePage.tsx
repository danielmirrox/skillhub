import React from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../api/client";
import { useAuth } from "../authContext";
import { GithubIcon, SparklesIcon } from "../components/ui/Icons";

export function HomePage() {
  const { loading, user } = useAuth();
  const [authing, setAuthing] = React.useState(false);

  const handleGithubLogin = () => {
    if (authing) return;
    setAuthing(true);
    window.location.assign(getApiUrl("/api/v1/auth/github"));
  };

  if (loading) {
    return <p className="text-slate-300">Проверяем авторизацию...</p>;
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <SparklesIcon className="mr-2 h-3.5 w-3.5" />
            SkillHub
          </div>
          <h2 className="text-balance mt-5 max-w-2xl text-[clamp(2rem,6.5vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-white">
            Мэтчинг участников и команд без лишних шагов.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            После входа доступны поиск людей, команды, AI-рейтинг и заявки. Интерфейс сразу ведёт в рабочие разделы.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Сценарий</p>
              <p className="mt-2 text-2xl font-semibold text-white">Главный поток</p>
              <p className="mt-2 text-sm text-slate-400">Один экран, один сценарий, один переход в рабочие разделы.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-400">Авторизация</p>
              <p className="mt-2 text-2xl font-semibold text-white">{user ? "Сессия активна" : "GitHub OAuth"}</p>
              <p className="mt-2 text-sm text-slate-400">Хедер меняется под состояние сессии автоматически.</p>
            </article>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-4 sm:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300 sm:text-sm sm:tracking-[0.24em]">Главное действие</p>
            <h3 className="text-balance mt-3 text-xl font-semibold text-white sm:text-2xl">{user ? "Продолжить работу" : "Войти и открыть продукт"}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">После GitHub входа открываются рабочие разделы без лишних переходов и дублирования сценария.</p>

            <div className="mt-6 grid gap-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px] sm:w-auto"
                  >
                    Перейти в дашборд
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 transition hover:bg-white/10 sm:w-auto"
                  >
                    Открыть профиль
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    disabled={authing}
                    className="inline-flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-100 via-cyan-200 to-sky-300 px-5 py-4 text-left font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950/10 text-slate-950">
                      <GithubIcon className="h-5 w-5" />
                    </span>
                    <span className="block">
                      <span className="block text-sm uppercase tracking-[0.2em] text-slate-700/70">GitHub</span>
                      <span className="mt-1 block text-lg">{authing ? "Открываем GitHub..." : "Войти через GitHub"}</span>
                    </span>
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 transition hover:bg-white/10"
                  >
                    Открыть страницу входа
                  </Link>
                </>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Что важно на показе</p>
              <p className="mt-2 leading-7">Предсказуемый вход, рабочий поиск, команды и профиль без лишнего шума.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
