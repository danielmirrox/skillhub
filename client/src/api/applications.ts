import { API_BASE_URL, getApiRequestHeaders, apiGet } from "./client";

export type ApplicationStatus = "pending" | "accepted" | "declined";

export type ApplicationView = {
  id: string;
  team: {
    id: string;
    name: string;
    hackathonName: string;
    status: "active" | "paused" | "closed";
    isActive: boolean;
    slotsOpen: number;
  } | null;
  applicant: {
    id: string;
    displayName: string;
    avatarUrl: string;
    telegramUsername: string | null;
    rating: { score: number } | null;
  } | null;
  message: string;
  status: ApplicationStatus;
  viewedAt: string | null;
  createdAt: string;
};

export type ApplicationsResponse = {
  incoming: ApplicationView[];
  outgoing: ApplicationView[];
};

export async function getApplications() {
  return apiGet<ApplicationsResponse>("/api/v1/applications");
}

export async function createApplication(teamId: string, message: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications`, {
    method: "POST",
    credentials: "include",
    headers: getApiRequestHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ teamId, message }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      typeof body.message === "string" ? body.message : `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number }).status = response.status;
    if (body && typeof body === "object" && typeof body.error === "string") {
      (error as Error & { code?: string }).code = body.error;
    }
    throw error;
  }

  return body as { application: ApplicationView };
}

export async function updateApplicationStatus(applicationId: string, status: Exclude<ApplicationStatus, "pending">) {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications/${applicationId}`, {
    method: "PATCH",
    credentials: "include",
    headers: getApiRequestHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ status }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      typeof body.message === "string" ? body.message : `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number }).status = response.status;
    if (body && typeof body === "object" && typeof body.error === "string") {
      (error as Error & { code?: string }).code = body.error;
    }
    throw error;
  }

  return body as { application: ApplicationView };
}
