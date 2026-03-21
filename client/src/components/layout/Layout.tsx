import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import type { AuthUser } from "../../api/auth";
import { LogOutIcon, SearchIcon, ShieldCheckIcon, UserRoundIcon, UsersIcon } from "../ui/Icons";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl transition",
    isActive
      ? "bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
      : "text-slate-300 hover:bg-white/8 hover:text-white",
  ].join(" ");

type LayoutProps = {
  user: AuthUser | null;
  loading: boolean;
  onLogout: () => void;
};

export function Layout({ user, loading, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const authenticatedLinks = [
    { to: "/dashboard", label: "Дашборд" },
    { to: "/search", label: "Поиск", icon: SearchIcon },
    { to: "/teams", label: "Команды", icon: UsersIcon },
    { to: "/applications", label: "Заявки", icon: ShieldCheckIcon },
  ];

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">SkillHub</h1>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Платформа для IT-матчинга</p>
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
            {user ? (
              <>
                {authenticatedLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                      <span className="inline-flex items-center gap-2">
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
                <NavLink to="/profile" className={navLinkClassName}>
                  <span className="inline-flex items-center gap-2">
                    <UserRoundIcon className="h-4 w-4" />
                    Профиль
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-xl transition hover:bg-white/8 hover:text-white"
                  disabled={loading}
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOutIcon className="h-4 w-4" />
                    Выход
                  </span>
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClassName}>
                <span className="inline-flex items-center gap-2">
                  <UserRoundIcon className="h-4 w-4" />
                  Вход
                </span>
              </NavLink>
            )}
          </nav>

          {mobileMenuOpen ? (
            <nav className="grid w-full gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-3 text-sm backdrop-blur-xl md:hidden">
              {user ? (
                <>
                  {authenticatedLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                        <span className="inline-flex items-center gap-2">
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                  <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                    <span className="inline-flex items-center gap-2">
                      <UserRoundIcon className="h-4 w-4" />
                      Профиль
                    </span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="rounded-full px-4 py-2 text-left text-sm font-medium text-slate-300 backdrop-blur-xl transition hover:bg-white/8 hover:text-white"
                    disabled={loading}
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogOutIcon className="h-4 w-4" />
                      Выход
                    </span>
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={navLinkClassName}>
                  <span className="inline-flex items-center gap-2">
                    <UserRoundIcon className="h-4 w-4" />
                    Вход
                  </span>
                </NavLink>
              )}
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
