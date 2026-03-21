import { createBrowserRouter } from "react-router-dom";
import { routes } from "./App";

export const router = createBrowserRouter([
  {
    element: <routes.AuthProvider />,
    errorElement: <routes.ErrorRoute />,
    children: [
      {
        path: "/",
        element: <routes.RootRoute />,
      },
      {
        path: "/login",
        element: <routes.LoginRoute />,
      },
      {
        path: "/paywall",
        element: <routes.PaywallRoute />,
      },
      {
        path: "/dashboard",
        element: <routes.DashboardRoute />,
      },
      {
        path: "/search",
        element: <routes.SearchRoute />,
      },
      {
        path: "/teams",
        element: <routes.TeamsRoute />,
      },
      {
        path: "/teams/:id",
        element: <routes.TeamDetailRoute />,
      },
      {
        path: "/profile",
        element: <routes.ProfileRoute />,
      },
      {
        path: "/profile/edit",
        element: <routes.ProfileEditRoute />,
      },
      {
        path: "/users/:id",
        element: <routes.UserDetailRoute />,
      },
      {
        path: "/applications",
        element: <routes.ApplicationsRoute />,
      },
      {
        path: "*",
        element: <routes.NotFoundRoute />,
      },
    ],
  },
]);
