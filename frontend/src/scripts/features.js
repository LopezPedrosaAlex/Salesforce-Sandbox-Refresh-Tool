const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

/**
 * Fetches the list of available refresh features (backend steps) grouped by
 * PreRefresh / PostRefresh. Each item: { id, name, group, enabled }.
 *
 * @returns {Promise<Array<{ id: string, name: string, group: string, enabled: boolean }>>}
 */
export async function fetchFeatures() {
  try {
    const response = await fetch(`${API_BASE}/api/features`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Triggers execution of a single backend feature (step) by its id.
 * Optionally runs it against a specific org session ({ accessToken, instanceUrl })
 * instead of the backend's .env credentials. Progress is streamed separately
 * over socket.io.
 *
 * @returns {Promise<{ ok: boolean, message?: string, error?: string }>}
 */
export async function runFeature(id, connection) {
  try {
    const response = await fetch(`${API_BASE}/api/features/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection || {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: data.error || 'Failed to start the feature' };
    }
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, error: 'Could not reach the backend. Is it running?' };
  }
}
