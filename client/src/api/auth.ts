import { apiGet, getApiRequestHeaders, getApiUrl } from "./client";
import { getDemoAuthUser, isDemoAuthEnabled } from "./demoAuth";

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
    const demoUser = isDemoAuthEnabled() ? getDemoAuthUser() : null;
    if (demoUser) {
      return demoUser;
    }

    throw new Error("Not authenticated");
  }
}

export async function logout() {
  await fetch(getApiUrl("/api/v1/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: getApiRequestHeaders(),
  }).catch(() => null);
}
