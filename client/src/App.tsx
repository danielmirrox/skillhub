import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "./api/auth";
import { Layout } from "./components/layout/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
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

function AuthProvider() {
  const [state, setState] = React.useState<AuthContextValue>({
    loading: true,
    user: null,
  });

  React.useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => active && setState({ loading: false, user }))
      .catch(() => active && setState({ loading: false, user: null }));

    return () => {
      active = false;
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
  RootRoute,
};
