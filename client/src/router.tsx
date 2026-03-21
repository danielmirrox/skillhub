import { createBrowserRouter } from "react-router-dom";
import { routes } from "./App";

export const router = createBrowserRouter([
  {
    element: <routes.AuthProvider />,
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
        path: "/dashboard",
        element: <routes.DashboardRoute />,
      },
      {
        path: "/profile",
        element: <routes.ProfileRoute />,
      },
      {
        path: "/profile/edit",
        element: <routes.ProfileEditRoute />,
      },
    ],
  },
]);
