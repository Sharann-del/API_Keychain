/** Gateway base URL (no trailing slash). Safe to import from Server Components. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

/** OpenAI-compatible `/v1` prefix for snippets and SDK examples. */
export const PROXY_BASE_URL = `${API_BASE_URL}/v1`;
