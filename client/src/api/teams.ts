import { API_BASE_URL, apiGet, getApiRequestHeaders } from "./client";

export type TeamRole = "frontend" | "backend" | "fullstack" | "design" | "ml" | "mobile" | "other";

export type TeamSummary = {
  id: string;
  name: string;
  description: string;
  hackathonName: string;
  requiredRoles: TeamRole[];
  stack: string[];
  slotsOpen: number;
  author: {
    userId: string;
    displayName: string;
    avatarUrl: string;
    isPro: boolean;
  } | null;
  membersCount: number;
  isActive: boolean;
};

export type TeamMemberSummary = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  role: TeamRole | string;
  rating: { score: number } | null;
};

export type TeamDetail = TeamSummary & {
  authorId: string;
  author: TeamSummary["author"];
  minRating: number | null;
  status: string;
  updatedAt: string;
  deletedAt: string | null;
  createdAt: string;
  members: TeamMemberSummary[];
};

export type TeamFormPayload = {
  name: string;
  description: string;
  hackathonName: string;
  requiredRoles: TeamRole[];
  stack: string[];
  slotsOpen: number;
  minRating?: number | null;
  isActive?: boolean;
  status?: "active" | "paused" | "closed";
};

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationErrorPayload = {
  error?: string;
  message?: string;
  fields?: Record<string, string>;
  issues?: ValidationIssue[];
};

export type TeamsListResponse = {
  items: TeamSummary[];
};

export type TeamsQuery = Partial<{
  role: TeamRole;
  stack: string;
  hackathon: string;
}>;

export async function getTeams(query: TeamsQuery = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiGet<TeamsListResponse>(`/api/v1/teams${suffix}`);
}

export async function getTeamById(teamId: string) {
  return apiGet<{ team: TeamDetail }>(`/api/v1/teams/${teamId}`);
}

async function submitTeam(teamId: string | null, payload: TeamFormPayload, method: "POST" | "PUT") {
  const response = await fetch(`${API_BASE_URL}/api/v1/teams${teamId ? `/${teamId}` : ""}`, {
    method,
    credentials: "include",
    headers: getApiRequestHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(typeof body.message === "string" ? body.message : `Request failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    if (body && typeof body === "object") {
      const payload = body as ValidationErrorPayload;
      if (payload.fields && typeof payload.fields === "object") {
        (error as Error & { fields?: Record<string, string> }).fields = payload.fields;
      }

      if (Array.isArray(payload.issues)) {
        (error as Error & { issues?: ValidationIssue[] }).issues = payload.issues;
      }

      if (typeof payload.error === "string") {
        (error as Error & { code?: string }).code = payload.error;
      }
    }
    throw error;
  }

  return body as { team: TeamDetail };
}

export async function createTeam(payload: TeamFormPayload) {
  return submitTeam(null, payload, "POST");
}

export async function updateTeam(teamId: string, payload: TeamFormPayload) {
  return submitTeam(teamId, payload, "PUT");
}
