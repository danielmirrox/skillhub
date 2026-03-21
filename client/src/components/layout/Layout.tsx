import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl transition",
    isActive
      ? "bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
      : "text-slate-300 hover:bg-white/8 hover:text-white",
  ].join(" ");

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" onClick={handleLogoClick} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">SkillHub</h1>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Платформа для хакатон-матчинга</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? "Закрыть" : "Меню"}
          </button>

          <nav className="hidden items-center justify-end gap-2 text-sm md:flex">
            <NavLink to="/dashboard" className={navLinkClassName}>
              Дашборд
            </NavLink>
            <NavLink to="/search" className={navLinkClassName}>
              Поиск
            </NavLink>
            <NavLink to="/teams" className={navLinkClassName}>
              Команды
            </NavLink>
            <NavLink to="/applications" className={navLinkClassName}>
              Заявки
            </NavLink>
            <NavLink to="/profile" className={navLinkClassName}>
              Профиль
            </NavLink>
            <NavLink to="/login" className={navLinkClassName}>
              Вход
            </NavLink>
          </nav>

          {mobileMenuOpen ? (
            <nav className="grid w-full gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-3 text-sm backdrop-blur-xl md:hidden">
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                Дашборд
              </NavLink>
              <NavLink to="/search" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                Поиск
              </NavLink>
              <NavLink to="/teams" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                Команды
              </NavLink>
              <NavLink to="/applications" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                Заявки
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                Профиль
              </NavLink>
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                Вход
              </NavLink>
            </nav>
          ) : null}
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
