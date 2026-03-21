export type DemoAuthUser = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isPro?: boolean;
  proExpiresAt?: string | null;
};

export const DEMO_AUTH_STORAGE_KEY = "skillhub.demoAuthUser";
export const DEMO_AUTH_CHANGE_EVENT = "skillhub:demo-auth-change";

export const DEMO_AUTH_USER: DemoAuthUser = {
  id: "user-daniel",
  username: "danieltgrm",
  displayName: "Даниэл Петров",
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
};

export const DEMO_PRO_AUTH_USER: DemoAuthUser = {
  id: "user-captain",
  username: "captainpro",
  displayName: "Артём Капустин",
  avatarUrl: "https://avatars.githubusercontent.com/u/4?v=4",
};

export function getDemoAuthUser(): DemoAuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DemoAuthUser;
    if (!parsed?.id || !parsed?.username) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setDemoAuthUser(user: DemoAuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(DEMO_AUTH_CHANGE_EVENT));
}

export function promoteDemoAuthUserToPro() {
  const currentUser = getDemoAuthUser();

  if (!currentUser) {
    return;
  }

  setDemoAuthUser({
    ...currentUser,
    isPro: true,
    proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

export function clearDemoAuthUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(DEMO_AUTH_CHANGE_EVENT));
}