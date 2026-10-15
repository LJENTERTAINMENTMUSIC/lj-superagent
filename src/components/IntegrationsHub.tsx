'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRightLeft,
  Database,
  MessageSquare,
  Music,
  Cloud,
  FileText,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { User } from '@/lib/types';

interface ProviderStatus {
  provider: string;
  name: string;
  category: string;
  status: 'connected' | 'configured_mock' | 'configured_read_only' | 'error';
  permissions: string[];
  lastSync: string;
  error: string | null;
  reconnectionInstructions: string;
}

export function IntegrationsHub({ currentUser }: { currentUser?: User }) {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [failedJobsCount, setFailedJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retryingJobs, setRetryingJobs] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations/status');
      const data = await res.json();
      setProviders(data.providers || []);
      setFailedJobsCount(data.failedJobsCount || 0);
    } catch (err) {
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleRetryFailedJobs = async () => {
    try {
      setRetryingJobs(true);
      setRetryResult(null);
      const res = await fetch('/api/jobs/retry', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      setRetryResult(`Processed ${data.processed?.length || 0} failed jobs from queue.`);
      await fetchIntegrations();
    } catch (err: any) {
      setRetryResult(`Error retrying jobs: ${err.message}`);
    } finally {
      setRetryingJobs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header */}
      <div className="bg-[#0B1728] border border-[#182C48] p-6 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center text-[#060D1A] font-black shadow">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                LJ SuperAgent Enterprise Integration Gateway
              </h3>
              <p className="text-xs text-slate-400">
                Direct authenticated APIs, verified inbound webhooks, and durable background retry queues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchIntegrations}
              className="px-3 py-1.5 rounded-lg bg-[#0F223D] hover:bg-[#163156] border border-[#1E3A5F] text-xs text-slate-200 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Health</span>
            </button>
          </div>
        </div>

        {/* Failed Queue Banner */}
        {failedJobsCount > 0 && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>
                <strong>{failedJobsCount} failed background deliveries</strong> currently queued in durable retry table (<code className="font-mono text-[10px]">bos_failed_message_queue</code>).
              </span>
            </div>
            <button
              onClick={handleRetryFailedJobs}
              disabled={retryingJobs}
              className="px-3 py-1 rounded bg-[#D4AF37] hover:bg-[#F1C40F] disabled:opacity-50 text-[#060D1A] font-bold text-xs flex items-center gap-1 transition"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>{retryingJobs ? 'Retrying...' : 'Retry Queue'}</span>
            </button>
          </div>
        )}

        {retryResult && (
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs rounded">
            {retryResult}
          </div>
        )}
      </div>

      {/* Integration Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => {
          const isConnected = p.status === 'connected';
          return (
            <div
              key={p.provider}
              className="bg-[#0B1728] border border-[#182C48] rounded-xl p-5 space-y-3.5 hover:border-[#1E3A5F] transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F]">
                      {p.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{p.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 bg-[#060D1A] p-2.5 rounded border border-[#182C48] font-mono">
                  <div>Last Health Check: <span className="text-slate-200">{new Date(p.lastSync).toLocaleTimeString()}</span></div>
                  <div>Permissions: <span className="text-[#D4AF37]">{p.permissions.join(', ')}</span></div>
                  {p.error && <div className="text-red-400">Error: {p.error}</div>}
                </div>
              </div>

              <div className="pt-2 border-t border-[#182C48] space-y-1.5 text-[10px] text-slate-500">
                <div className="font-semibold text-slate-400">Instructions:</div>
                <div className="leading-tight text-slate-400">{p.reconnectionInstructions}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
