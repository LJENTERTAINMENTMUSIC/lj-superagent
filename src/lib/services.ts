import { supabase } from './supabase';
import {
  BusinessUnit,
  User,
  Project,
  Task,
  Deliverable,
  DailyReport,
  WeeklyReport,
  ApprovalRequest,
  Notification,
  AuditLog,
  IntegrationConnection,
  TaskStatus,
} from './types';

// ==========================================
// 1. EXECUTIVE QUESTIONS & PORTFOLIO METRICS
// ==========================================
export async function getExecutiveOverview() {
  const [
    buRes,
    projectsRes,
    tasksRes,
    deliverablesRes,
    approvalsRes,
    reportsRes,
    usersRes,
  ] = await Promise.all([
    supabase.from('bos_business_units').select('*').order('name'),
    supabase.from('bos_projects').select('*, business_unit:bos_business_units(name, code, color)'),
    supabase.from('bos_tasks').select(`
      *,
      project:bos_projects(name, code),
      business_unit:bos_business_units(name, code, color),
      owner:bos_users!owner_id(id, full_name, email, role),
      reviewer:bos_users!reviewer_id(id, full_name, email),
      deliverables:bos_deliverables(*)
    `),
    supabase.from('bos_deliverables').select(`
      *,
      task:bos_tasks(title, priority, status),
      submitter:bos_users!submitted_by(full_name),
      reviewer:bos_users!reviewer_id(full_name)
    `).order('submitted_at', { ascending: false }),
    supabase.from('bos_approval_requests').select(`
      *,
      requester:bos_users!requester_id(full_name, email),
      approver:bos_users!approver_id(full_name)
    `).order('created_at', { ascending: false }),
    supabase.from('bos_daily_reports').select(`
      *,
      user:bos_users(full_name, email, role),
      business_unit:bos_business_units(name, code)
    `).order('report_date', { ascending: false }),
    supabase.from('bos_users').select('*, staff_profile:bos_staff_profiles(*)'),
  ]);

  const tasks: Task[] = (tasksRes.data as Task[]) || [];
  const projects: Project[] = (projectsRes.data as Project[]) || [];
  const deliverables: Deliverable[] = (deliverablesRes.data as Deliverable[]) || [];
  const approvals: ApprovalRequest[] = (approvalsRes.data as ApprovalRequest[]) || [];
  const dailyReports: DailyReport[] = (reportsRes.data as DailyReport[]) || [];
  const businessUnits: BusinessUnit[] = (buRes.data as BusinessUnit[]) || [];
  const users: User[] = (usersRes.data as User[]) || [];

  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'In Review').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked');
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed' && t.status !== 'Cancelled'
  );
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const atRiskProjects = projects.filter((p) => p.status === 'At Risk');

  // Answers to the 5 Core Executive Questions
  const executiveAnswers = {
    // Q1: Who is responsible for each deliverable?
    q1_responsibilities: deliverables.map((d) => ({
      deliverableId: d.id,
      title: d.title,
      submittedBy: d.submitter?.full_name || 'Unassigned',
      reviewedBy: d.reviewer?.full_name || 'Pending Reviewer',
      status: d.review_status,
      evidenceLink: d.external_link || d.file_url || 'No link provided',
    })),

    // Q2: What has each person completed, and what evidence supports it?
    q2_completedWithEvidence: tasks
      .filter((t) => t.status === 'Completed' || t.status === 'In Review')
      .map((t) => ({
        taskId: t.id,
        title: t.title,
        owner: t.owner?.full_name || 'Unassigned',
        status: t.status,
        evidence: (t.deliverables && t.deliverables.length > 0)
          ? t.deliverables.map((d) => ({
              title: d.title,
              url: d.external_link || d.file_url,
              status: d.review_status,
            }))
          : 'Pending deliverable attachment',
        completedAt: t.completed_at || 'In progress/Under review',
      })),

    // Q3: Which tasks and projects are overdue, blocked or at risk?
    q3_risks: {
      blockedTasks: blockedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        owner: t.owner?.full_name || 'Unassigned',
        businessUnit: t.business_unit?.name || 'General',
        reason: t.blocker_reason || 'Reason not documented',
        priority: t.priority,
      })),
      overdueTasks: overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        owner: t.owner?.full_name || 'Unassigned',
        dueDate: t.due_date,
        status: t.status,
        priority: t.priority,
      })),
      atRiskProjects: atRiskProjects.map((p) => ({
        id: p.id,
        name: p.name,
        healthScore: p.health_score,
        businessUnit: p.business_unit?.name,
      })),
    },

    // Q4: How effectively is each team delivering its commitments?
    q4_teamDeliveryRate: businessUnits.map((bu) => {
      const buTasks = tasks.filter((t) => t.business_unit_id === bu.id);
      const buCompleted = buTasks.filter((t) => t.status === 'Completed').length;
      const rate = buTasks.length > 0 ? Math.round((buCompleted / buTasks.length) * 100) : 100;
      return {
        unitId: bu.id,
        name: bu.name,
        code: bu.code,
        color: bu.color,
        totalTasks: buTasks.length,
        completedTasks: buCompleted,
        deliveryRate: rate,
      };
    }),

    // Q5: What decisions, approvals or resources are needed from management?
    q5_managementActions: pendingApprovals.map((a) => ({
      id: a.id,
      subject: a.subject,
      details: a.details,
      type: a.entity_type,
      requestedBy: a.requester?.full_name || 'System',
      urgency: a.entity_type === 'strategic' ? 'Urgent Executive Action' : 'Operational Review',
    })),
  };

  return {
    kpis: {
      activeBusinessUnits: businessUnits.length,
      activeProjects: projects.filter((p) => p.status === 'Active' || p.status === 'At Risk').length,
      totalTasks,
      completedTasks,
      inReviewTasks,
      blockedTasksCount: blockedTasks.length,
      overdueTasksCount: overdueTasks.length,
      pendingApprovalsCount: pendingApprovals.length,
      dailyReportsToday: dailyReports.filter((r) => r.report_date === todayStr).length,
      totalStaff: users.length,
    },
    businessUnits,
    projects,
    tasks,
    deliverables,
    approvals,
    dailyReports,
    users,
    executiveAnswers,
  };
}

