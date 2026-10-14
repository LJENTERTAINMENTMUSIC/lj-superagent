'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Send,
  Calendar,
} from 'lucide-react';
import { DailyReport, User, BusinessUnit } from '@/lib/types';

interface DailyReportsModuleProps {
  reports: DailyReport[];
  currentUser: User;
  businessUnits: BusinessUnit[];
  onRefresh: () => void;
}

export function DailyReportsModule({
  reports,
  currentUser,
  businessUnits,
  onRefresh,
}: DailyReportsModuleProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAckModal, setShowAckModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [supervisorFeedback, setSupervisorFeedback] = useState('');

  // Form State
  const [selectedBu, setSelectedBu] = useState(businessUnits[0]?.id || '');
  const [priorities, setPriorities] = useState('');
  const [completedWork, setCompletedWork] = useState('');
  const [blockers, setBlockers] = useState('');
  const [supportReq, setSupportReq] = useState('');
  const [nextActions, setNextActions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          businessUnitId: selectedBu || businessUnits[0]?.id,
          plannedPriorities: priorities,
          workCompleted: completedWork,
          blockers,
          supportRequired: supportReq,
          nextActions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowSubmitModal(false);
      setPriorities('');
      setCompletedWork('');
      setBlockers('');
      setSupportReq('');
      setNextActions('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!selectedReport) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/reports/daily', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          feedback: supervisorFeedback,
          supervisorId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowAckModal(false);
      setSelectedReport(null);
      setSupervisorFeedback('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error acknowledging report';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            Daily Standup & End-of-Day Operations Reports
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured outcome updates linked directly to operational tasks and supervisor coaching
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Submit Today&apos;s Report</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Reports Feed */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            No daily reports logged yet for this reporting period.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                    {report.user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      {report.user?.full_name}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {report.business_unit?.name || 'General BU'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>Report Date: <strong>{report.report_date}</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {report.supervisor_ack ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Supervisor Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowAckModal(true);
                      }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded transition"
                    >
                      Acknowledge & Coach
                    </button>
                  )}
                </div>
              </div>

              {/* Work Completed */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Planned Priorities: </span>
                  <span className="text-slate-200">{report.planned_priorities}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Work Completed: </span>
                  <span className="text-slate-200">{report.work_completed}</span>
                </div>

                {report.blockers && (
                  <div className="p-2 bg-red-950/40 border border-red-900/40 rounded text-red-300 flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Blocker:</strong> {report.blockers}
                      {report.support_required && (
                        <div className="text-slate-300 mt-0.5">
                          Support Required: {report.support_required}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {report.next_actions && (
                  <div>
                    <span className="text-slate-400 font-semibold">Next Actions: </span>
                    <span className="text-slate-300">{report.next_actions}</span>
                  </div>
                )}
              </div>

              {/* Supervisor Feedback */}
              {report.supervisor_feedback && (
                <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-amber-300">Supervisor Coaching Notes: </span>
                    <span className="text-slate-200">{report.supervisor_feedback}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                Submit Daily Operating Report
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Unit</label>
                <select
                  value={selectedBu}
                  onChange={(e) => setSelectedBu(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                >
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>
                      {bu.name} ({bu.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Planned Priorities *</label>
                <input
                  type="text"
                  required
                  value={priorities}
                  onChange={(e) => setPriorities(e.target.value)}
                  placeholder="e.g. 1. Complete mechanical rights claim form. 2. Verify ISRC codes."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Completed & Evidence *</label>
                <textarea
                  rows={3}
                  required
                  value={completedWork}
                  onChange={(e) => setCompletedWork(e.target.value)}
                  placeholder="Detailed summary of completed items with PR numbers or spreadsheet references..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blockers (if any)</label>
                  <input
                    type="text"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="e.g. Waiting on invoice payment"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Support Required</label>
                  <input
                    type="text"
                    value={supportReq}
                    onChange={(e) => setSupportReq(e.target.value)}
                    placeholder="e.g. Executive approval for diesel"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Next Actions</label>
                <input
                  type="text"
                  value={nextActions}
                  onChange={(e) => setNextActions(e.target.value)}
                  placeholder="Tomorrow's first deliverable..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Acknowledge & Coaching Feedback Modal */}
      {showAckModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Supervisor Review & Coaching
            </h3>
            <p className="text-xs text-slate-300">
              Reviewing report submitted by <strong>{selectedReport.user?.full_name}</strong> for {selectedReport.report_date}.
            </p>
            <textarea
              rows={3}
              value={supervisorFeedback}
              onChange={(e) => setSupervisorFeedback(e.target.value)}
              placeholder="Add coaching notes, guidance, or acknowledgment..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAckModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Confirm Acknowledgment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
