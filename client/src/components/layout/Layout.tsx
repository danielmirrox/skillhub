import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import type { AuthUser } from "../../api/auth";
import { LogOutIcon, MenuIcon, SearchIcon, ShieldCheckIcon, UserRoundIcon, UsersIcon, XIcon } from "../ui/Icons";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl transition duration-200 ease-out",
    isActive
      ? "bg-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
      : "text-slate-300 hover:bg-white/8 hover:text-white hover:-translate-y-px",
  ].join(" ");

type LayoutProps = {
  user: AuthUser | null;
  loading: boolean;
  onLogout: () => void;
};

export function Layout({ user, loading, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

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
    <div className="min-h-dvh overflow-x-hidden text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link to="/" onClick={handleLogoClick} className="flex min-w-0 items-center gap-3 transition duration-300 ease-out hover:-translate-y-px">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-400 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 ease-out sm:h-11 sm:w-11">
              S
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-wide sm:text-lg">SkillHub</h1>
              <p className="hidden text-xs uppercase tracking-[0.18em] text-slate-400 sm:block">Платформа для IT-матчинга</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition duration-200 ease-out hover:-translate-y-px hover:bg-white/10 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {mobileMenuOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            <span>{mobileMenuOpen ? "Закрыть" : "Меню"}</span>
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
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-xl transition duration-200 ease-out hover:-translate-y-px hover:bg-white/8 hover:text-white"
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

          <nav
            aria-hidden={!mobileMenuOpen}
            className={[
              "grid w-full gap-2 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/90 text-sm backdrop-blur-xl transition-[max-height,opacity,transform,padding] duration-300 ease-out md:hidden",
              mobileMenuOpen
                ? "max-h-[calc(100dvh-5rem)] overflow-y-auto px-3 py-3 opacity-100 translate-y-0 overscroll-contain"
                : "max-h-0 pointer-events-none px-3 py-0 opacity-0 -translate-y-2",
            ].join(" ")}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Меню</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition duration-200 ease-out hover:-translate-y-px hover:bg-white/10"
                aria-label="Закрыть меню"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2 pt-1">
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
                    className="rounded-full px-4 py-2 text-left text-sm font-medium text-slate-300 backdrop-blur-xl transition duration-200 ease-out hover:-translate-y-px hover:bg-white/8 hover:text-white"
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
            </div>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div key={location.pathname} className="ui-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
