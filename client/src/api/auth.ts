import { apiGet } from "./client";
import { getDemoAuthUser } from "./demoAuth";

export type AuthUser = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
};

type AuthMeResponse = {
  user: AuthUser;
};

export async function getCurrentUser(): Promise<AuthUser> {
  const demoUser = getDemoAuthUser();
  if (demoUser) {
    return demoUser;
  }

  const data = await apiGet<AuthMeResponse>("/api/v1/auth/me");
  return data.user;
}
