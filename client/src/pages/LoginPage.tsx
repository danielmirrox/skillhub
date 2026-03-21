import { API_BASE_URL } from "../api/client";

export function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/v1/auth/github`;
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
      <h2 className="text-2xl font-semibold">Вход в SkillHub</h2>
      <p className="mt-2 text-slate-300">
        Войди через GitHub, чтобы открыть dashboard и продолжить работу.
      </p>
      <button
        type="button"
        onClick={handleLogin}
        className="mt-6 rounded-lg bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
      >
        Войти через GitHub
      </button>
    </section>
  );
}
