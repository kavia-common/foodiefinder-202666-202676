/**
 * Lightweight API client for FoodieFinder.
 * Uses fetch with JSON defaults and optional Bearer auth.
 */

const DEFAULT_BASE_URL = "";

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL.
 * Uses REACT_APP_API_BASE_URL when present, otherwise relative (same origin).
 */
export function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function buildUrl(path) {
  const base = getApiBaseUrl();
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

/**
 * PUBLIC_INTERFACE
 * Performs a JSON request and returns parsed JSON (or null for 204).
 * Throws an Error with `status` and `details` when non-2xx.
 */
export async function apiRequest(path, { method = "GET", token, body, headers } = {}) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": body ? "application/json" : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  let payload = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await res.json().catch(() => null);
  } else {
    payload = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const err = new Error(`API request failed: ${method} ${path} (${res.status})`);
    err.status = res.status;
    err.details = payload;
    throw err;
  }

  return payload;
}
