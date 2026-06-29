/**
 * The backend returns an `ak-...` keychain key in plaintext exactly once (on
 * create / regenerate). We persist the primary key locally so the dashboard can
 * reveal it later. If it's missing (e.g. cleared storage, different browser),
 * the UI falls back to the masked value and prompts a regenerate.
 */
function storageKey(userId: string): string {
  return `ak_key_${userId}`;
}

export function savePrimaryKey(userId: string, apiKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), apiKey);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function loadPrimaryKey(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

export function clearPrimaryKey(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}
