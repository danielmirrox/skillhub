import { getDemoAuthUser } from "./demoAuth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getRequestHeaders(initHeaders?: HeadersInit) {
  const headers = new Headers(initHeaders ?? {});
  const demoUser = getDemoAuthUser();

  if (demoUser) {
    headers.set("x-demo-user-id", demoUser.id);
  }

  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: getRequestHeaders(),
  });

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return (await response.json()) as T;
}

export function getApiRequestHeaders(initHeaders?: HeadersInit) {
  return getRequestHeaders(initHeaders);
}

export { API_BASE_URL };
