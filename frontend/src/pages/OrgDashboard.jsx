import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CloudIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';

import NavigationComponent from '../components/Navbar';
import { useOrgSession } from '../context/OrgSessionContext';
import { fetchFeatures, runFeature } from '../scripts/features';
import { getOrgConnections } from '../scripts/orgStore';
import { socket } from '../scripts/socket';

const GROUP_META = {
  PreRefresh: {
    label: 'Pre-refresh',
    description: 'Runs against the source org before the sandbox refresh.',
    icon: ArrowDownTrayIcon,
  },
  PostRefresh: {
    label: 'Post-refresh',
    description: 'Runs against the sandbox after it has been refreshed.',
    icon: ArrowUpTrayIcon,
  },
};

function StatusBadge({ status }) {
  if (status === 'success') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
        <CheckCircleIcon className="h-4 w-4" /> Done
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
        <ExclamationCircleIcon className="h-4 w-4" /> Failed
      </span>
    );
  }
  if (status === 'skipped') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
        <MinusCircleIcon className="h-4 w-4" /> Skipped
      </span>
    );
  }
  return null;
}

function FeatureCard({ feature, status, anyRunning, onRun }) {
  const isRunning = status === 'running';
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#00378d]/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="text-left">
        <p className="text-sm font-bold text-[#0b1b3a]">{feature.name}</p>
        <p className="mt-0.5 text-xs text-[#00378d]/50">{feature.id}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={status} />
        <button
          type="button"
          onClick={() => onRun(feature.id)}
          disabled={anyRunning}
          title={anyRunning && !isRunning ? 'Another task is running' : 'Run this task'}
          className="flex min-w-[84px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #00378d 0%, #004fb3 100%)' }}
        >
          {isRunning ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Running
            </>
          ) : (
            <>
              <PlayIcon className="h-3.5 w-3.5" />
              Run
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function OrgDashboard() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { status, sessions } = useOrgSession();

  const [features, setFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  const [statuses, setStatuses] = useState({}); // { [id]: 'running'|'success'|'error'|'skipped' }
  const [logs, setLogs] = useState([]);
  const [runError, setRunError] = useState('');
  const runningIdRef = useRef(null);
  const [anyRunning, setAnyRunning] = useState(false);

  const decodedId = decodeURIComponent(orgId || '');
  const session = useMemo(() => sessions.find((s) => s.id === decodedId), [sessions, decodedId]);
  const connection = useMemo(() => {
    const conn = getOrgConnections().find((c) => c.id === decodedId);
    return conn ? { accessToken: conn.accessToken, instanceUrl: conn.instanceUrl } : null;
  }, [decodedId]);

  useEffect(() => {
    let active = true;
    fetchFeatures().then((list) => {
      if (!active) return;
      setFeatures(list);
      setLoadingFeatures(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const finish = (result) => {
      const id = runningIdRef.current;
      runningIdRef.current = null;
      setAnyRunning(false);
      if (id) setStatuses((s) => ({ ...s, [id]: result }));
    };

    const onLog = (msg) => setLogs((prev) => [...prev, String(msg)]);
    const onStepStart = (name) => setLogs((prev) => [...prev, `▶ ${name}`]);
    const onStepEnd = (name) => setLogs((prev) => [...prev, `✔ ${name}`]);
    const onStepSkip = (name) => setLogs((prev) => [...prev, `» Skipped: ${name}`]);
    const onError = (err) => {
      setLogs((prev) => [...prev, `❌ ${err}`]);
      finish('error');
    };
    const onDone = () => {
      setLogs((prev) => [...prev, '✅ Completed']);
      finish('success');
    };

    socket.on('log', onLog);
    socket.on('step-start', onStepStart);
    socket.on('step-end', onStepEnd);
    socket.on('step-skip', onStepSkip);
    socket.on('error', onError);
    socket.on('done', onDone);

    return () => {
      socket.off('log', onLog);
      socket.off('step-start', onStepStart);
      socket.off('step-end', onStepEnd);
      socket.off('step-skip', onStepSkip);
      socket.off('error', onError);
      socket.off('done', onDone);
    };
  }, []);

  const grouped = useMemo(() => {
    return features.reduce((acc, f) => {
      (acc[f.group] = acc[f.group] || []).push(f);
      return acc;
    }, {});
  }, [features]);

  const handleRun = async (id) => {
    if (runningIdRef.current) return;

    setRunError('');
    setLogs([]);
    runningIdRef.current = id;
    setAnyRunning(true);
    setStatuses((s) => ({ ...s, [id]: 'running' }));

    const result = await runFeature(id, connection);
    if (!result.ok) {
      runningIdRef.current = null;
      setAnyRunning(false);
      setRunError(result.error);
      setStatuses((s) => ({ ...s, [id]: 'error' }));
    }
  };

  return (
    <main className="min-w-screen flex flex-row">
      <NavigationComponent />

      <section className="flex-1 px-8 py-12">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#00378d]/70 transition-colors hover:text-[#00378d]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to orgs
          </button>

          {status === 'loading' && !session ? (
            <div className="flex items-center gap-3 text-[#00378d]">
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-[#d4e4f4] border-t-[#00378d]" />
              <p className="text-sm font-medium">Loading org…</p>
            </div>
          ) : !session ? (
            <div className="rounded-2xl border border-[#00378d]/10 bg-white p-8 text-center">
              <h1 className="text-2xl font-extrabold text-[#0b1b3a]">Org not found</h1>
              <p className="mt-2 text-[#00378d]/60">
                This session is no longer available. Try connecting the org again.
              </p>
            </div>
          ) : (
            <>
              <header className="mb-10 flex flex-wrap items-center gap-4 text-left">
                {session.photo ? (
                  <img
                    src={session.photo}
                    alt={session.displayName || 'User'}
                    className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-[#00378d]/10"
                  />
                ) : (
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #00378d 0%, #004fb3 100%)' }}
                  >
                    <CloudIcon className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#00378d]/60">
                    {session.isSandbox === false ? 'Production org' : 'Sandbox org'}
                  </p>
                  <h1 className="text-3xl font-extrabold text-[#0b1b3a]">
                    {session.orgName || 'Salesforce org'}
                  </h1>
                  <p className="mt-1 text-sm text-[#00378d]/60">{session.instanceUrl}</p>
                </div>
              </header>

              {runError && (
                <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{runError}</p>
              )}

              {loadingFeatures ? (
                <div className="flex items-center gap-3 text-[#00378d]">
                  <span className="h-5 w-5 animate-spin rounded-full border-4 border-[#d4e4f4] border-t-[#00378d]" />
                  <p className="text-sm font-medium">Loading features…</p>
                </div>
              ) : features.length === 0 ? (
                <p className="text-[#00378d]/60">No features available. Is the backend running?</p>
              ) : (
                <div className="flex flex-col gap-10">
                  {Object.entries(grouped).map(([group, items]) => {
                    const meta = GROUP_META[group] || { label: group, description: '' };
                    const Icon = meta.icon || PlayIcon;
                    return (
                      <div key={group}>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4e4f4] text-[#00378d]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h2 className="text-lg font-extrabold text-[#0b1b3a]">{meta.label}</h2>
                            <p className="text-xs text-[#00378d]/50">{meta.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                          {items.map((f) => (
                            <FeatureCard
                              key={f.id}
                              feature={f}
                              status={statuses[f.id]}
                              anyRunning={anyRunning}
                              onRun={handleRun}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live execution log */}
              {logs.length > 0 && (
                <div className="mt-10">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#00378d]/60">
                      Execution log
                    </h3>
                    <button
                      type="button"
                      onClick={() => setLogs([])}
                      disabled={anyRunning}
                      className="flex items-center gap-1 text-xs font-semibold text-[#00378d]/60 transition-colors hover:text-[#00378d] disabled:opacity-40"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  </div>
                  <pre className="max-h-72 overflow-auto rounded-2xl bg-[#0b1b3a] p-4 text-left text-xs leading-relaxed text-[#d4e4f4]">
                    {logs.join('\n')}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
