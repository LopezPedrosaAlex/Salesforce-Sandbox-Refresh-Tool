import { createContext, useContext } from 'react';

export const OrgSessionContext = createContext(null);

export function useOrgSession() {
  const ctx = useContext(OrgSessionContext);
  if (!ctx) throw new Error('useOrgSession must be used within an OrgSessionProvider');
  return ctx;
}
