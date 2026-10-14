'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Link2,
  Database,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AICopilotProps {
  userRole?: string;
}

export function AICopilotDrawer({ userRole = 'ceo' }: AICopilotProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    answer: string;
    citations: Array<{ label: string; id: string; type: string }>;
    timestamp: string;
  } | null>(null);

  const suggestedQueries = [
    'Summarise LJ Entertainment\'s completed work this week.',
    'Which projects have deadlines at risk in the next seven days?',
    'List staff members with overdue deliverables and latest recorded updates.',
    'Draft my weekly executive report across authorised business units.',
    'Identify recurring blockers affecting agricultural and field projects.',
  ];

  const handleAsk = async (queryText: string) => {
    const q = queryText || query;
    if (!q.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              LJ AI Operations Copilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
                <Database className="h-2.5 w-2.5" />
                Postgres Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evidence-backed answers citing verified tasks, blocker tickets, and deliverables. Zero hallucinations.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Role Scope: <strong className="text-amber-400 uppercase">{userRole}</strong></span>
        </div>
      </div>

      {/* Suggested Chips */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" />
          Executive Operational Prompts
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleAsk(sq);
              }}
              className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 hover:border-amber-400/50 px-3 py-1.5 rounded-lg transition text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="flex items-center space-x-2 pt-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk(query)}
          placeholder="Ask about team progress, overdue deliverables, blockers or draft executive summaries..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <button
          onClick={() => handleAsk(query)}
          disabled={loading || !query.trim()}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{loading ? 'Analyzing...' : 'Query'}</span>
        </button>
      </div>

      {/* Response Box */}
      {response && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Synthesized Analysis
            </span>
            <span>Recorded at {new Date(response.timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {response.answer}
          </div>

          {/* Source Citations */}
          {response.citations && response.citations.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Link2 className="h-3 w-3 text-blue-400" />
                Persisted Record Citations ({response.citations.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {response.citations.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded"
                  >
                    [{c.type}] {c.label} ({c.id.slice(0, 8)})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
