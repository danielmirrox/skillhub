import { Link } from "react-router-dom";
import type { AuthUser } from "../api/auth";

type DashboardPageProps = {
  user: AuthUser;
};

export function DashboardPage({ user }: DashboardPageProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
      <p className="text-sm text-slate-400">Авторизован как</p>
      <h2 className="mt-2 text-2xl font-semibold">
        {user.displayName ?? user.username}
      </h2>
      <p className="mt-4 text-slate-300">
        Dashboard-заглушка готова. Следующий шаг: профиль и AI-скоринг.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/profile" className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950">
          Мой профиль
        </Link>
        <Link to="/profile/edit" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200">
          Редактировать профиль
        </Link>
      </div>
    </section>
  );
}
