import type { ClaimedGrade, ProfileRole } from "../api/profile";

const ROLE_LABELS: Record<ProfileRole, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  design: "Design",
  ml: "ML",
  mobile: "Mobile",
  other: "Другое",
};

const GRADE_LABELS: Record<ClaimedGrade, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
};

const GITHUB_ACTIVITY_LABELS: Record<"fresh" | "recent" | "steady" | "stale", string> = {
  fresh: "Свежая",
  recent: "Недавняя",
  steady: "Стабильная",
  stale: "Давняя",
};

export function formatRoleLabel(role?: ProfileRole | null) {
  if (!role) {
    return "Роль не указана";
  }

  return ROLE_LABELS[role] ?? role;
}

export function formatGradeLabel(grade?: ClaimedGrade | null) {
  if (!grade) {
    return "Грейд не указан";
  }

  return GRADE_LABELS[grade] ?? grade;
}

export function formatProfileHeadline(role?: ProfileRole | null, grade?: ClaimedGrade | null) {
  if (role === "other" && grade === "junior") {
    return "Профиль не заполнен";
  }

  const parts = [formatGradeLabel(grade), formatRoleLabel(role)].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Профиль не заполнен";
}

export function formatGithubActivityLabel(value?: string | null) {
  if (!value) {
    return "Нет данных";
  }

  return GITHUB_ACTIVITY_LABELS[value as keyof typeof GITHUB_ACTIVITY_LABELS] || value;
}

export function formatRatingGradeLabel(grade?: string | null, role?: ProfileRole | null) {
  if (!grade) {
    return "Рейтинг не определён";
  }

  if (role === "other") {
    return grade.replace(/\s+Other$/i, "");
  }

  return grade;
}
