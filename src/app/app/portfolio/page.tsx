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
  ShieldCheck,
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
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentPersona={currentPersona}
        onPersonaChange={(u) => setCurrentPersona(u)}
        availableUsers={users}
        businessUnits={businessUnits}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#182C48] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
              <Briefcase className="h-4 w-4" />
              <span>Multi-Tenant Portfolio Architecture</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Business Workspaces & Project Portfolio (8 Entities)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolated operational domains with dedicated project streams, health scores, and role boundaries.
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

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            Loading business units and active project health...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Business Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {businessUnits.map((bu) => {
                const buProjects = projects.filter((p) => p.business_unit_id === bu.id);
                return (
                  <div
                    key={bu.id}
                    className="bg-[#0B1728] border border-[#182C48] rounded-xl p-5 space-y-4 shadow hover:border-[#1E3A5F] transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F]">
                          {bu.code}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">{bu.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                          {bu.description}
                        </p>
                      </div>
                    </div>

                    {/* Active Projects in BU */}
                    <div className="pt-3 border-t border-[#182C48] space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>Projects ({buProjects.length})</span>
                        <Link href={`/app/tasks?bu=${bu.id}`} className="text-[#D4AF37] hover:underline text-[10px]">
                          Tasks →
                        </Link>
                      </div>
                      {buProjects.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic">No active projects logged.</div>
                      ) : (
                        <div className="space-y-1.5">
                          {buProjects.map((p) => (
                            <div
                              key={p.id}
                              className="p-2 bg-[#060D1A] rounded border border-[#182C48] text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-200 truncate max-w-[150px]">
                                {p.name}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
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
