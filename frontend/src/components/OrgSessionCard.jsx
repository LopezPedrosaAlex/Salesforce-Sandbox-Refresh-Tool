import React from 'react';
import {
  CloudIcon,
  CheckBadgeIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

const PRIMARY = '#00378d';

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * Card representing a single logged-in Salesforce org session.
 * Layout mirrors the reference design (avatar + heading + meta + tags + stats)
 * while keeping the app's blue color palette. Data comes from the backend
 * `/api/session` endpoint (real org/user metadata).
 */
export default function OrgSessionCard({ session, onDisconnect, onOpen }) {
  const {
    id,
    orgName,
    displayName,
    username,
    photo,
    instanceUrl,
    instanceName,
    organizationType,
    isSandbox,
    connectedAt,
  } = session || {};

  const tags = [
    isSandbox === false ? 'Production' : 'Sandbox',
    organizationType || 'Salesforce',
    instanceName || 'Connected',
  ];

  return (
    <article
      onClick={() => onOpen && onOpen(id)}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen(id);
        }
      }}
      className={`relative w-full max-w-sm rounded-3xl bg-white p-6 border border-[#00378d]/10 shadow-[0_20px_45px_-20px_rgba(0,55,141,0.45)] transition-transform duration-300 hover:-translate-y-1 ${
        onOpen ? 'cursor-pointer' : ''
      }`}
    >
      {onDisconnect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect(id);
          }}
          aria-label="Disconnect org"
          title="Disconnect org"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
      {/* Header: avatar + identity */}
      <div className="flex items-center gap-4">
        {photo ? (
          <img
            src={photo}
            alt={displayName || 'User'}
            className="h-14 w-14 shrink-0 rounded-full object-cover shadow-md ring-2 ring-[#00378d]/10"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #004fb3 100%)` }}
          >
            <CloudIcon className="h-7 w-7" />
          </div>
        )}
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#0b1b3a] leading-tight">
            {displayName || 'Salesforce User'}
          </h3>
          <p className="text-sm font-medium text-[#00378d]/60 truncate max-w-[12rem]">
            {username || 'Source Environment'}
          </p>
        </div>
      </div>

      {/* Title */}
      <h2 className="mt-6 text-left text-2xl font-extrabold leading-snug text-[#0b1b3a]">
        {orgName || 'Active org session'}
      </h2>

      {/* Date */}
      <p className="mt-2 text-left text-sm text-[#00378d]/50">
        Connected on {formatDate(connectedAt)}
      </p>

      {/* Description */}
      <p className="mt-4 text-left text-sm leading-relaxed text-gray-600 break-words">
        Session active on{' '}
        <span className="font-semibold text-[#00378d]">{instanceUrl}</span> — ready to
        schedule and run sandbox refreshes.
      </p>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              i === 0 ? 'bg-[#00378d] text-white' : 'bg-[#d4e4f4] text-[#00378d]'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#00378d]/10 to-transparent" />

      {/* Stats */}
      <div className="mt-4 flex items-center justify-between text-[#00378d]">
        <div className="flex items-center gap-2">
          <ServerStackIcon className="h-5 w-5" />
          <span className="text-sm font-semibold text-[#0b1b3a]">
            {instanceName || 'Org'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="text-sm font-semibold text-[#0b1b3a]">PKCE</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckBadgeIcon className="h-5 w-5 text-green-500" />
          <span className="text-sm font-semibold text-[#0b1b3a]">Live</span>
        </div>
      </div>
    </article>
  );
}
