/**
 * Auth token utilities.
 * Keeps token in localStorage to persist login across reloads.
 */

const TOKEN_KEY = "foodiefinder_token";

/**
 * PUBLIC_INTERFACE
 * Get the stored auth token (or null).
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * Store auth token.
 */
export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage errors (private mode etc.)
  }
}

/**
 * PUBLIC_INTERFACE
 * Clear auth token.
 */
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
