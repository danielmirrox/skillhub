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
  const data = await apiGet<AuthMeResponse>("/api/v1/auth/me");
  return data.user;
}