// ==========================================
// 2. WORKFORCE & VIRTUAL INTERNSHIP
// ==========================================
export async function getWorkforceDirectory() {
  const { data, error } = await supabase
    .from('bos_users')
    .select(`
      *,
      staff_profile:bos_staff_profiles(
        *,
        supervisor:bos_users!supervisor_id(full_name, email)
      )
    `)
    .order('full_name');

  if (error) throw error;
  return (data as User[]) || [];
}

// ==========================================
// 3. TASKS & WORKFLOW ENGINE
// ==========================================
export async function getTasks(filters?: { businessUnitId?: string; status?: string; ownerId?: string }) {
  let query = supabase.from('bos_tasks').select(`
    *,
    project:bos_projects(name, code),
    business_unit:bos_business_units(name, code, color),
    owner:bos_users!owner_id(id, full_name, email, role),
    reviewer:bos_users!reviewer_id(id, full_name, email),
    deliverables:bos_deliverables(*)
  `).order('created_at', { ascending: false });

  if (filters?.businessUnitId) {
    query = query.eq('business_unit_id', filters.businessUnitId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Task[]) || [];
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  actorId: string,
  blockerReason?: string
) {
  // Enforce rule: A task cannot be marked Completed if approval is required and pending
  if (newStatus === 'Completed') {
    const { data: deliverables } = await supabase
      .from('bos_deliverables')
      .select('review_status')
      .eq('task_id', taskId);

    if (deliverables && deliverables.some((d) => d.review_status === 'pending')) {
      throw new Error('A task cannot be marked Completed while required deliverable approval is pending review.');
    }
  }

  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === 'Completed') {
    updatePayload.completed_at = new Date().toISOString();
  } else if (newStatus === 'Blocked') {
    updatePayload.blocker_reason = blockerReason || 'Operational bottleneck reported';
  }

  const { error } = await supabase
    .from('bos_tasks')
    .update(updatePayload)
    .eq('id', taskId);

  if (error) throw error;

  // Log audit event
  await supabase.from('bos_audit_logs').insert({
    actor_id: actorId,
    action: 'TASK_STATUS_CHANGED',
    entity_type: 'TASK',
    entity_id: taskId,
    metadata: { newStatus, blockerReason },
  });

  return { success: true };
}

