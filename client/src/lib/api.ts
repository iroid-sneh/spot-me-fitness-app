const API_BASE = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_API_URL
  || 'http://localhost:2003/api/v1';

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
};

export const apiBaseUrl = API_BASE;

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}
