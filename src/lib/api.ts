export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

function urlOf(path: string, params?: QueryParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) query.set(key, String(value));
  }
  return query.size > 0 ? `/api${path}?${query}` : `/api${path}`;
}

export async function apiGet<T>(
  path: string,
  params?: QueryParams,
): Promise<T> {
  return parse<T>(await fetch(urlOf(path, params)));
}

export async function apiGetFile(path: string, params?: QueryParams) {
  const response = await fetch(urlOf(path, params));
  if (!response.ok) await parse(response);
  return response.blob();
}

export const apiPost = <T>(path: string, body?: unknown) =>
  send<T>("POST", path, body);

export const apiPatch = <T>(path: string, body: unknown) =>
  send<T>("PATCH", path, body);

export const apiPut = <T>(path: string, body: unknown) =>
  send<T>("PUT", path, body);

export const apiDelete = <T>(path: string) => send<T>("DELETE", path);

export async function apiPostForm<T>(path: string, form: FormData) {
  return parse<T>(await fetch(`/api${path}`, { method: "POST", body: form }));
}

async function send<T>(method: string, path: string, body?: unknown) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parse<T>(response);
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      data?.message ?? `Ошибка сервера (${response.status})`,
    );
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Не удалось связаться с сервером";
}
