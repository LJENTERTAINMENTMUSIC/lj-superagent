'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Users2,
  FileCheck,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ExecutiveAnswers {
  q1_responsibilities: Array<{
    deliverableId: string;
    title: string;
    submittedBy: string;
    reviewedBy: string;
    status: string;
    evidenceLink: string;
  }>;
  q2_completedWithEvidence: Array<{
    taskId: string;
    title: string;
    owner: string;
    status: string;
    evidence: any;
    completedAt: string;
  }>;
  q3_risks: {
    blockedTasks: Array<{
      id: string;
      title: string;
      owner: string;
      businessUnit: string;
      reason: string;
      priority: string;
    }>;
    overdueTasks: Array<{
      id: string;
      title: string;
      owner: string;
      dueDate: string;
      status: string;
      priority: string;
    }>;
    atRiskProjects: Array<{
      id: string;
      name: string;
      healthScore: number;
      businessUnit: string;
    }>;
  };
  q4_teamDeliveryRate: Array<{
    unitId: string;
    name: string;
    code: string;
    color: string;
    totalTasks: number;
    completedTasks: number;
    deliveryRate: number;
  }>;
  q5_managementActions: Array<{
    id: string;
    subject: string;
    details?: string;
    type: string;
    requestedBy: string;
    urgency: string;
  }>;
}

