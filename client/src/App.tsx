import React from "react";
import { Navigate, Outlet, useLocation, useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { getCurrentUser } from "./api/auth";
import { DEMO_AUTH_CHANGE_EVENT } from "./api/demoAuth";
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SearchPage } from "./pages/SearchPage";
import { TeamDetailPage } from "./pages/TeamDetailPage";
import { TeamsPage } from "./pages/TeamsPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import type { AuthUser } from "./api/auth";

type AuthContextValue = {
  loading: boolean;
  user: AuthUser | null;
};

const AuthContext = React.createContext<AuthContextValue>({
  loading: true,
  user: null,
});

function useAuth() {
  return React.useContext(AuthContext);
}

function AuthStatus() {
  return <p className="text-slate-300">Проверяем авторизацию...</p>;
}

function ErrorRoute() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "Что-то сломалось";
  const description = isRouteErrorResponse(error)
    ? error.data?.message || "Попробуй обновить страницу или вернуться на dashboard."
    : error instanceof Error
      ? error.message
      : "Попробуй обновить страницу или вернуться на dashboard.";

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Error boundary</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-slate-300">{description}</p>
      <Link to="/dashboard" className="mt-6 inline-flex rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950">
        Вернуться в dashboard
      </Link>
    </section>
  );
}

function NotFoundRoute() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">404</p>
      <h2 className="mt-2 text-2xl font-semibold">Страница не найдена</h2>
      <p className="mt-3 text-slate-300">
        Похоже, ты попал на маршрут, которого нет. Возвращайся в dashboard или открой search.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/dashboard" className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950">
          Dashboard
        </Link>
        <Link to="/search" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200">
          Search
        </Link>
      </div>
    </section>
  );
}

function AuthProvider() {
  const requestIdRef = React.useRef(0);
  const [state, setState] = React.useState<AuthContextValue>(() => ({
    loading: true,
    user: null,
  }));

  React.useEffect(() => {
    const requestId = ++requestIdRef.current;
    getCurrentUser()
      .then((user) => {
        if (requestIdRef.current === requestId) {
          setState({ loading: false, user });
        }
      })
      .catch(() => {
        if (requestIdRef.current === requestId) {
          setState({ loading: false, user: null });
        }
      });

    return undefined;
  }, []);

  React.useEffect(() => {
    const syncAuth = () => {
      const requestId = ++requestIdRef.current;
      getCurrentUser()
        .then((user) => {
          if (requestIdRef.current === requestId) {
            setState({ loading: false, user });
          }
        })
        .catch(() => {
          if (requestIdRef.current === requestId) {
            setState({ loading: false, user: null });
          }
        });
    };

    window.addEventListener(DEMO_AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(DEMO_AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      <Layout />
    </AuthContext.Provider>
  );
}

function LoginRoute() {
  const { loading, user } = useAuth();
  if (loading) return <AuthStatus />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function DashboardRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <DashboardPage user={user} />;
}

function ProfileRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <ProfilePage />;
}

function ProfileEditRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <ProfileEditPage />;
}

function SearchRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <SearchPage />;
}

function TeamsRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <TeamsPage />;
}

function TeamDetailRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <TeamDetailPage />;
}

function UserDetailRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <UserDetailPage />;
}

function ApplicationsRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();
  if (loading) return <AuthStatus />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <ApplicationsPage />;
}

function RootRoute() {
  const { loading, user } = useAuth();
  if (loading) return <AuthStatus />;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export const routes = {
  AuthProvider,
  Outlet,
  LoginRoute,
  DashboardRoute,
  ProfileRoute,
  ProfileEditRoute,
  SearchRoute,
  TeamsRoute,
  TeamDetailRoute,
  UserDetailRoute,
  ApplicationsRoute,
  RootRoute,
  ErrorRoute,
  NotFoundRoute,
};
