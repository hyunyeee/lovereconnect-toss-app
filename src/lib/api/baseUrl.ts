const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

function normalizeApiBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    throw new Error("VITE_API_BASE_URL is required. Example: https://api.lovereconnect.co.kr");
  }

  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`VITE_API_BASE_URL is invalid: ${trimmed}`);
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);

export function buildApiUrl(path: string): string {
  return new URL(path, `${API_BASE_URL}/`).toString();
}
