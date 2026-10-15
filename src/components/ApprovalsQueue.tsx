'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { ApprovalRequest, User } from '@/lib/types';

interface ApprovalsQueueProps {
  approvals: ApprovalRequest[];
  currentUser: User;
  onRefresh: () => void;
}

export function ApprovalsQueue({
  approvals,
  currentUser,
  onRefresh,
}: ApprovalsQueueProps) {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const pastList = approvals.filter((a) => a.status !== 'pending');

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedApproval) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: selectedApproval.id,
          decision,
          notes: decisionNotes,
          actorId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSelectedApproval(null);
      setDecisionNotes('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing decision';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-[#D4AF37]" />
            Executive & Operational Approvals Queue
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict authorization gateway for capital disbursements, deliverable sign-offs, and strategic decisions
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F] px-3 py-1 rounded-full">
          {pendingList.length} Pending Actions
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pending Items */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Action Items Awaiting Your Decision
        </h4>

        {pendingList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-[#0B1728] border border-[#182C48] rounded-xl text-xs">
            Queue is clear. No pending approval requests requiring intervention.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingList.map((item) => (
              <div
                key={item.id}
                className="bg-[#0B1728] border border-[#182C48] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#1E3A5F] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      {item.subject}
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F]">
                        {item.entity_type}
                      </span>
                    </div>
                    {item.details && (
                      <div className="text-xs text-slate-300 mt-1">{item.details}</div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-4">
                      <span>
                        Requester: <strong className="text-slate-200">{item.requester?.full_name || 'SuperAgent'}</strong>
                      </span>
                      <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedApproval(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F1C40F] text-[#060D1A] font-black text-xs transition"
                  >
                    Review & Decide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Approvals */}
      {pastList.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#182C48]">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Completed Decision History
          </h4>
          <div className="divide-y divide-[#182C48] rounded-xl border border-[#182C48] overflow-hidden bg-[#0B1728]">
            {pastList.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-200">{item.subject}</div>
                  {item.decision_notes && (
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Notes: {item.decision_notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                      item.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {item.decided_at ? new Date(item.decided_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0B1728] border border-[#182C48] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-[#182C48] pb-3">
              <h3 className="text-sm font-bold text-white">Record Executive Decision</h3>
              <div className="text-xs text-slate-400 mt-1 font-semibold">{selectedApproval.subject}</div>
            </div>

            {selectedApproval.details && (
              <div className="p-3 bg-[#060D1A] rounded text-xs text-slate-300 border border-[#182C48]">
                {selectedApproval.details}
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 font-semibold">Decision Justification / Review Notes</label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="State conditions, disbursement instructions, or feedback..."
                className="w-full bg-[#060D1A] border border-[#182C48] rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#182C48]">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="px-3 py-1.5 rounded bg-[#0F223D] hover:bg-[#163156] text-slate-300 text-xs"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('rejected')}
                  className="px-3.5 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-semibold text-xs transition"
                >
                  Reject / Request Changes
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision('approved')}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  {isSubmitting ? 'Recording...' : 'Authorize & Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
