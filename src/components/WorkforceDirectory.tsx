'use client';

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  Target,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { User, EngagementType } from '@/lib/types';

export function WorkforceDirectory({ users }: { users: User[] }) {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (filterType === 'all') return true;
    return u.staff_profile?.engagement_type === filterType;
  });

  const toggleExpand = (id: string) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

  const getEngagementBadge = (type?: EngagementType) => {
    switch (type) {
      case 'intern':
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
            <GraduationCap className="h-3 w-3" />
            Virtual Intern
          </span>
        );
      case 'contractor':
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
            <Briefcase className="h-3 w-3" />
            Contractor
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
            <UserCheck className="h-3 w-3" />
            Permanent Staff
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Workforce Category:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'All Personnel' },
              { id: 'employee', label: 'Permanent Staff' },
              { id: 'intern', label: 'Virtual Interns (Cohorts)' },
              { id: 'contractor', label: 'Contractors' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded transition ${
                  filterType === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-400">
          Total count: <strong className="text-white">{filtered.length}</strong> active profiles
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => {
          const profile = user.staff_profile;
          const isExpanded = expandedUserId === user.id;

          return (
            <div
              key={user.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow transition hover:border-slate-700"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{user.full_name}</h4>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                  </div>
                  {getEngagementBadge(profile?.engagement_type)}
                </div>

                <div className="text-xs text-slate-300">
                  <div className="font-semibold text-slate-200">{profile?.title || 'Team Member'}</div>
                  <div className="text-slate-400 text-[11px]">{profile?.department || 'Operations'}</div>
                </div>

                {/* Intern Cohort Callout */}
                {profile?.intern_cohort && (
                  <div className="p-2.5 bg-purple-950/40 border border-purple-900/60 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-purple-300 font-semibold">
                      <span>Cohort:</span>
                      <span className="text-[11px] font-mono text-purple-200">{profile.intern_cohort}</span>
                    </div>
                    {profile.learning_goals && profile.learning_goals.length > 0 && (
                      <div className="text-[11px] text-purple-300/80 flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{profile.learning_goals.length} structured learning objectives</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Supervisor info */}
                {profile?.supervisor && (
                  <div className="text-[11px] text-slate-400">
                    Supervisor: <strong className="text-slate-300">{profile.supervisor.full_name}</strong>
                  </div>
                )}

                {/* Skills tags */}
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {profile.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Toggle details */}
                <button
                  onClick={() => toggleExpand(user.id)}
                  className="w-full text-xs text-slate-400 hover:text-amber-400 pt-2 border-t border-slate-800 flex items-center justify-center gap-1 transition"
                >
                  <span>{isExpanded ? 'Hide Details' : 'View Learning Goals & Onboarding'}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3 text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-amber-400" />
                      Learning Goals & Milestones
                    </h5>
                    {profile?.learning_goals && profile.learning_goals.length > 0 ? (
                      <div className="space-y-1.5">
                        {profile.learning_goals.map((g, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1"
                          >
                            <div className="font-medium text-slate-200 flex justify-between">
                              <span>{g.goal}</span>
                              <span className="text-[10px] uppercase font-bold text-amber-400">
                                {g.status}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[10px]">Target: {g.target}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[11px]">No custom learning goals assigned.</div>
                    )}
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      Onboarding Status
                    </h5>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="capitalize text-slate-200 font-medium">
                        {profile?.onboarding_status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
