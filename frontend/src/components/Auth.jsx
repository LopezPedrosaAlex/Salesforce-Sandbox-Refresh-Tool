import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CpuChipIcon, PlusIcon } from '@heroicons/react/24/solid';

import OrgSessionCard from './OrgSessionCard';
import { useOrgSession } from '../context/OrgSessionContext';

export default function LoginComponent() {
  const { status, sessions, disconnect, openConnect } = useOrgSession();
  const navigate = useNavigate();

  const openOrg = (id) => navigate(`/org/${encodeURIComponent(id)}`);

  if (status === 'loading') {
    return (
      <section className="grid h-screen w-full place-items-center px-8">
        <div className="flex flex-col items-center gap-4 text-[#00378d]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d4e4f4] border-t-[#00378d]" />
          <p className="text-sm font-medium">Checking Salesforce sessions…</p>
        </div>
      </section>
    );
  }

  if (sessions.length > 0) {
    return (
      <section className="w-full px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 flex flex-wrap items-end justify-between gap-4 text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00378d]/60">
                Connected orgs
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-[#0b1b3a] lg:text-4xl">
                Your Salesforce sessions
              </h1>
              <p className="mt-2 text-[#00378d]/60">
                One card is shown for every org you are currently logged into.
              </p>
            </div>
            <button
              onClick={openConnect}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #00378d 0%, #004fb3 100%)' }}
            >
              <PlusIcon className="h-4 w-4" />
              Connect another org
            </button>
          </header>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <OrgSessionCard
                key={session.id}
                session={session}
                onDisconnect={disconnect}
                onOpen={openOrg}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state: no valid Salesforce session.
  return (
    <section className="grid w-full place-items-center px-8">
      <div className="mx-auto flex h-screen max-w-md flex-col items-center justify-center text-center">
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #00378d 0%, #004fb3 100%)' }}
        >
          <CpuChipIcon className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0b1b3a] lg:text-4xl">
          No org connected yet
        </h1>
        <p className="mt-3 text-[#00378d]/70">
          You are not logged into any Salesforce org. Use the
          <span className="font-semibold text-[#00378d]"> “+ New Refresh” </span>
          button at the bottom of the sidebar to connect a Source org.
        </p>
        <button
          onClick={openConnect}
          className="mt-6 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #00378d 0%, #004fb3 100%)' }}
        >
          Connect an org
        </button>
      </div>
    </section>
  );
}
