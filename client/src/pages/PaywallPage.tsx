import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEMO_AUTH_CHANGE_EVENT, promoteDemoAuthUserToPro } from "../api/demoAuth";
import { upgradeToPro } from "../api/profile";
import { ArrowRightIcon, LockIcon, ShieldCheckIcon, SparklesIcon } from "../components/ui/Icons";

export function PaywallPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePurchase = async () => {
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
    <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
        <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
          <LockIcon className="mr-2 h-3.5 w-3.5" />
          PRO paywall
        </div>
        <h2 className="text-balance mt-5 max-w-2xl text-[clamp(2rem,6.4vw,4.2rem)] font-semibold leading-[1.03] tracking-tight text-white">
          Экран оплаты уже на месте и готов к подключению YuMoney.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Здесь позже подключится YuMoney. Для защиты достаточно показать сам экран, сценарий переключения
          и то, что он переводит пользователя в PRO-режим.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">План</p>
            <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-white">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-200" />
              PRO
            </p>
            <p className="mt-2 text-sm text-slate-400">Контакты, расширенные инсайты и более уверенная выдача.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Платёж</p>
            <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-white">
              <SparklesIcon className="h-5 w-5 text-cyan-200" />
              Готов
            </p>
            <p className="mt-2 text-sm text-slate-400">Кнопка уже переводит сценарий в PRO до подключения YuMoney.</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <p className="text-sm text-slate-400">Флоу</p>
            <p className="mt-2 text-2xl font-semibold text-white">Стабильный</p>
            <p className="mt-2 text-sm text-slate-400">После оплаты возвращаемся в профиль и обновляем состояние хедера.</p>
          </article>
        </div>
      </article>

      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-300/15 via-slate-950 to-cyan-300/10 p-4 sm:p-6">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-emerald-300 sm:text-sm sm:tracking-[0.24em]">
            <SparklesIcon className="h-4 w-4" />
            Платёж позже
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Оплата PRO</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Эта страница уже отделяет покупку от профиля. Когда подключите платёжку, достаточно заменить кнопку
            подтверждения на реальный checkout.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-5 py-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowRightIcon className="h-4 w-4" />
              {loading ? "Проверяем оплату..." : "Оплатить и включить PRO"}
            </button>
            <Link
              to="/profile"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium text-slate-100 transition hover:bg-white/10"
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
