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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">
              The 5 Executive Command Answers
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time, persited operational truths answering executive inquiry directly from Postgres records
          </p>
        </div>
        <span className="text-[11px] font-mono bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded">
          Persisted Truth Engine
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 overflow-x-auto no-scrollbar">
        {questions.map((q) => {
          const Icon = q.icon;
          const isSelected = selectedTab === q.id;
          return (
            <button
              key={q.id}
              onClick={() => setSelectedTab(q.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition ${
                isSelected
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
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
              Deliverables currently recorded in the system with their author, reviewer, and verified evidence links:
            </div>
            {data.q1_responsibilities.length === 0 ? (
              <div className="text-sm text-slate-500 py-4 text-center">No deliverables recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
                {data.q1_responsibilities.map((item) => (
                  <div key={item.deliverableId} className="p-3.5 bg-slate-900/80 hover:bg-slate-800/40 flex items-center justify-between transition">
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
                        className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/60 border border-blue-800 px-3 py-1.5 rounded-md transition"
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
              Principle: "Measure outcomes, not just online activity". Completed work verified by attached deliverables:
            </div>
            <div className="space-y-2">
              {data.q2_completedWithEvidence.map((t) => (
                <div key={t.taskId} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
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
                      <div className="text-red-300 mt-1">Blocker: {b.reason}</div>
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
              <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.q4_teamDeliveryRate.map((team) => (
                <div key={team.unitId} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">{team.name}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{team.deliveryRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${team.deliveryRate}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                    <span>{team.completedTasks} completed</span>
                    <span>{team.totalTasks} total tasks</span>
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
                <div key={action.id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
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
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded transition"
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
