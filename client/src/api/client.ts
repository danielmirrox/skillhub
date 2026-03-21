import { getDemoAuthUser, isDemoAuthEnabled } from "./demoAuth";

const RAW_API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function normalizeApiBaseUrl(value: string) {
  const trimmed = value.replace(/\/+$/, "");
  return trimmed.replace(/\/api\/v1$/, "");
}

const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

type RequestHeaderOptions = {
  useDemoAuth?: boolean;
};

function getRequestHeaders(initHeaders?: HeadersInit, options: RequestHeaderOptions = {}) {
  const headers = new Headers(initHeaders ?? {});
  const demoUser = options.useDemoAuth === false || !isDemoAuthEnabled() ? null : getDemoAuthUser();

  if (demoUser) {
    headers.set("x-demo-user-id", demoUser.id);
  }

  return headers;
}

export async function apiGet<T>(path: string, options: RequestHeaderOptions = {}): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    credentials: "include",
    headers: getRequestHeaders(undefined, options),
  });

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return (await response.json()) as T;
}

export function getApiRequestHeaders(initHeaders?: HeadersInit, options: RequestHeaderOptions = {}) {
  return getRequestHeaders(initHeaders, options);
}

export { API_BASE_URL };