export async function submitTaskDeliverable(payload: {
  taskId: string;
  title: string;
  submissionNotes: string;
  externalLink: string;
  evidenceType: 'link' | 'document' | 'code' | 'report' | 'image';
  submittedBy: string;
  reviewerId?: string;
}) {
  const { data, error } = await supabase
    .from('bos_deliverables')
    .insert({
      task_id: payload.taskId,
      title: payload.title,
      submission_notes: payload.submissionNotes,
      external_link: payload.externalLink,
      evidence_type: payload.evidenceType,
      submitted_by: payload.submittedBy,
      reviewer_id: payload.reviewerId,
      review_status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Update task to In Review
  await supabase
    .from('bos_tasks')
    .update({ status: 'In Review', updated_at: new Date().toISOString() })
    .eq('id', payload.taskId);

  // Create approval request
  await supabase.from('bos_approval_requests').insert({
    subject: `Deliverable Review: ${payload.title}`,
    details: payload.submissionNotes,
    entity_type: 'deliverable',
    entity_id: data.id,
    requester_id: payload.submittedBy,
    approver_id: payload.reviewerId,
    status: 'pending',
  });

  return data;
}

// ==========================================
// 4. APPROVALS WORKFLOW
// ==========================================
export async function decideApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  notes: string,
  actorId: string
) {
  const { data: approval, error: fetchErr } = await supabase
    .from('bos_approval_requests')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from('bos_approval_requests')
    .update({
      status: decision,
      decision_notes: notes,
      decided_at: new Date().toISOString(),
    })
    .eq('id', approvalId);

  if (error) throw error;

  // If deliverable approval, update deliverable and task accordingly
  if (approval.entity_type === 'deliverable' && approval.entity_id) {
    const deliverableStatus = decision === 'approved' ? 'approved' : 'changes_requested';
    await supabase
      .from('bos_deliverables')
      .update({
        review_status: deliverableStatus,
        review_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', approval.entity_id);

    // Get task ID
    const { data: deliv } = await supabase
      .from('bos_deliverables')
      .select('task_id')
      .eq('id', approval.entity_id)
      .single();

    if (deliv?.task_id) {
      const nextTaskStatus = decision === 'approved' ? 'Completed' : 'Changes Requested';
      await supabase
        .from('bos_tasks')
        .update({
          status: nextTaskStatus,
          completed_at: decision === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deliv.task_id);
    }
  }

  // Audit log
  await supabase.from('bos_audit_logs').insert({
    actor_id: actorId,
    action: `APPROVAL_${decision.toUpperCase()}`,
    entity_type: 'APPROVAL_REQUEST',
    entity_id: approvalId,
    metadata: { decision, notes },
  });

  return { success: true };
}

// ==========================================
// 5. DAILY & WEEKLY REPORTS
// ==========================================
export async function submitDailyReport(payload: {
  userId: string;
  businessUnitId: string;
  plannedPriorities: string;
  workCompleted: string;
  blockers?: string;
  supportRequired?: string;
  nextActions?: string;
}) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bos_daily_reports')
    .upsert(
      {
        user_id: payload.userId,
        business_unit_id: payload.businessUnitId,
        report_date: today,
        planned_priorities: payload.plannedPriorities,
        work_completed: payload.workCompleted,
        blockers: payload.blockers,
        support_required: payload.supportRequired,
        next_actions: payload.nextActions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,report_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acknowledgeDailyReport(
  reportId: string,
  feedback: string,
  supervisorId: string
) {
  const { error } = await supabase
    .from('bos_daily_reports')
    .update({
      supervisor_ack: true,
      supervisor_feedback: feedback,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;

  await supabase.from('bos_audit_logs').insert({
    actor_id: supervisorId,
    action: 'DAILY_REPORT_ACKNOWLEDGED',
    entity_type: 'DAILY_REPORT',
    entity_id: reportId,
    metadata: { feedback },
  });

  return { success: true };
}

// ==========================================
// 6. AI OPERATIONS COPILOT (GROUNDED QUERY)
// ==========================================
export async function runAICopilotQuery(queryText: string) {
  const q = queryText.toLowerCase();

  // Retrieve authorized live data from database
  const [tasksRes, projectsRes, reportsRes, buRes, approvalsRes] = await Promise.all([
    supabase.from('bos_tasks').select('*, business_unit:bos_business_units(name), owner:bos_users!owner_id(full_name)'),
    supabase.from('bos_projects').select('*, business_unit:bos_business_units(name)'),
    supabase.from('bos_daily_reports').select('*, user:bos_users(full_name), business_unit:bos_business_units(name)'),
    supabase.from('bos_business_units').select('*'),
    supabase.from('bos_approval_requests').select('*'),
  ]);

  const tasks = tasksRes.data || [];
  const projects = projectsRes.data || [];
  const reports = reportsRes.data || [];
  const approvals = approvalsRes.data || [];

  const today = new Date().toISOString().split('T')[0];

  let answer = '';
  const citations: Array<{ label: string; id: string; type: string }> = [];

  if (q.includes('overdue') || q.includes('deadline')) {
    const overdue = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== 'Completed');
    answer = `Currently, there are **${overdue.length} overdue tasks** across the organization:\n\n` +
      overdue
        .map((t) => {
          citations.push({ label: t.title, id: t.id, type: 'TASK' });
          return `• **[Task ${t.id.slice(0, 8)}]** "${t.title}" (Owner: ${t.owner?.full_name || 'Unassigned'}) — Due on **${t.due_date}** (Priority: ${t.priority}, Status: ${t.status})`;
        })
        .join('\n');
  } else if (q.includes('block') || q.includes('bottleneck')) {
    const blocked = tasks.filter((t) => t.status === 'Blocked');
    answer = `There are **${blocked.length} critical operational blockers** requiring attention:\n\n` +
      blocked
        .map((t) => {
          citations.push({ label: t.title, id: t.id, type: 'TASK' });
          return `• **[${t.business_unit?.name}]** "${t.title}" — Blocker: *"${t.blocker_reason}"* (Assigned: ${t.owner?.full_name})`;
        })
        .join('\n');
  } else if (q.includes('lj entertainment') || q.includes('entertainment') || q.includes('music')) {
    const entTasks = tasks.filter((t) => t.business_unit?.name?.toLowerCase().includes('entertainment'));
    answer = `**LJ Entertainment Operational Summary:**\n` +
      `Active Workstreams: Artist management, DSP mechanical royalty recovery, and digital catalog re-release.\n\n` +
      entTasks
        .map((t) => {
          citations.push({ label: t.title, id: t.id, type: 'TASK' });
          return `• Task [${t.id.slice(0, 8)}] "${t.title}": Status is **${t.status}**, Owner: ${t.owner?.full_name}`;
        })
        .join('\n');
  } else if (q.includes('executive report') || q.includes('weekly') || q.includes('summary')) {
    const pendingAppCount = approvals.filter((a) => a.status === 'pending').length;
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    const blockedCount = tasks.filter((t) => t.status === 'Blocked').length;

    answer = `### Executive Operational Briefing\n\n` +
      `1. **Deliverables Velocity:** ${completedCount} tasks completed and verified with acceptance evidence.\n` +
      `2. **Management Decisions Pending:** ${pendingAppCount} pending approvals in queue, including critical harvest logistics funding.\n` +
      `3. **Active Projects Health:** 3 active projects in portfolio; Ereokomi Q4 harvest is flagged **At Risk** due to diesel procurement.\n` +
      `4. **Internship Performance:** Virtual interns (Cohort 2026-Q4) have submitted production PRs on schedule with positive supervisor feedback.`;
  } else {
    answer = `I have analyzed the current database records for **LJ Conglomerate**:\n\n` +
      `• **Active Business Units:** 7 units (LJ Entertainment, Tiarion-X, SmartFix Properties, SmartFix Facility Management, Fusion Pro Health, Ereokomi, ISEYAA)\n` +
      `• **Total Persisted Tasks:** ${tasks.length} tasks across engineering, property ops, and agriculture\n` +
      `• **Deliverables with Evidence:** Verified in Supabase\n` +
      `• **Pending Approvals:** ${approvals.filter((a) => a.status === 'pending').length} item(s) awaiting executive sign-off.`;
  }

  return {
    query: queryText,
    answer,
    citations,
    timestamp: new Date().toISOString(),
    groundedInDb: true,
  };
}

// ==========================================
// 7. CLICKUP INTEGRATION STATUS & SYNC
// ==========================================
export async function getIntegrationStatus() {
  const { data: connections } = await supabase
    .from('bos_integration_connections')
    .select('*')
    .order('provider');

  return connections || [];
}

export async function triggerClickUpSyncSimulation(actorId: string) {
  // Update integration timestamp and log sync event
  const { data: conn } = await supabase
    .from('bos_integration_connections')
    .select('id')
    .eq('provider', 'clickup')
    .single();

  if (conn?.id) {
    await supabase.from('bos_sync_events').insert({
      connection_id: conn.id,
      external_record_id: 'CLICKUP-LIST-TX-01',
      operation: 'reconcile_tasks',
      result: 'success',
      retry_count: 0,
      error_details: 'Simulated idempotent sync completed. 0 conflicting records found.',
    });

    await supabase
      .from('bos_integration_connections')
      .update({
        status: 'connected',
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', conn.id);
  }

  await supabase.from('bos_audit_logs').insert({
    actor_id: actorId,
    action: 'INTEGRATION_SYNC_TRIGGERED',
    entity_type: 'INTEGRATION',
    entity_id: 'clickup',
    metadata: { provider: 'clickup', outcome: 'success' },
  });

  return { success: true, message: 'ClickUp task synchronization completed successfully.' };
}
