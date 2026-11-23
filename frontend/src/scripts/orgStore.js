/**
 * Persistent store of connected Salesforce orgs.
 *
 * Each successful OAuth (PKCE) flow yields an access token bound to one org.
 * To support being logged into several orgs at once, every connection is kept
 * here (localStorage) instead of overwriting a single token. Entries are
 * de-duplicated by instance URL.
 */

const STORAGE_KEY = 'sf_org_connections';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * @returns {Array<{ id: string, accessToken: string, instanceUrl: string, connectedAt: string }>}
 */
export function getOrgConnections() {
  return read();
}

/**
 * Adds (or refreshes) a connected org. De-duplicated by instance URL.
 */
export function addOrgConnection({ accessToken, instanceUrl }) {
  if (!accessToken || !instanceUrl) return;

  const list = read();
  const entry = {
    id: instanceUrl,
    accessToken,
    instanceUrl,
    connectedAt: new Date().toISOString(),
  };

  const existingIdx = list.findIndex((c) => c.instanceUrl === instanceUrl);
  if (existingIdx >= 0) list[existingIdx] = entry;
  else list.push(entry);

  write(list);
}

/**
 * Removes a connected org by its id (instance URL).
 */
export function removeOrgConnection(id) {
  write(read().filter((c) => c.id !== id));
}

export function clearOrgConnections() {
  localStorage.removeItem(STORAGE_KEY);
}
