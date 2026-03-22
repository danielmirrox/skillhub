import { API_BASE_URL, apiGet, getApiRequestHeaders } from "./client";

export type ProfileRole =
  | "frontend"
  | "backend"
  | "fullstack"
  | "design"
  | "ml"
  | "mobile"
  | "other";

export type ClaimedGrade = "junior" | "middle" | "senior";

export type ProjectLink = {
  url: string;
  title: string;
  description: string;
};

export type Profile = {
  id: string;
  role: ProfileRole;
  claimedGrade: ClaimedGrade;
  primaryStack: string[];
  experienceYears: number;
  hackathonsCount: number;
  bio: string;
  projectLinks: ProjectLink[];
  telegramUsername: string | null;
  githubUrl: string | null;
  githubData?: GithubImportData | null;
  isPublic: boolean;
  hasRating: boolean;
  lastRatingScore: number | null;
  rating?: {
    score: number;
    grade: string;
    roleLabel: string;
    strengths?: string[];
    improvements?: string[];
  } | null;
};

export type OwnProfileResponse = {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
    isPro: boolean;
  };
  profile: Profile | null;
};

export type UpdateProfilePayload = Partial<{
  role: ProfileRole;
  claimedGrade: ClaimedGrade;
  primaryStack: string[];
  experienceYears: number;
  hackathonsCount: number;
  bio: string;
  projectLinks: ProjectLink[];
  telegramUsername: string | null;
  githubUrl: string | null;
  isPublic: boolean;
}>;

export type UpgradeProResponse = {
  user: OwnProfileResponse['user'];
  success: boolean;
};

export type GithubImportData = {
  fetchedAt?: string;
  username?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  publicRepos?: number;
  followers?: number;
  totalStars?: number;
  totalForks?: number;
  accountAgeYears?: number;
  lastActivityAt?: string | null;
  activityRecencyDays?: number | null;
  activityBucket?: "fresh" | "recent" | "steady" | "stale" | null;
  languages?: Record<string, number>;
  topRepos?: Array<{
    name: string;
    url?: string | null;
    description?: string | null;
    stars?: number;
    forks?: number;
    primaryLanguage?: string | null;
    updatedAt?: string | null;
  }>;
};

export type GithubImportResponse = {
  suggestedPrimaryStack: string[];
  suggestedProjectLinks: ProjectLink[];
  profile: Profile;
  githubData: GithubImportData | null;
  importedAt: string | null;
  source: "manual" | "stored" | "github-rest";
};

export type ScoreProfileResponse = {
  rating: {
    score: number;
    grade: string;
    roleLabel: string;
    strengths?: string[];
    improvements?: string[];
  };
  profile: Profile;
  nextAllowedAt: string | null;
};

export type ScoreProfileOptions = {
  bypassRateLimit?: boolean;
};

export async function getOwnProfile() {
  return apiGet<OwnProfileResponse>("/api/v1/profile");
}

export async function updateOwnProfile(payload: UpdateProfilePayload) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/profile`,
    {
      method: "PUT",
      credentials: "include",
      headers: getApiRequestHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return (await response.json()) as { profile: Profile };
}

export async function scoreProfile(payload: UpdateProfilePayload = {}, options: ScoreProfileOptions = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/profile/score`,
    {
      method: "POST",
      credentials: "include",
      headers: getApiRequestHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        ...payload,
        ...(options.bypassRateLimit ? { bypassRateLimit: true } : {}),
      }),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      typeof body.message === "string"
        ? body.message
        : `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number; nextAllowedAt?: string | null }).status =
      response.status;
    (error as Error & { status?: number; nextAllowedAt?: string | null }).nextAllowedAt =
      typeof body.nextAllowedAt === "string" ? body.nextAllowedAt : null;
    throw error;
  }

  return body as ScoreProfileResponse;
}

export async function importGithubProfile(payload: { githubData?: GithubImportData } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/profile/import-github`,
    {
      method: "POST",
      credentials: "include",
      headers: getApiRequestHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
    },
  );

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

  return body as GithubImportResponse;
}

export async function upgradeToPro() {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/profile/pro`,
    {
      method: "POST",
      credentials: "include",
      headers: getApiRequestHeaders({
        "Content-Type": "application/json",
      }),
    },
  );

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

  return body as UpgradeProResponse;
}
