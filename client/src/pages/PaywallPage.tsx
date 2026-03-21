import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEMO_AUTH_CHANGE_EVENT, promoteDemoAuthUserToPro } from "../api/demoAuth";
import { upgradeToPro } from "../api/profile";

export function PaywallPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleMockPurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      await upgradeToPro();
      promoteDemoAuthUserToPro();
      window.dispatchEvent(new Event(DEMO_AUTH_CHANGE_EVENT));
      navigate("/profile", { replace: true });
    } catch (err) {
      const typed = err as Error;
      setError(typed.message || "Не удалось включить PRO-режим.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
          PRO paywall
        </div>
        <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Экран оплаты уже на месте, но пока работает как мок.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Здесь позже подключится YuMoney. Для защиты достаточно показать сам экран, сценарий переключения
          и то, что он реально ведёт в PRO-режим на текущем демо.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">План</p>
            <p className="mt-2 text-2xl font-semibold text-white">PRO</p>
            <p className="mt-2 text-sm text-slate-400">Контакты, расширенные инсайты и более уверенная выдача.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Платёж</p>
            <p className="mt-2 text-2xl font-semibold text-white">Mock</p>
            <p className="mt-2 text-sm text-slate-400">Кнопка симулирует успешную оплату до интеграции YuMoney.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Флоу</p>
            <p className="mt-2 text-2xl font-semibold text-white">Стабильный</p>
            <p className="mt-2 text-sm text-slate-400">После оплаты возвращаемся в профиль и обновляем состояние хедера.</p>
          </article>
        </div>
      </article>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-300/15 via-slate-950 to-cyan-300/10 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">YuMoney later</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Демо-оплата PRO</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Эта страница уже отделяет покупку от профиля. Когда подключите платёжку, достаточно заменить кнопку
            мок-подтверждения на реальный checkout.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handleMockPurchase}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Проверяем оплату..." : "Оплатить и включить PRO"}
            </button>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 transition hover:bg-white/10"
            >
              Вернуться в профиль
            </Link>
          </div>

          {error ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Будущая интеграция</p>
            <p className="mt-2 leading-7">
              Здесь можно подключить YuMoney checkout, callback и запись результата оплаты в backend, не трогая
              остальной UX.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}
