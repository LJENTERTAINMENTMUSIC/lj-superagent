'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { IntegrationsHub } from '@/components/IntegrationsHub';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types';

export default function IntegrationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/executive-overview');
      const data = await res.json();
      setUsers(data.users || []);
      if (!currentPersona && data.users?.length > 0) {
        setCurrentPersona(data.users[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentPersona={currentPersona}
        onPersonaChange={(u) => setCurrentPersona(u)}
        availableUsers={users}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#182C48] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
              <RefreshCw className="h-4 w-4" />
              <span>External Bridges & Automated Sync</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Integrations & Workflow Gateway
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status, permissions, durable retry queue, and reconnection guides across all official external platforms.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#0F223D] border border-[#1E3A5F] flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        <IntegrationsHub currentUser={currentPersona || users[0]} />
      </main>
    </div>
  );
}
