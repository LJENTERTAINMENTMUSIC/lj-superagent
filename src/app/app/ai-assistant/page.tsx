'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { AICopilotDrawer } from '@/components/AICopilotDrawer';
import { Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types';

export default function AIAssistantPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/executive-overview')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        if (data.users?.length > 0) {
          setCurrentPersona(data.users[0]);
        }
      });
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
              <Bot className="h-4 w-4" />
              <span>Grounded Operations Analyst</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              AI Operations Copilot
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic, evidence-backed answers about team progress, overdue items, blockers, and executive synthesis.
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

        <AICopilotDrawer userRole={currentPersona?.role || 'ceo'} />
      </main>
    </div>
  );
}
