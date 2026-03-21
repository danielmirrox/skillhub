import { apiGet } from "./client";

export type TeamSummary = {
  id: string;
  name: string;
  description: string;
  hackathonName: string;
  requiredRoles: Array<"frontend" | "backend" | "fullstack" | "design" | "ml" | "mobile" | "other">;
  stack: string[];
  slotsOpen: number;
  author: {
    displayName: string;
    avatarUrl: string;
  } | null;
  membersCount: number;
  isActive: boolean;
};

export type TeamsListResponse = {
  items: TeamSummary[];
};

export async function getTeams() {
  return apiGet<TeamsListResponse>("/api/v1/teams");
}