'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import {
  Briefcase,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { BusinessUnit, Project, User } from '@/lib/types';

export default function PortfolioPage() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/executive-overview')
      .then((res) => res.json())
      .then((data) => {
        setBusinessUnits(data.businessUnits || []);
        setProjects(data.projects || []);
        setUsers(data.users || []);
        if (data.users?.length > 0) {
          setCurrentPersona(data.users[0]);
        }
      })
      .finally(() => setLoading(false));
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
              <Briefcase className="h-4 w-4" />
              <span>Multi-Tenant Portfolio Architecture</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Business Units & Project Portfolio
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolated operational domains with dedicated project streams, health scores, and role boundaries.
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
            Loading business units and active project health...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Business Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessUnits.map((bu) => {
                const buProjects = projects.filter((p) => p.business_unit_id === bu.id);
                return (
                  <div
                    key={bu.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {bu.code}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {bu.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{bu.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                        {bu.description}
                      </p>
                    </div>

                    {/* Active Projects in BU */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>Projects ({buProjects.length})</span>
                      </div>
                      {buProjects.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic">No active projects logged.</div>
                      ) : (
                        <div className="space-y-1.5">
                          {buProjects.map((p) => (
                            <div
                              key={p.id}
                              className="p-2 bg-slate-950 rounded border border-slate-800/80 text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-200 truncate max-w-[180px]">
                                {p.name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  p.status === 'Active'
                                    ? 'bg-blue-950 text-blue-300'
                                    : p.status === 'At Risk'
                                    ? 'bg-red-950 text-red-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
