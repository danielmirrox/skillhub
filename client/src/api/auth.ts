import { API_BASE_URL, apiGet, getApiRequestHeaders } from "./client";
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

export async function logout() {
  await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: getApiRequestHeaders(),
  }).catch(() => null);
}
