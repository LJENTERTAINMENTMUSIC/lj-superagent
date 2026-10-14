'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { ExecutiveQuestionsCard } from '@/components/ExecutiveQuestionsCard';
import {
  Building2,
  FolderGit2,
  AlertOctagon,
  Clock,
  CheckCircle,
  FileCheck2,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types';

export default function CEOCommandPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/executive-overview');
      const json = await res.json();
      setData(json);
      if (!currentPersona && json.users && json.users.length > 0) {
        setCurrentPersona(json.users[0]); // default to CEO
      }
    } catch (err) {
      console.error('Error fetching executive data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentPersona={currentPersona}
        onPersonaChange={(u) => setCurrentPersona(u)}
        availableUsers={data?.users || []}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Activity className="h-4 w-4" />
              <span>Consolidated Executive Command Centre</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              LJ Conglomerate Operations Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time workforce accountability, deliverable evidence verification, risk mitigation, and executive decision queue across all seven business entities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/ai-assistant"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md transition flex items-center gap-1.5"
            >
              <span>AI Operations Brief</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/tasks"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
            >
              Master Task Board
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent align-[-0.125em]" />
            <div className="mt-4 font-medium">Aggregating live operational records from Supabase PostgreSQL...</div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {/* Active Business Units */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Business Units</span>
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{data?.kpis?.activeBusinessUnits || 7}</div>
                <div className="text-[11px] text-slate-500">Autonomous operational entities</div>
              </div>

              {/* Active Projects */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Projects</span>
                  <FolderGit2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{data?.kpis?.activeProjects || 3}</div>
                <div className="text-[11px] text-emerald-400">100% scoped with milestones</div>
              </div>

              {/* Overdue Work */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Overdue Tasks</span>
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {data?.kpis?.overdueTasksCount ?? 0}
                </div>
                <div className="text-[11px] text-slate-500">Past target completion date</div>
              </div>

              {/* Critical Blockers */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Blocked Work</span>
                  <AlertOctagon className="h-4 w-4 text-red-400" />
                </div>
                <div className="text-2xl font-black text-red-400">
                  {data?.kpis?.blockedTasksCount ?? 0}
                </div>
                <div className="text-[11px] text-red-400/80">Requires executive intervention</div>
              </div>

              {/* Tasks Awaiting Review */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>In Review</span>
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-400">
                  {data?.kpis?.inReviewTasks ?? 0}
                </div>
                <div className="text-[11px] text-slate-500">Deliverables ready for audit</div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Pending Decisions</span>
                  <FileCheck2 className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {data?.kpis?.pendingApprovalsCount ?? 0}
                </div>
                <div className="text-[11px] text-slate-500">Capital & sign-off queue</div>
              </div>

              {/* Daily Reports Today */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Reports Logged</span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {data?.kpis?.dailyReportsToday ?? 0}
                </div>
                <div className="text-[11px] text-slate-500">Submitted today with outcomes</div>
              </div>

              {/* Total Workforce */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Workforce & Interns</span>
                  <Users className="h-4 w-4 text-slate-300" />
                </div>
                <div className="text-2xl font-black text-white">{data?.kpis?.totalStaff || 6}</div>
                <div className="text-[11px] text-slate-500">Permanent, interns & contractors</div>
              </div>
            </div>

            {/* The 5 Core Executive Questions Answered */}
            {data?.executiveAnswers && (
              <ExecutiveQuestionsCard data={data.executiveAnswers} />
            )}

            {/* Portfolio Business Units Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Configured Business Units</h3>
                  <p className="text-xs text-slate-400">
                    Each business unit has isolated workstreams, permissions, and deliverable registers
                  </p>
                </div>
                <Link
                  href="/app/portfolio"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View Details →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.businessUnits?.map((bu: any) => (
                  <div
                    key={bu.id}
                    className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {bu.code}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">{bu.name}</h4>
                      </div>
                      <span className="h-3 w-3 rounded-full bg-emerald-400" title="Active" />
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {bu.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Status: <strong className="text-emerald-400 capitalize">{bu.status}</strong></span>
                      <Link
                        href={`/app/tasks?bu=${bu.id}`}
                        className="text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Tasks & PRs →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
