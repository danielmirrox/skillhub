import { apiGet } from "./client";

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
  bio: string;
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