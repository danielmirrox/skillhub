import { apiGet } from "./client";
import { getDemoAuthUser } from "./demoAuth";

export type AuthUser = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isPro?: boolean;
  proExpiresAt?: string | null;
};

type AuthMeResponse = {
  user: AuthUser;
};

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const data = await apiGet<AuthMeResponse>("/api/v1/auth/me", { useDemoAuth: false });
    return data.user;
  } catch {
    const demoUser = getDemoAuthUser();
    if (demoUser) {
      return demoUser;
    }

    throw new Error("Not authenticated");
  }
}
