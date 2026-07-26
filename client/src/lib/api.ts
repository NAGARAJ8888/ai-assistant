export async function apiFetch(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
) {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Backend Error:", data);
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}