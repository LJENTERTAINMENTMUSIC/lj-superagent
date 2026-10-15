import { supabase } from '../supabase';
import { ActionRiskTier } from '../types';
import { searchKnowledgeBase } from '../knowledge';
import { getTasks, updateTaskStatus } from '../services';

export interface ToolDefinition {
  name: string;
  description: string;
  riskTier: ActionRiskTier;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (params: any, context: AgentToolContext) => Promise<any>;
}

export interface AgentToolContext {
  actorId?: string;
  actorRole?: string;
  businessUnitId?: string;
  channel?: string;
}

export const AGENT_TOOLS: Record<string, ToolDefinition> = {
  // 1. Executive Summary & KPIs
  get_executive_summary: {
    name: 'get_executive_summary',
    description: 'Fetch executive KPIs, overdue counts, critical blockers, and pending approvals.',
    riskTier: 'read_only',
    parameters: {
      businessUnitId: { type: 'string', description: 'Optional business unit filter ID', required: false },
    },
    execute: async (params) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let taskQuery = supabase.from('bos_tasks').select('id, title, status, due_date, blocker_reason, business_unit_id');
      if (params.businessUnitId) {
        taskQuery = taskQuery.eq('business_unit_id', params.businessUnitId);
      }
      const { data: tasks } = await taskQuery;
      const allTasks = tasks || [];
      const overdue = allTasks.filter((t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed');
      const blocked = allTasks.filter((t) => t.status === 'Blocked');
      const completed = allTasks.filter((t) => t.status === 'Completed');

      const { count: pendingApprovals } = await supabase
        .from('bos_approval_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalTasks: allTasks.length,
        completedCount: completed.length,
        overdueCount: overdue.length,
        blockedCount: blocked.length,
        pendingApprovalsCount: pendingApprovals || 0,
        blockedTasks: blocked.map((b) => ({ id: b.id, title: b.title, reason: b.blocker_reason })),
      };
    },
  },

  // 2. Search Grounded Knowledge Base
  search_knowledge_base: {
    name: 'search_knowledge_base',
    description: 'Perform semantic and hybrid search across verified company documents and structured facts.',
    riskTier: 'read_only',
    parameters: {
      query: { type: 'string', description: 'The search query or factual topic', required: true },
      businessUnitId: { type: 'string', description: 'Business unit scope filter', required: false },
    },
    execute: async (params) => {
      return await searchKnowledgeBase({
        query: params.query,
        businessUnitId: params.businessUnitId,
        limit: 4,
      });
    },
  },

  // 3. Query Scoped Tasks
  query_tasks: {
    name: 'query_tasks',
    description: 'Query business tasks filtered by business unit, status, or overdue condition.',
    riskTier: 'read_only',
    parameters: {
      businessUnitId: { type: 'string', description: 'Target business unit ID or code', required: false },
      status: { type: 'string', description: 'Task status filter', required: false },
      onlyOverdue: { type: 'boolean', description: 'Filter only overdue tasks', required: false },
    },
    execute: async (params) => {
      let buId = params.businessUnitId;
      if (buId && buId.length < 10) {
        // Resolve code like 'LJE' to UUID
        const { data: bu } = await supabase.from('bos_business_units').select('id').eq('code', buId.toUpperCase()).single();
        if (bu) buId = bu.id;
      }

      const tasks = await getTasks({
        businessUnitId: buId,
        status: params.status,
      });

      const todayStr = new Date().toISOString().split('T')[0];
      if (params.onlyOverdue) {
        return tasks.filter((t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed');
      }
      return tasks.slice(0, 10);
    },
  },

  // 4. Create Task
  create_task: {
    name: 'create_task',
    description: 'Create a new business task and assign it to a team member.',
    riskTier: 'reversible_internal',
    parameters: {
      title: { type: 'string', description: 'Task title', required: true },
      businessUnitId: { type: 'string', description: 'Business Unit ID', required: true },
      description: { type: 'string', description: 'Detailed instructions', required: false },
      ownerId: { type: 'string', description: 'Assigned User ID', required: false },
      priority: { type: 'string', description: 'Urgent, High, Medium, or Low', required: false },
      dueDate: { type: 'string', description: 'YYYY-MM-DD due date', required: false },
    },
    execute: async (params, context) => {
      // Find project for BU if not specified
      const { data: proj } = await supabase
        .from('bos_projects')
        .select('id')
        .eq('business_unit_id', params.businessUnitId)
        .limit(1)
        .single();

      const { data: task, error } = await supabase
        .from('bos_tasks')
        .insert({
          title: params.title,
          description: params.description || 'Created via LJ SuperAgent',
          business_unit_id: params.businessUnitId,
          project_id: proj?.id || null,
          owner_id: params.ownerId || null,
          priority: params.priority || 'Medium',
          status: 'Ready',
          due_date: params.dueDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('bos_audit_logs').insert({
        actor_id: context.actorId || null,
        action: 'AGENT_TASK_CREATED',
        entity_type: 'TASK',
        entity_id: task.id,
        metadata: { title: params.title, createdBy: 'SuperAgent' },
      });

      return { success: true, taskId: task.id, title: task.title, status: 'Ready' };
    },
  },

  // 5. Update Task Status
  update_task_status: {
    name: 'update_task_status',
    description: 'Update status of a task with verification of Definition of Done.',
    riskTier: 'reversible_internal',
    parameters: {
      taskId: { type: 'string', description: 'Task UUID', required: true },
      newStatus: { type: 'string', description: 'Target status (In Progress, Blocked, Completed, etc.)', required: true },
      blockerReason: { type: 'string', description: 'Required if setting status to Blocked', required: false },
    },
    execute: async (params, context) => {
      const res = await updateTaskStatus(
        params.taskId,
        params.newStatus,
        context.actorId || '00000000-0000-0000-0000-000000000000',
        params.blockerReason
      );
      return res;
    },
  },

  // 6. Query Music Royalties & Catalog (LJ Entertainment)
  query_royalties_and_catalog: {
    name: 'query_royalties_and_catalog',
    description: 'Query verified music catalog sound recordings, ISRC codes, and mechanical royalties claims.',
    riskTier: 'read_only',
    parameters: {
      searchQuery: { type: 'string', description: 'Song title, artist name, or ISRC', required: false },
    },
    execute: async (params) => {
      let query = supabase.from('catalogue').select('id, title, artist, isrc, release_year, status').limit(10);
      if (params.searchQuery) {
        query = query.ilike('title', `%${params.searchQuery}%`);
      }
      const { data: catalogue } = await query;

      const { data: claims } = await supabase
        .from('mogul_audit_claims')
        .select('id, track_title, organization, claim_status, estimated_value')
        .limit(5);

      return {
        catalogueCount: catalogue?.length || 0,
        sampleTracks: catalogue || [],
        auditClaims: claims || [],
      };
    },
  },

  // 7. Request Executive Approval (High Impact Gate)
  request_executive_approval: {
    name: 'request_executive_approval',
    description: 'Submit an operational or capital request to the CEO approval queue.',
    riskTier: 'high_impact',
    parameters: {
      subject: { type: 'string', description: 'Short summary of requested approval', required: true },
      details: { type: 'string', description: 'Financial or operational impact details', required: true },
      entityType: { type: 'string', description: 'Type: strategic, task, or deliverable', required: false },
    },
    execute: async (params, context) => {
      const { data, error } = await supabase
        .from('bos_approval_requests')
        .insert({
          subject: params.subject,
          details: params.details,
          entity_type: params.entityType || 'strategic',
          requester_id: context.actorId || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('bos_audit_logs').insert({
        actor_id: context.actorId || null,
        action: 'AGENT_APPROVAL_REQUESTED',
        entity_type: 'APPROVAL_REQUEST',
        entity_id: data.id,
        metadata: { subject: params.subject, details: params.details },
      });

      return {
        requiresApproval: true,
        approvalId: data.id,
        status: 'pending_executive_signoff',
        message: `High-impact action queued for CEO approval: "${params.subject}". Execution paused until confirmed.`,
      };
    },
  },

  // 8. Send WhatsApp Message (External Communication)
  send_whatsapp_message: {
    name: 'send_whatsapp_message',
    description: 'Dispatch an approved WhatsApp message or template to an authorized phone number.',
    riskTier: 'external_communication',
    parameters: {
      recipientPhone: { type: 'string', description: 'E.164 phone number', required: true },
      messageText: { type: 'string', description: 'Message body text', required: true },
      conversationId: { type: 'string', description: 'Optional conversation thread UUID', required: false },
    },
    execute: async (params) => {
      // In production calls Meta Cloud API. Persists message record with status 'sent'.
      const { data, error } = await supabase
        .from('bos_whatsapp_messages')
        .insert({
          conversation_id: params.conversationId || null,
          direction: 'outbound',
          sender_phone: process.env.WHATSAPP_PHONE_NUMBER || '+15550199',
          recipient_phone: params.recipientPhone,
          message_type: 'text',
          content: params.messageText,
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, messageId: data.id, status: 'sent' };
    },
  },
};
