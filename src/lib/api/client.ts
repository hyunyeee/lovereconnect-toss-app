import { buildApiUrl } from "./baseUrl";

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    throw {
      type: "AUTH_EXPIRED",
      code: data?.code ?? "AUTH_EXPIRED",
      message: data?.message ?? "로그인이 필요합니다.",
      status: res.status,
    };
  }

  if (!res.ok) {
    throw {
      type: "API_ERROR",
      code: data?.code ?? "NETWORK_ERROR",
      message: data?.message ?? "서버와 통신할 수 없습니다.",
      status: res.status,
    };
  }

  return data;
}
