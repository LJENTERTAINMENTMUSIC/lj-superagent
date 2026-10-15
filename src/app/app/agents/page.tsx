'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import {
  Bot,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { SPECIALIST_AGENTS } from '@/lib/agents/specialists';
import { AgentExecutionResult } from '@/lib/agents/orchestrator';

export default function AgentsOrchestrationPage() {
  const [prompt, setPrompt] = useState('Prepare my daily business report and check for operational blockers across Ereokomi.');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AgentExecutionResult | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string>('Executive Chief of Staff');

  const agentsList = Object.values(SPECIALIST_AGENTS);

  const handleRunExecution = async () => {
    if (!prompt.trim()) return;
    try {
      setRunning(true);
      const res = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Agent execution error:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#182C48] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              <Bot className="h-4 w-4" />
              <span>Multi-Agent Orchestration Swarm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Central SuperAgent & 12 Specialist Agents
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Deterministic task delegation, structured context passing, scoped permissions, and two-tier safety execution gates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[#0F223D] border border-[#1E3A5F] text-slate-300 font-mono">
              13 Active Agents · 8 Scoped Workspaces
            </span>
          </div>
        </div>

        {/* Prompt Dispatcher Box */}
        <div className="bg-[#0B1728] border border-[#182C48] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#D4AF37]" />
              <span>SuperAgent Command Console</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Low-risk actions execute automatically; high-impact transactions queue for approval.
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Give an instruction (e.g. 'Show overdue tasks in LJ Entertainment', 'Approve 2.4M diesel transfer')..."
              className="flex-1 bg-[#060D1A] border border-[#182C48] rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              onClick={handleRunExecution}
              disabled={running || !prompt.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F1C40F] disabled:opacity-50 text-[#060D1A] font-black text-xs flex items-center gap-2 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{running ? 'Orchestrating...' : 'Dispatch'}</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'Prepare my daily business report.',
              'Show all overdue tasks across LJ Entertainment.',
              'Check legacy catalog master recordings and ASCAP royalties.',
              'Approve 2.4M NGN supplier invoice for Ereokomi harvester fuel.',
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => setPrompt(qp)}
                className="text-[11px] px-2.5 py-1 rounded bg-[#0F223D] hover:bg-[#163156] text-slate-300 border border-[#1E3A5F] transition"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Execution Output (if available) */}
        {result && (
          <div className="bg-[#0B1728] border border-[#D4AF37]/40 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#182C48] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Lead Coordinator: <span className="text-[#D4AF37]">{result.leadAgent}</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                    result.actionStatus === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {result.actionStatus === 'completed' ? 'Executed Successfully' : 'Awaits CEO Approval'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Latency: {result.executionTimeMs}ms · Run ID: {result.runId.slice(0, 12)}
              </span>
            </div>

            {/* Synthesized Response */}
            <div className="bg-[#060D1A] border border-[#182C48] p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap text-slate-200">
              {result.finalResponse}
            </div>

            {/* Conflict or Blocker Warning */}
            {result.conflictsDetected && result.conflictsDetected.length > 0 && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <div>{result.conflictsDetected.join(' ')}</div>
              </div>
            )}

            {/* Tool Calls & Citations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Executed Tools ({result.toolCalls?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {result.toolCalls?.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#0F223D] border border-[#1E3A5F] rounded text-xs flex items-center justify-between"
                    >
                      <span className="font-mono text-[#D4AF37]">{tc.toolName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                        {tc.riskTier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Grounding Database Citations ({result.citations?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {result.citations?.map((cit, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#0F223D] border border-[#1E3A5F] rounded text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300 truncate pr-2">{cit.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {cit.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 13 Specialist Agents Directory */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Configured Specialist Agents (13)</h3>
            <p className="text-xs text-slate-400">
              Each specialist has approved tools, strict data access scopes, and defined limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentsList.map((agent) => (
              <div
                key={agent.name}
                onClick={() => setSelectedAgentName(agent.name)}
                className={`p-4 bg-[#0B1728] border rounded-xl space-y-3 cursor-pointer transition ${
                  selectedAgentName === agent.name
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                    : 'border-[#182C48] hover:border-[#1E3A5F]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0F223D] text-[#D4AF37] border border-[#1E3A5F]">
                      {agent.department}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{agent.name}</h4>
                  </div>
                  <Bot className="h-4 w-4 text-[#D4AF37]" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {agent.role}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#182C48] text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Approved Tools:</span>
                    <span className="text-slate-200 font-mono font-bold">{agent.allowedTools.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Data Scopes:</span>
                    <span className="text-[#D4AF37] font-mono">
                      {agent.businessScopes.length === 0 ? 'All 8 Workspaces' : agent.businessScopes.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
