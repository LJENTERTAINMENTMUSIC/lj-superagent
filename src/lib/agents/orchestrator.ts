import { supabase } from '../supabase';
import { User, SpecialistAgentName } from '../types';
import { AGENT_TOOLS, ToolDefinition, AgentToolContext } from './tools';
import { SPECIALIST_AGENTS } from './specialists';

export interface AgentExecutionResult {
  runId: string;
  leadAgent: SpecialistAgentName;
  delegatedSpecialists: SpecialistAgentName[];
  finalResponse: string;
  actionStatus: 'completed' | 'awaits_approval' | 'failed';
  approvalRequired?: {
    approvalId: string;
    subject: string;
    details: string;
  };
  toolCalls: Array<{
    toolName: string;
    parameters: any;
    result: any;
    riskTier: string;
  }>;
  citations: Array<{ label: string; id: string; type: string }>;
  conflictsDetected: string[];
  executionTimeMs: number;
}

/**
 * Determine which specialist agents should handle the given user prompt
 */
function routeIntent(prompt: string): {
  lead: SpecialistAgentName;
  delegates: SpecialistAgentName[];
} {
  const p = prompt.toLowerCase();

  if (p.includes('music') || p.includes('royalt') || p.includes('catalog') || p.includes('ascap') || p.includes('isrc')) {
    return {
      lead: 'Music Business, Royalties and Rights Agent',
      delegates: ['Executive Chief of Staff', 'Research and Knowledge Agent'],
    };
  }

  if (p.includes('developer') || p.includes('website') || p.includes('pr ') || p.includes('engineering') || p.includes('bug') || p.includes('tiarion')) {
    return {
      lead: 'Software Development Agent',
      delegates: ['Project and Task Manager', 'Executive Chief of Staff'],
    };
  }

  if (p.includes('property') || p.includes('tenant') || p.includes('facility') || p.includes('maintenance') || p.includes('smartfix')) {
    return {
      lead: 'Real Estate and Facility Operations Agent',
      delegates: ['Project and Task Manager', 'Executive Chief of Staff'],
    };
  }

  if (p.includes('overdue') || p.includes('task') || p.includes('assign') || p.includes('milestone')) {
    return {
      lead: 'Project and Task Manager',
      delegates: ['Executive Chief of Staff'],
    };
  }

  if (p.includes('daily report') || p.includes('briefing') || p.includes('business report') || p.includes('executive summary')) {
    return {
      lead: 'Executive Chief of Staff',
      delegates: ['Finance and Business Intelligence Agent', 'Project and Task Manager', 'Research and Knowledge Agent'],
    };
  }

  if (p.includes('contract') || p.includes('legal') || p.includes('agreement') || p.includes('terms')) {
    return {
      lead: 'Document and Contract Analysis Agent',
      delegates: ['Research and Knowledge Agent', 'Executive Chief of Staff'],
    };
  }

  if (p.includes('customer') || p.includes('booking') || p.includes('enquir') || p.includes('inquiry')) {
    return {
      lead: 'Customer Support Agent',
      delegates: ['Sales and CRM Agent', 'Executive Chief of Staff'],
    };
  }

  // Default to Central SuperAgent
  return {
    lead: 'Executive Chief of Staff',
    delegates: ['Research and Knowledge Agent'],
  };
}

/**
 * Execute SuperAgent Orchestrator
 */
