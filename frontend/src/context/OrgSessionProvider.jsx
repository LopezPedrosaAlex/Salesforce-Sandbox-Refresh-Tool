import React, { useCallback, useEffect, useState } from 'react';

import { OrgSessionContext } from './OrgSessionContext';
import { fetchSalesforceSession } from '../scripts/salesforceSession';
import { removeOrgConnection } from '../scripts/orgStore';

/**
 * Shares Salesforce org sessions and the "connect org" modal state across the
 * sidebar (Navbar) and the main content (Auth). Connecting an org opens a
 * username/password form that logs in through the backend (jsforce SOAP
 * login, no Connected App required).
 */
export function OrgSessionProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready'
  const [sessions, setSessions] = useState([]);
  const [isConnectOpen, setConnectOpen] = useState(false);

  const refresh = useCallback(async () => {
    const result = await fetchSalesforceSession();
    setSessions(result.sessions);
    setStatus('ready');
  }, []);

  useEffect(() => {
    let active = true;
    fetchSalesforceSession().then((result) => {
      if (!active) return;
      setSessions(result.sessions);
      setStatus('ready');
    });
    return () => {
      active = false;
    };
  }, []);

  const openConnect = useCallback(() => setConnectOpen(true), []);
  const closeConnect = useCallback(() => setConnectOpen(false), []);

  const disconnect = useCallback((id) => {
    removeOrgConnection(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = {
    status,
    sessions,
    refresh,
    disconnect,
    isConnectOpen,
    openConnect,
    closeConnect,
  };

  return <OrgSessionContext.Provider value={value}>{children}</OrgSessionContext.Provider>;
}
