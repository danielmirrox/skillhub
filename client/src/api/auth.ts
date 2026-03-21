import { apiGet } from "./client";

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
  const data = await apiGet<AuthMeResponse>("/auth/me");
  return data.user;
}
