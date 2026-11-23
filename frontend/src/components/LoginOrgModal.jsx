import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { cliLoginOrg } from '../scripts/salesforceSession';
import { addOrgConnection } from '../scripts/orgStore';
import { useOrgSession } from '../context/OrgSessionContext';

export default function LoginOrgModal() {
  const { isConnectOpen, closeConnect, refresh } = useOrgSession();
  const [isSandbox, setIsSandbox] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isConnectOpen) return null;

  const reset = () => {
    setIsSandbox(true);
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    closeConnect();
  };

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);

    const result = await cliLoginOrg({ isSandbox });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    addOrgConnection({ accessToken: result.accessToken, instanceUrl: result.instanceUrl });
    await refresh();
    reset();
    closeConnect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-[#0b1b3a]">Log into a Salesforce org</h2>
            <p className="mt-1 text-sm text-[#00378d]/60">
              A Salesforce login window will open in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            disabled={submitting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-left">
          <label className="flex items-center gap-2 text-sm text-[#0b1b3a]">
            <input
              type="checkbox"
              checked={isSandbox}
              onChange={(e) => setIsSandbox(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-[#00378d]/30 text-[#00378d] focus:ring-[#d4e4f4]"
            />
            This is a sandbox org (test.salesforce.com)
          </label>

          {submitting && (
            <div className="flex items-center gap-3 rounded-lg bg-[#eef4fb] px-3 py-2.5 text-sm text-[#00378d]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4e4f4] border-t-[#00378d]" />
              Complete the login in the browser window that just opened…
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={submitting}
            className="mt-2 flex items-center justify-center rounded-xl py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #00378d 0%, #004fb3 100%)' }}
          >
            {submitting ? 'Waiting for login…' : 'Log in with Salesforce'}
          </button>
        </div>
      </div>
    </div>
  );
}