export function ExecutiveQuestionsCard({ data }: { data: ExecutiveAnswers }) {
  const [selectedTab, setSelectedTab] = useState<number>(1);

  const questions = [
    { id: 1, title: '1. Who is responsible for each deliverable?', icon: Users2 },
    { id: 2, title: '2. What has each person completed & what evidence exists?', icon: CheckCircle2 },
    { id: 3, title: '3. Which tasks & projects are overdue, blocked or at risk?', icon: AlertTriangle },
    { id: 4, title: '4. How effectively is each team delivering commitments?', icon: TrendingUp },
    { id: 5, title: '5. What decisions & approvals are needed from management?', icon: FileCheck },
  ];

  return (
    <div className="bg-[#0B1728] border border-[#182C48] rounded-xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 bg-[#070F22] border-b border-[#182C48] flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">
              The 5 Executive Command Answers
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time operational truths synthesized directly from Supabase PostgreSQL records
          </p>
        </div>
        <span className="text-[11px] font-mono bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F] px-2.5 py-1 rounded flex items-center gap-1.5 font-bold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Grounded DB Engine</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#182C48] bg-[#081220] overflow-x-auto no-scrollbar">
        {questions.map((q) => {
          const Icon = q.icon;
          const isSelected = selectedTab === q.id;
          return (
            <button
              key={q.id}
              onClick={() => setSelectedTab(q.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                isSelected
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#0E1F36]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0B1728]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{q.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {/* Q1: Deliverable Responsibilities */}
        {selectedTab === 1 && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Deliverables recorded in system with explicit submitter, reviewer, and verified evidence links:
            </div>
            {data.q1_responsibilities.length === 0 ? (
              <div className="text-sm text-slate-500 py-4 text-center">No deliverables recorded yet.</div>
            ) : (
              <div className="divide-y divide-[#182C48] rounded-lg border border-[#182C48] overflow-hidden">
                {data.q1_responsibilities.map((item) => (
                  <div key={item.deliverableId} className="p-3.5 bg-[#0B1728] hover:bg-[#0E2038] flex items-center justify-between transition">
                    <div>
                      <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                        {item.title}
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                          item.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                        <span>Submitted by: <strong className="text-slate-200">{item.submittedBy}</strong></span>
                        <span>Reviewer: <strong className="text-slate-200">{item.reviewedBy}</strong></span>
                      </div>
                    </div>
                    {item.evidenceLink && item.evidenceLink !== 'No link provided' && (
                      <a
                        href={item.evidenceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 text-xs text-[#D4AF37] hover:text-[#F1C40F] bg-[#0F223D] border border-[#1E3A5F] px-3 py-1.5 rounded-md transition font-semibold"
                      >
                        <span>Inspect Evidence</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Q2: Completed with Evidence */}
        {selectedTab === 2 && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Principle: &ldquo;Measure outcomes, not just online activity&rdquo;. Completed deliverables verified by attached artifacts:
            </div>
            <div className="space-y-2">
              {data.q2_completedWithEvidence.map((t) => (
                <div key={t.taskId} className="p-3.5 bg-[#060D1A] border border-[#182C48] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-slate-200">{t.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      t.status === 'Completed' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-blue-900/60 text-blue-300'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5">
                    Owner: <strong className="text-slate-300">{t.owner}</strong> • Completed/Submitted: {t.completedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q3: Risks, Overdue, Blocked */}
        {selectedTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blocked */}
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400 font-semibold text-xs uppercase tracking-wider mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span>Blocked Operational Work ({data.q3_risks.blockedTasks.length})</span>
              </div>
              {data.q3_risks.blockedTasks.length === 0 ? (
                <div className="text-xs text-slate-500">No blocked tasks currently reported.</div>
              ) : (
                <div className="space-y-2">
                  {data.q3_risks.blockedTasks.map((b) => (
                    <div key={b.id} className="p-2.5 bg-red-950/40 border border-red-800/40 rounded text-xs">
                      <div className="font-semibold text-red-200">{b.title}</div>
                      <div className="text-red-300 mt-1 font-medium">Blocker: {b.reason}</div>
                      <div className="text-slate-400 mt-1 text-[11px]">
                        Owner: {b.owner} • Unit: {b.businessUnit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue */}
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-lg">
              <div className="flex items-center space-x-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span>Overdue Deadlines ({data.q3_risks.overdueTasks.length})</span>
              </div>
              {data.q3_risks.overdueTasks.length === 0 ? (
                <div className="text-xs text-slate-500">No overdue tasks recorded.</div>
              ) : (
                <div className="space-y-2">
                  {data.q3_risks.overdueTasks.map((o) => (
                    <div key={o.id} className="p-2.5 bg-amber-950/40 border border-amber-800/40 rounded text-xs">
                      <div className="font-semibold text-amber-200">{o.title}</div>
                      <div className="text-slate-400 mt-1 text-[11px]">
                        Due: <strong className="text-red-400">{o.dueDate}</strong> • Owner: {o.owner} ({o.priority} Priority)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Q4: Team Delivery Rates */}
        {selectedTab === 4 && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Measured delivery reliability calculated from completed tasks vs commitments across business units:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.q4_teamDeliveryRate.map((team) => (
                <div key={team.unitId} className="p-3.5 bg-[#060D1A] border border-[#182C48] rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 truncate pr-1">{team.name}</span>
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{team.deliveryRate}%</span>
                  </div>
                  <div className="w-full bg-[#182C48] h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] h-full rounded-full transition-all duration-500"
                      style={{ width: `${team.deliveryRate}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                    <span>{team.completedTasks} completed</span>
                    <span>{team.totalTasks} total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q5: Management Actions & Decisions */}
        {selectedTab === 5 && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Actionable decisions, disbursements, and strategic approvals waiting for executive sign-off:
            </div>
            <div className="space-y-2">
              {data.q5_managementActions.map((action) => (
                <div key={action.id} className="p-3.5 bg-[#060D1A] border border-[#182C48] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      {action.subject}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800 font-semibold">
                        {action.urgency}
                      </span>
                    </div>
                    {action.details && (
                      <div className="text-xs text-slate-300 mt-1">{action.details}</div>
                    )}
                    <div className="text-[11px] text-slate-500 mt-1">
                      Requested by: <strong className="text-slate-400">{action.requestedBy}</strong>
                    </div>
                  </div>
                  <a
                    href="/app/approvals"
                    className="flex items-center space-x-1 text-xs text-[#D4AF37] hover:text-[#F1C40F] bg-[#0F223D] border border-[#1E3A5F] px-3 py-1.5 rounded transition font-bold"
                  >
                    <span>Decide</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
