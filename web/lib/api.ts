export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type FetchJsonOptions = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const url = `${baseUrl}/${normalizedPath}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchJsonOptional<T>(
  path: string,
  options: FetchJsonOptions = {},
): Promise<T | null> {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const url = `${baseUrl}/${normalizedPath}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
