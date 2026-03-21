import { useNavigate } from "react-router-dom";
import { clearDemoAuthUser, setDemoAuthUser, DEMO_AUTH_USER, DEMO_PRO_AUTH_USER } from "../api/demoAuth";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (isPro = false) => {
    const user = isPro ? DEMO_PRO_AUTH_USER : DEMO_AUTH_USER;
    setDemoAuthUser(user);
    navigate("/dashboard", { replace: true });
  };

  const handleReset = () => {
    clearDemoAuthUser();
    navigate("/login", { replace: true });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Демо-вход
        </div>
        <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          SkillHub делает поиск людей и команд быстрым и понятным.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          GitHub OAuth временно заменён демо-входом, чтобы можно было безопасно проверять поиск,
          PRO-доступ, заявки и редактирование профиля без лишних барьеров.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">Поиск</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">AI-рейтинг</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">Заявки</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-200">Импорт GitHub</span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Для теста</p>
            <p className="mt-2 text-2xl font-semibold text-white">1 клик</p>
            <p className="mt-2 text-sm text-slate-400">Попадаешь в дашборд и сразу видишь весь поток продукта.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Для PRO</p>
            <p className="mt-2 text-2xl font-semibold text-white">Доступно</p>
            <p className="mt-2 text-sm text-slate-400">Рекомендации и контактная информация открываются по правилам.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Флоу</p>
            <p className="mt-2 text-2xl font-semibold text-white">Живой</p>
            <p className="mt-2 text-sm text-slate-400">Поиск → профиль → заявки → скоринг работает end-to-end.</p>
          </article>
        </div>
      </div>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-slate-950 to-violet-400/10 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Панель входа</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Войти в демо</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Выбирай обычный или PRO-режим, чтобы проверить интерфейс в реальном состоянии без
            GitHub OAuth.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => handleLogin(false)}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-4 text-left font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/30 text-sm font-black text-slate-950">1</span>
              <span className="block text-sm uppercase tracking-[0.2em] text-slate-800/70">Обычный</span>
              <span className="mt-1 block text-lg">Войти как демо-пользователь</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogin(true)}
              className="inline-flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-left font-semibold text-emerald-50 shadow-lg shadow-emerald-950/20 transition hover:translate-y-[-1px]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-200/30 bg-emerald-200/15 text-sm font-black text-emerald-50">
                PRO
              </span>
              <span className="block text-sm uppercase tracking-[0.2em] text-emerald-200/80">PRO</span>
              <span className="mt-1 block text-lg">Войти как PRO-демо</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left font-medium text-slate-200 transition hover:bg-white/10"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-sm font-black text-slate-200">×</span>
              Сбросить демо-вход
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Кнопка GitHub вернётся позже, когда подключим настоящий OAuth-флоу.
          </p>
        </div>
      </aside>
    </section>
  );
}
