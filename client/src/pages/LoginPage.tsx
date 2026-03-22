import React from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../api/client";
import {
  clearDemoAuthUser,
  isDemoAuthEnabled,
  setDemoAuthUser,
  DEMO_AUTH_USER,
  DEMO_PRO_AUTH_USER,
} from "../api/demoAuth";
import { GithubIcon, LogOutIcon, ShieldCheckIcon, SparklesIcon } from "../components/ui/Icons";

export function LoginPage() {
  const navigate = useNavigate();
  const demoAuthEnabled = isDemoAuthEnabled();
  const [authing, setAuthing] = React.useState(false);

  const handleLogin = (isPro = false) => {
    const user = isPro ? DEMO_PRO_AUTH_USER : DEMO_AUTH_USER;
    setDemoAuthUser(user);
    navigate("/dashboard", { replace: true });
  };

  const handleReset = () => {
    clearDemoAuthUser();
    navigate("/login", { replace: true });
  };

  const handleGithubLogin = () => {
    if (authing) return;
    setAuthing(true);
    window.location.assign(getApiUrl("/api/v1/auth/github"));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
          <GithubIcon className="mr-2 h-3.5 w-3.5" />
          GitHub OAuth
        </div>
        <h2 className="text-balance mt-5 max-w-2xl text-[clamp(2rem,6.5vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-white">
          SkillHub делает поиск людей и команд быстрым и понятным.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Основной путь входа ведёт через GitHub OAuth. После авторизации открываются поиск, команды, заявки и профиль.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Вход</p>
            <p className="mt-2 text-2xl font-semibold text-white">GitHub OAuth</p>
            <p className="mt-2 text-sm text-slate-400">Один основной сценарий без лишних развилок.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Результат</p>
            <p className="mt-2 text-2xl font-semibold text-white">Рабочий экран</p>
            <p className="mt-2 text-sm text-slate-400">После входа открывается полноценный продуктовый интерфейс.</p>
          </article>
        </div>
      </div>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300 sm:text-sm sm:tracking-[0.24em]">Панель входа</p>
          <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Войти</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Нажми кнопку GitHub, чтобы перейти в авторизацию и открыть рабочие разделы продукта.
          </p>

          <div className="mt-6 grid gap-3">
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

            {demoAuthEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => handleLogin(false)}
                  className="inline-flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-4 text-left font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/30 text-slate-950">
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                  <span className="block">
                    <span className="block text-sm uppercase tracking-[0.2em] text-slate-800/70">Локально</span>
                    <span className="mt-1 block text-lg">Войти как демо-пользователь</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLogin(true)}
                  className="inline-flex w-full items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-left font-semibold text-emerald-50 shadow-lg shadow-emerald-950/20 transition hover:translate-y-[-1px]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-200/30 bg-emerald-200/15 text-emerald-50">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </span>
                  <span className="block">
                    <span className="block text-sm uppercase tracking-[0.2em] text-emerald-200/80">PRO</span>
                    <span className="mt-1 block text-lg">Войти как PRO-демо</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left font-medium text-slate-200 transition hover:bg-white/10"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200">
                    <LogOutIcon className="h-5 w-5" />
                  </span>
                  Сбросить демо-вход
                </button>
              </>
            ) : null}
          </div>

          <p className="mt-5 text-sm text-slate-400">GitHub-кнопка открывает серверный OAuth-флоу.</p>
        </div>
      </aside>
    </section>
  );
}
