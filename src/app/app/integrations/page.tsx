'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { IntegrationsHub } from '@/components/IntegrationsHub';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { IntegrationConnection, User } from '@/lib/types';

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const [intRes, ovRes] = await Promise.all([
        fetch('/api/integrations/clickup/sync'),
        fetch('/api/executive-overview'),
      ]);
      const intData = await intRes.json();
      const ovData = await ovRes.json();

      setConnections(intData);
      setUsers(ovData.users || []);
      if (!currentPersona && ovData.users?.length > 0) {
        setCurrentPersona(ovData.users[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentPersona={currentPersona}
        onPersonaChange={(u) => setCurrentPersona(u)}
        availableUsers={users}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <RefreshCw className="h-4 w-4" />
              <span>External Bridges & Automated Sync</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              ClickUp & External Integrations
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Hybrid delivery architecture connecting external task workflows with internal Postgres authoritative records.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded bg-slate-800 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            Loading integration health and sync telemetry...
          </div>
        ) : (
          <IntegrationsHub
            connections={connections}
            currentUser={currentPersona || users[0]}
            onRefresh={fetchIntegrations}
          />
        )}
      </main>
    </div>
  );
}
