import React from "react";
import type { AuthUser } from "./api/auth";

export type AuthContextValue = {
  loading: boolean;
  user: AuthUser | null;
};

export const AuthContext = React.createContext<AuthContextValue>({
  loading: true,
  user: null,
});

export function useAuth() {
  return React.useContext(AuthContext);
}
