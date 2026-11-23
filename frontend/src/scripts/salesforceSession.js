/**
 * Salesforce multi-org session detection (backend-validated).
 *
 * The browser cannot read Salesforce's HttpOnly `sid` cookie across domains,
 * so login state is confirmed by validating each stored OAuth access token
 * (from the org store) against the backend, which uses jsforce to fetch real
 * org/user metadata. Only orgs with a still-valid token are returned.
 */

import { getOrgConnections, removeOrgConnection } from './orgStore';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

/**
 * Logs into a Salesforce org with username/password via the backend
 * (jsforce SOAP login, no Connected App). On success the org metadata plus
 * the resulting session id and instance URL are returned.
 *
 * @returns {Promise<{ ok: boolean, session?: object, accessToken?: string, instanceUrl?: string, error?: string }>}
 */
export async function loginOrg({ username, password, securityToken, isSandbox }) {
  try {
    const response = await fetch(`${API_BASE}/api/session/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, securityToken, isSandbox }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, error: data.error || 'Login failed' };
    }

    return {
      ok: true,
      session: data.session,
      accessToken: data.accessToken,
      instanceUrl: data.instanceUrl,
    };
  } catch {
    return { ok: false, error: 'Could not reach the backend. Is it running?' };
  }
}

/**
 * Logs into a Salesforce org through the local Salesforce CLI web flow
 * (`sf org login web`) via the backend. No Connected App is required and the
 * browser opens automatically for the user to authenticate. Resolves once the
 * user finishes the login in the browser.
 *
 * @returns {Promise<{ ok: boolean, session?: object, accessToken?: string, instanceUrl?: string, error?: string }>}
 */
export async function cliLoginOrg({ isSandbox }) {
  try {
    const response = await fetch(`${API_BASE}/api/session/cli-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSandbox }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, error: data.error || 'Login failed' };
    }

    return {
      ok: true,
      session: data.session,
      accessToken: data.accessToken,
      instanceUrl: data.instanceUrl,
    };
  } catch {
    return { ok: false, error: 'Could not reach the backend. Is it running?' };
  }
}

/**
 * Fetches every active Salesforce org session from the backend.
 *
 * @returns {Promise<{ loggedIn: boolean, sessions: Array<object> }>}
 */
export async function fetchSalesforceSession() {
  const connections = getOrgConnections();

  if (connections.length === 0) {
    return { loggedIn: false, sessions: [] };
  }

  try {
    const response = await fetch(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connections: connections.map((c) => ({
          accessToken: c.accessToken,
          instanceUrl: c.instanceUrl,
        })),
      }),
    });

    if (!response.ok) {
      return { loggedIn: false, sessions: [] };
    }

    const data = await response.json();
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];

    // Prune stored connections whose token is no longer valid.
    const validIds = new Set(sessions.map((s) => s.id));
    connections
      .filter((c) => !validIds.has(c.id))
      .forEach((c) => removeOrgConnection(c.id));

    return { loggedIn: sessions.length > 0, sessions };
  } catch {
    return { loggedIn: false, sessions: [] };
  }
}
