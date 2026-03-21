import { NavLink, Outlet } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl transition",
    isActive
      ? "bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
      : "text-slate-300 hover:bg-white/8 hover:text-white",
  ].join(" ");

export function Layout() {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">SkillHub</h1>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Hackathon matching OS</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <NavLink to="/dashboard" className={navLinkClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/search" className={navLinkClassName}>
              Search
            </NavLink>
            <NavLink to="/applications" className={navLinkClassName}>
              Applications
            </NavLink>
            <NavLink to="/profile" className={navLinkClassName}>
              Profile
            </NavLink>
            <NavLink to="/login" className={navLinkClassName}>
              Login
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
