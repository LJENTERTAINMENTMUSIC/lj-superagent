'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRightLeft,
  Database,
} from 'lucide-react';
import { IntegrationConnection, User } from '@/lib/types';

interface IntegrationsHubProps {
  connections: IntegrationConnection[];
  currentUser: User;
  onRefresh: () => void;
}

export function IntegrationsHub({
  connections,
  currentUser,
  onRefresh,
}: IntegrationsHubProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncClickUp = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await fetch('/api/integrations/clickup/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: currentUser.id }),
      });
      const data = await res.json();
      setSyncResult(data.message || 'Sync operation completed.');
      onRefresh();
    } catch (err) {
      console.error(err);
      setSyncResult('Sync simulation encountered an error.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                LJ Hybrid Task Integration Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Bridging ClickUp operational tasks with the custom LJ-BOS Postgres portal
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-semibold">
            Phase 2: Hybrid Bridge
          </span>
        </div>

        {/* Strategy Roadmap Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="font-semibold text-amber-400 mb-1">Phase 1: Workflow</div>
            <p className="text-slate-400">
              Immediate task execution in ClickUp with structured lists, owners, deadlines & evidence requirements.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-amber-500/40 rounded-lg">
            <div className="font-semibold text-amber-400 mb-1">Phase 2: Connect Portal (Active)</div>
            <p className="text-slate-300">
              Bi-directional mapping with single authoritative source of truth to avoid split-brain conflicts.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="font-semibold text-slate-400 mb-1">Phase 3: Consolidate</div>
            <p className="text-slate-500">
              Gradual migration into dedicated LJ portal once permissions and user adoption are fully matured.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ClickUp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              ClickUp Enterprise
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Connected
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Task synchronization with LJ-BOS-Core and Field-Operations lists.
          </p>

          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
            <div>Authoritative Source: <strong className="text-slate-200">Postgres (LJ-BOS)</strong></div>
            <div>Sync Interval: <strong className="text-slate-200">30 minutes</strong></div>
            <div>Idempotency Keying: <strong className="text-emerald-400">Active</strong></div>
          </div>

          <button
            onClick={handleSyncClickUp}
            disabled={syncing}
            className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Reconciling Tasks...' : 'Trigger Idempotent Sync'}</span>
          </button>

          {syncResult && (
            <div className="text-[11px] p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{syncResult}</span>
            </div>
          )}
        </div>

        {/* Email Digest */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Email Daily Digest
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Active
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Automated scheduled daily digest at 18:00 WAT for pending approvals and overdue tasks.
          </p>

          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
            <div>Sender: <strong className="text-slate-200">notifications@ljgroup.com</strong></div>
            <div>Schedule: <strong className="text-slate-200">Daily 18:00 WAT</strong></div>
          </div>
        </div>

        {/* WhatsApp Business */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              WhatsApp Urgent Alerts
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Unconfigured
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Urgent blocker notifications for field operations and harvest security.
          </p>

          <div className="text-[11px] text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-800">
            Awaiting approved business BSP credentials and registered template sign-off.
          </div>
        </div>
      </div>
    </div>
  );
}
