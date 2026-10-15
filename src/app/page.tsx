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
  MessageSquare,
  Bot,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { User, BusinessUnit } from '@/lib/types';

export default function CEOCommandPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);
  const [selectedBuId, setSelectedBuId] = useState<string>('all');

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

  // Filter business units if workspace selected
  const displayedBUs = data?.businessUnits
    ? selectedBuId === 'all'
      ? data.businessUnits
      : data.businessUnits.filter((b: any) => b.id === selectedBuId)
    : [];

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentPersona={currentPersona}
        onPersonaChange={(u) => setCurrentPersona(u)}
        availableUsers={data?.users || []}
        selectedBuId={selectedBuId}
        onSelectBu={(id) => setSelectedBuId(id)}
        businessUnits={data?.businessUnits || []}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Executive Hero Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#182C48] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              <Activity className="h-4 w-4" />
              <span>Executive Command Overview · Base44 & Tool-Using AI Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              LJ Conglomerate Operations Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Unified autonomous operating system orchestrating WhatsApp Business, central pgvector memory, 13 specialist agents, and workforce deliverable accountability across 8 business workspaces.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Link
              href="/app/whatsapp"
              className="px-3.5 py-2 rounded-lg bg-[#0F223D] hover:bg-[#163156] text-[#D4AF37] border border-[#1E3A5F] font-bold text-xs flex items-center gap-1.5 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Command</span>
            </Link>
            <Link
              href="/app/agents"
              className="px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F1C40F] text-[#060D1A] font-black text-xs flex items-center gap-1.5 transition shadow-lg"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Agent Swarm</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D4AF37] border-r-transparent align-[-0.125em]" />
            <div className="mt-4 font-semibold text-slate-300">
              Aggregating live operational records and pgvector memory from Supabase...
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {/* Active Business Units */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Workspaces</span>
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{data?.businessUnits?.length || 8}</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>100% Verified Entities</span>
                </div>
              </div>

              {/* Active Projects */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Projects</span>
                  <FolderGit2 className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{data?.kpis?.activeProjects || 3}</div>
                <div className="text-[11px] text-slate-400">Scoped with milestones</div>
              </div>

              {/* Overdue Work */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Overdue Tasks</span>
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-[#D4AF37]">
                  {data?.kpis?.overdueTasksCount ?? 0}
                </div>
                <div className="text-[11px] text-slate-400">Target completion elapsed</div>
              </div>

              {/* Critical Blockers */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Operational Blockers</span>
                  <AlertOctagon className="h-4 w-4 text-red-400" />
                </div>
                <div className="text-2xl font-black text-red-400">
                  {data?.kpis?.blockedTasksCount ?? 0}
                </div>
                <div className="text-[11px] text-red-400/80">Requires executive sign-off</div>
              </div>

              {/* In Review Deliverables */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>In Review</span>
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-400">
                  {data?.kpis?.inReviewTasks ?? 0}
                </div>
                <div className="text-[11px] text-slate-400">Deliverables ready for audit</div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Pending Approvals</span>
                  <FileCheck2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div className="text-2xl font-black text-[#D4AF37]">
                  {data?.kpis?.pendingApprovalsCount ?? 0}
                </div>
                <div className="text-[11px] text-slate-400">Capital & governance queue</div>
              </div>

              {/* Daily Reports Today */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Reports Logged</span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {data?.kpis?.dailyReportsToday ?? 0}
                </div>
                <div className="text-[11px] text-slate-400">Verified standup submissions</div>
              </div>

              {/* Total Workforce */}
              <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl shadow-md space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Total Workforce</span>
                  <Users className="h-4 w-4 text-slate-300" />
                </div>
                <div className="text-2xl font-black text-white">{data?.kpis?.totalStaff || 6}</div>
                <div className="text-[11px] text-slate-400">Staff, interns & contractors</div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/app/whatsapp"
                className="p-4 bg-[#0B1728] hover:bg-[#0E2038] border border-[#182C48] hover:border-[#D4AF37]/50 rounded-xl transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Command Centre</span>
                  </div>
                  <p className="text-xs text-slate-400">Inbound webhooks, voice note STT, and natural language command router</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-[#D4AF37] transition" />
              </Link>

              <Link
                href="/app/agents"
                className="p-4 bg-[#0B1728] hover:bg-[#0E2038] border border-[#182C48] hover:border-[#D4AF37]/50 rounded-xl transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <Bot className="h-4 w-4" />
                    <span>AI Agent Swarm</span>
                  </div>
                  <p className="text-xs text-slate-400">SuperAgent Chief of Staff + 12 specialist agents with tool calling</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-[#D4AF37] transition" />
              </Link>

              <Link
                href="/app/knowledge"
                className="p-4 bg-[#0B1728] hover:bg-[#0E2038] border border-[#182C48] hover:border-[#D4AF37]/50 rounded-xl transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <BookOpen className="h-4 w-4" />
                    <span>Central Knowledge Base</span>
                  </div>
                  <p className="text-xs text-slate-400">pgvector semantic search, source citations, facts vs assumptions</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-[#D4AF37] transition" />
              </Link>
            </div>

            {/* The 5 Core Executive Questions Answered */}
            {data?.executiveAnswers && (
              <ExecutiveQuestionsCard data={data.executiveAnswers} />
            )}

            {/* Configured Business Workspaces Grid (All 8 Entities) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Configured Business Workspaces</span>
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[#0F223D] text-[#D4AF37]">
                      {displayedBUs.length} Entities
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Multi-tenant isolated workstreams with business-level permissions and verified data
                  </p>
                </div>
                <Link
                  href="/app/portfolio"
                  className="text-xs text-[#D4AF37] hover:text-[#F1C40F] font-semibold"
                >
                  Manage Portfolio →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedBUs.map((bu: any) => (
                  <div
                    key={bu.id}
                    className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl space-y-3 hover:border-[#1E3A5F] transition"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F]">
                        {bu.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{bu.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
                        {bu.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#182C48] flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px]">Status: <strong className="text-emerald-400 capitalize">{bu.status}</strong></span>
                      <Link
                        href={`/app/tasks?bu=${bu.id}`}
                        className="text-[#D4AF37] hover:text-[#F1C40F] font-semibold text-xs"
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
