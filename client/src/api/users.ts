import { API_BASE_URL, apiGet, getApiRequestHeaders } from "./client";
import type { GithubImportData } from "./profile";

export type UserRole = "frontend" | "backend" | "fullstack" | "design" | "ml" | "mobile" | "other";
export type ClaimedGrade = "junior" | "middle" | "senior";

export type UsersListItem = {
  id: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole | null;
  claimedGrade: ClaimedGrade | null;
  primaryStack: string[];
  rating: {
    score: number;
    grade: string;
    roleLabel: string;
    strengths?: string[];
    improvements?: string[];
  } | null;
  searchMatch?: {
    score: number;
    reasons: string[];
    matchedTerms: string[];
  } | null;
  contactVisible: boolean;
  isPro: boolean;
  bio: string;
  favoriteCount: number;
  isFavorite: boolean;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  myVote: 1 | -1 | null;
};

export type UsersListResponse = {
  items: UsersListItem[];
  total: number;
  page: number;
  limit: number;
};

export type UserSummary = {
  id: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole | null;
  claimedGrade: ClaimedGrade | null;
  primaryStack: string[];
  rating: UsersListItem["rating"];
  searchMatch?: UsersListItem["searchMatch"];
  contactVisible: boolean;
  telegramUsername: string | null;
  bio: string;
  githubConnected: boolean;
  githubImportedAt: string | null;
  githubData?: GithubImportData | null;
  favoriteCount: number;
  isFavorite: boolean;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  myVote: 1 | -1 | null;
};

export type FavoriteUsersResponse = {
  items: UsersListItem[];
  total: number;
};

export type UsersQuery = {
  search?: string;
  role?: UserRole | "";
  grade?: ClaimedGrade | "";
  minRating?: string;
  stack?: string;
  page?: number;
  limit?: number;
};

export async function getUsers(query: UsersQuery = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiGet<UsersListResponse>(`/api/v1/users${suffix}`);
}

export async function getUserSummary(userId: string) {
  return apiGet<{ user: UserSummary }>(`/api/v1/users/${userId}`);
}

export async function getFavoriteUsers() {
  return apiGet<FavoriteUsersResponse>("/api/v1/users/favorites");
}

export async function toggleFavorite(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/favorite`, {
    method: "POST",
    credentials: "include",
    headers: getApiRequestHeaders({
      "Content-Type": "application/json",
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      typeof body.message === "string"
        ? body.message
        : `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return body as { user: UserSummary };
}

export async function toggleVote(userId: string, value: 1 | -1) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/vote`, {
    method: "POST",
    credentials: "include",
    headers: getApiRequestHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ value }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      typeof body.message === "string"
        ? body.message
        : `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return body as { user: UserSummary };
}