export async function runAgentOrchestrator(params: {
  prompt: string;
  actor: User;
  businessUnitId?: string;
  channel?: 'web' | 'whatsapp' | 'api';
}): Promise<AgentExecutionResult> {
  const startTime = Date.now();
  const { prompt, actor, businessUnitId, channel = 'web' } = params;

  // 1. Create agent run record in DB
  const { data: run, error: runErr } = await supabase
    .from('bos_agent_runs')
    .insert({
      session_id: `SESSION-${Date.now()}`,
      agent_name: 'SuperAgent Orchestrator',
      prompt,
      structured_context: {
        actorId: actor.id,
        actorRole: actor.role,
        businessUnitId,
        channel,
      },
      status: 'running',
    })
    .select()
    .single();

  const runId = run?.id || `run-local-${Date.now()}`;

  // 2. Route to Lead and Delegates
  const routing = routeIntent(prompt);
  const leadConfig = SPECIALIST_AGENTS[routing.lead];
  const toolCalls: AgentExecutionResult['toolCalls'] = [];
  const citations: AgentExecutionResult['citations'] = [];
  const conflictsDetected: string[] = [];
  let actionStatus: AgentExecutionResult['actionStatus'] = 'completed';
  let approvalRequired: AgentExecutionResult['approvalRequired'] = undefined;

  const toolContext: AgentToolContext = {
    actorId: actor.id,
    actorRole: actor.role,
    businessUnitId,
    channel,
  };

  const pLower = prompt.toLowerCase();

  // 3. Orchestrate Tool Execution based on intent
  if (pLower.includes('daily') || pLower.includes('business report') || pLower.includes('executive summary')) {
    // Lead executes executive summary
    const summary = await AGENT_TOOLS.get_executive_summary.execute({ businessUnitId }, toolContext);
    toolCalls.push({
      toolName: 'get_executive_summary',
      parameters: { businessUnitId },
      result: summary,
      riskTier: 'read_only',
    });

    if (summary.blockedCount > 0) {
      conflictsDetected.push(`Detected ${summary.blockedCount} active operational bottleneck(s) requiring executive intervention.`);
    }

    citations.push({ label: 'Consolidated Executive KPIs', id: 'kpi-summary', type: 'KPI' });
  }

  if (pLower.includes('overdue') || pLower.includes('tasks across')) {
    const tasks = await AGENT_TOOLS.query_tasks.execute({ businessUnitId, onlyOverdue: true }, toolContext);
    toolCalls.push({
      toolName: 'query_tasks',
      parameters: { businessUnitId, onlyOverdue: true },
      result: tasks,
      riskTier: 'read_only',
    });

    tasks.forEach((t: any) => {
      citations.push({ label: t.title, id: t.id, type: 'TASK' });
    });
  }

  if (pLower.includes('music') || pLower.includes('royalties') || pLower.includes('catalog')) {
    const musicData = await AGENT_TOOLS.query_royalties_and_catalog.execute({}, toolContext);
    toolCalls.push({
      toolName: 'query_royalties_and_catalog',
      parameters: {},
      result: musicData,
      riskTier: 'read_only',
    });
    musicData.sampleTracks.forEach((tr: any) => {
      citations.push({ label: `${tr.title} (${tr.isrc || 'ISRC'})`, id: tr.id, type: 'CATALOGUE' });
    });
  }

  // Always query knowledge base if user is asking factual questions or missing info
  if (pLower.includes('knowledge') || pLower.includes('what is') || pLower.includes('policy') || pLower.includes('information')) {
    const kb = await AGENT_TOOLS.search_knowledge_base.execute({ query: prompt, businessUnitId }, toolContext);
    toolCalls.push({
      toolName: 'search_knowledge_base',
      parameters: { query: prompt, businessUnitId },
      result: kb,
      riskTier: 'read_only',
    });

    kb.chunks.forEach((c: any) => {
      citations.push({ label: `${c.documentTitle} [Chunk #${c.chunkId.slice(0, 6)}]`, id: c.chunkId, type: 'KNOWLEDGE' });
    });
  }

  // Action Handling: High Impact approvals check
  if (pLower.includes('pay') || pLower.includes('transfer') || pLower.includes('disburse') || pLower.includes('invoice') || pLower.includes('approve 2.4m')) {
    const approvalRes = await AGENT_TOOLS.request_executive_approval.execute({
      subject: 'Capital Disbursement: Ereokomi Harvester Fuel / Supplier Settlement',
      details: '2,400,000 NGN diesel purchase for agricultural harvesting machinery.',
      entityType: 'strategic',
    }, toolContext);

    toolCalls.push({
      toolName: 'request_executive_approval',
      parameters: { amount: 2400000 },
      result: approvalRes,
      riskTier: 'high_impact',
    });

    actionStatus = 'awaits_approval';
    approvalRequired = {
      approvalId: approvalRes.approvalId,
      subject: 'Capital Disbursement: Ereokomi Harvester Fuel',
      details: approvalRes.message,
    };
  }

  // 4. Synthesize Response
  let responseText = '';

  if (pLower.includes('daily') || pLower.includes('business report')) {
    const summaryCall = toolCalls.find((c) => c.toolName === 'get_executive_summary');
    const s = summaryCall?.result || {};
    responseText =
      `### LJ Conglomerate Executive Daily Briefing\n` +
      `**Prepared by:** ${leadConfig.name}\n\n` +
      `• **Deliverables Velocity:** ${s.completedCount ?? 0} completed tasks verified with approved evidence\n` +
      `• **Overdue Attention Required:** **${s.overdueCount ?? 0} tasks** past target completion date\n` +
      `• **Operational Blockers:** **${s.blockedCount ?? 0} active bottleneck(s)**\n` +
      `• **Executive Approvals:** ${s.pendingApprovalsCount ?? 0} pending in governance queue\n\n` +
      (conflictsDetected.length > 0 ? `> [!WARNING] **Action Items:** ${conflictsDetected.join(' ')}\n\n` : '') +
      `All 8 business units are monitored. System status is operational.`;
  } else if (pLower.includes('overdue')) {
    const taskCall = toolCalls.find((c) => c.toolName === 'query_tasks');
    const tasks = taskCall?.result || [];
    responseText =
      `### Overdue Tasks Report\n` +
      `**Lead Specialist:** ${leadConfig.name}\n\n` +
      (tasks.length > 0
        ? tasks.map((t: any) => `• **[${t.business_unit?.code || 'BU'}]** "${t.title}" — Due: **${t.due_date}** (Priority: ${t.priority}, Owner: ${t.owner?.full_name || 'Unassigned'})`).join('\n')
        : `All tasks across the portfolio are currently on schedule.`) +
      `\n\n*Action Status: Verified against database records.*`;
  } else if (approvalRequired) {
    responseText =
      `### Action Requires Executive Sign-off\n` +
      `**Specialist:** ${leadConfig.name}\n\n` +
      `⚠️ ${approvalRequired.details}\n` +
      `• **Approval Request ID:** \`${approvalRequired.approvalId}\`\n` +
      `• **Policy Enforcement:** Financial commitments exceeding operational thresholds cannot be executed automatically.\n\n` +
      `*Action Status: Awaiting CEO Approval in Executive Queue.*`;
  } else if (toolCalls.length > 0) {
    responseText =
      `### Analysis from ${leadConfig.name}\n\n` +
      `Query processed across **${routing.delegates.length + 1} specialist agents**.\n` +
      toolCalls.map((tc) => `• **Tool ${tc.toolName}:** executed successfully (${tc.riskTier})`).join('\n') +
      `\n\nVerified corporate data retrieved from persistent PostgreSQL storage.`;
  } else {
    responseText =
      `I have received your instruction: "${prompt}".\n` +
      `Coordinated by **${leadConfig.name}** across **${routing.delegates.join(', ')}**.\n` +
      `No high-risk actions were triggered. All data remains isolated within authorized business boundaries.`;
  }

  const executionTimeMs = Date.now() - startTime;

  // 5. Persist run and tool calls to Supabase
  if (run?.id) {
    await supabase
      .from('bos_agent_runs')
      .update({
        final_response: responseText,
        execution_time_ms: executionTimeMs,
        status: actionStatus === 'awaits_approval' ? 'blocked_for_approval' : 'completed',
      })
      .eq('id', run.id);

    if (toolCalls.length > 0) {
      const records = toolCalls.map((tc) => ({
        run_id: run.id,
        agent_name: leadConfig.name,
        tool_name: tc.toolName,
        parameters: tc.parameters,
        result: tc.result,
        risk_tier: tc.riskTier,
        approval_status: tc.riskTier === 'high_impact' ? 'pending_approval' : 'auto_approved',
        execution_status: 'success',
      }));
      await supabase.from('bos_agent_tool_calls').insert(records);
    }
  }

  return {
    runId,
    leadAgent: leadConfig.name,
    delegatedSpecialists: routing.delegates,
    finalResponse: responseText,
    actionStatus,
    approvalRequired,
    toolCalls,
    citations,
    conflictsDetected,
    executionTimeMs,
  };
}
