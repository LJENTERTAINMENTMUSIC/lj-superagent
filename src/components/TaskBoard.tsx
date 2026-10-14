'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  AlertCircle,
  Clock,
  Send,
  FileCheck2,
  ExternalLink,
  Plus,
  Filter,
} from 'lucide-react';
import { Task, TaskStatus, User } from '@/lib/types';

interface TaskBoardProps {
  tasks: Task[];
  currentUser: User;
  onRefresh: () => void;
}

const STATUS_COLUMNS: TaskStatus[] = [
  'Backlog',
  'Ready',
  'In Progress',
  'Blocked',
  'In Review',
  'Completed',
];

export function TaskBoard({ tasks, currentUser, onRefresh }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeliverableModal, setShowDeliverableModal] = useState<boolean>(false);
  const [showBlockerModal, setShowBlockerModal] = useState<boolean>(false);
  const [blockerReasonInput, setBlockerReasonInput] = useState<string>('');
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);

  // Deliverable form
  const [delivTitle, setDelivTitle] = useState('');
  const [delivLink, setDelivLink] = useState('');
  const [delivNotes, setDelivNotes] = useState('');

  // Filtering
  const [filterBu, setFilterBu] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const businessUnits = Array.from(
    new Set(tasks.map((t) => t.business_unit?.name).filter(Boolean))
  );

  const filteredTasks = tasks.filter((t) => {
    if (filterBu !== 'all' && t.business_unit?.name !== filterBu) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'Blocked') {
      setTargetTaskId(taskId);
      setShowBlockerModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          newStatus,
          actorId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating task';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBlocker = async () => {
    if (!targetTaskId) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: targetTaskId,
          newStatus: 'Blocked',
          actorId: currentUser.id,
          blockerReason: blockerReasonInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowBlockerModal(false);
      setBlockerReasonInput('');
      setTargetTaskId(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error setting blocker';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          title: delivTitle,
          externalLink: delivLink,
          submissionNotes: delivNotes,
          submittedBy: currentUser.id,
          reviewerId: selectedTask.reviewer_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowDeliverableModal(false);
      setDelivTitle('');
      setDelivLink('');
      setDelivNotes('');
      setSelectedTask(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting deliverable';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-300">Filters:</span>

          <select
            value={filterBu}
            onChange={(e) => setFilterBu(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">All Business Units</option>
            {businessUnits.map((bu) => (
              <option key={bu} value={bu!}>
                {bu}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="text-slate-400">
          Showing <span className="text-amber-400 font-bold">{filteredTasks.length}</span> active work items
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((colStatus) => {
          const colTasks = filteredTasks.filter((t) => t.status === colStatus);
          return (
            <div
              key={colStatus}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="font-semibold text-xs text-slate-300 tracking-wide uppercase">
                  {colStatus}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg shadow-sm space-y-2 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {task.business_unit?.code || 'BU'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          task.priority === 'Urgent'
                            ? 'text-red-400'
                            : task.priority === 'High'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-2">
                      {task.title}
                    </h4>

                    {task.blocker_reason && (
                      <div className="p-2 bg-red-950/40 border border-red-900/40 rounded text-[11px] text-red-300">
                        <strong>Blocker:</strong> {task.blocker_reason}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                      <span>{task.owner?.full_name || 'Unassigned'}</span>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {task.due_date}
                        </span>
                      )}
                    </div>

                    {/* Quick Action / Transition dropdown */}
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        disabled={isSubmitting}
                        className="text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700 px-1.5 py-1 focus:outline-none"
                      >
                        {STATUS_COLUMNS.map((s) => (
                          <option key={s} value={s}>
                            Move: {s}
                          </option>
                        ))}
                      </select>

                      {/* Submit Deliverable Button */}
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDeliverableModal(true);
                          }}
                          className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Send className="h-2.5 w-2.5" />
                          <span>Evidence</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliverable Submission Modal */}
      {showDeliverableModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-amber-400" />
                Submit Deliverable & Evidence
              </h3>
              <button
                onClick={() => setShowDeliverableModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500">Task: </span>
              <strong>{selectedTask.title}</strong>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={delivTitle}
                  onChange={(e) => setDelivTitle(e.target.value)}
                  placeholder="e.g. Mechanical Rights Audit Spreadsheet v1"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence URL / PR / Artifact Link</label>
                <input
                  type="url"
                  value={delivLink}
                  onChange={(e) => setDelivLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Submission Notes & Acceptance Evidence *</label>
                <textarea
                  rows={3}
                  required
                  value={delivNotes}
                  onChange={(e) => setDelivNotes(e.target.value)}
                  placeholder="Describe the completed work, how acceptance criteria were met, and tests run..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeliverableModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold tracking-wide"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit For Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blocker Reason Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Document Operational Blocker
            </h3>
            <p className="text-xs text-slate-300">
              State the exact dependency, resource, or external block halting progress. This will alert management.
            </p>
            <textarea
              rows={3}
              value={blockerReasonInput}
              onChange={(e) => setBlockerReasonInput(e.target.value)}
              placeholder="e.g. Waiting for fuel delivery sign-off from finance / API credentials missing..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBlockerModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBlocker}
                disabled={!blockerReasonInput.trim()}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
              >
                Mark Task Blocked
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
