import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">SkillHub</h1>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link to="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
