export type Role =
  | 'super_admin'
  | 'ceo'
  | 'bu_head'
  | 'project_manager'
  | 'team_lead'
  | 'hr_coordinator'
  | 'staff'
  | 'intern'
  | 'contractor'
  | 'external_reviewer';

export type EngagementType = 'employee' | 'intern' | 'contractor' | 'temporary';

export type TaskStatus =
  | 'Backlog'
  | 'Ready'
  | 'In Progress'
  | 'Blocked'
  | 'In Review'
  | 'Changes Requested'
  | 'Completed'
  | 'Cancelled';

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: string;
  role: Role;
  staff_profile?: StaffProfile;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  engagement_type: EngagementType;
  supervisor_id?: string;
  supervisor?: { full_name: string; email: string };
  title: string;
  department: string;
  skills: string[];
  responsibilities?: string;
  onboarding_status: string;
  intern_cohort?: string;
  learning_goals: Array<{ goal: string; target: string; status: string }>;
  start_date?: string;
  end_date?: string;
}

export interface Project {
  id: string;
  business_unit_id: string;
  business_unit?: BusinessUnit;
  name: string;
  code: string;
  description: string;
  objectives: string;
  manager_id?: string;
  manager?: { full_name: string; email: string };
  status: 'Planning' | 'Active' | 'At Risk' | 'On Hold' | 'Completed' | 'Archived';
  health_score: number;
  start_date?: string;
  target_date?: string;
  completed_at?: string;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Task {
  id: string;
  project_id: string;
  project?: { name: string; code: string };
  business_unit_id: string;
  business_unit?: { name: string; code: string; color: string };
  title: string;
  description?: string;
  owner_id?: string;
  owner?: { id: string; full_name: string; email: string; role: Role };
  reviewer_id?: string;
  reviewer?: { id: string; full_name: string; email: string };
  priority: TaskPriority;
  status: TaskStatus;
  acceptance_criteria?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  completed_at?: string;
  blocker_reason?: string;
  deliverables?: Deliverable[];
  created_at: string;
}

export interface Deliverable {
  id: string;
  task_id: string;
  version: number;
  title: string;
  submission_notes?: string;
  file_url?: string;
  external_link?: string;
  evidence_type: 'link' | 'document' | 'code' | 'report' | 'image';
  submitted_by?: string;
  submitter?: { full_name: string };
  submitted_at: string;
  review_status: 'pending' | 'approved' | 'changes_requested';
  reviewer_id?: string;
  reviewer?: { full_name: string };
  reviewed_at?: string;
  review_notes?: string;
}

export interface DailyReport {
  id: string;
  user_id: string;
  user?: { full_name: string; email: string; role: Role };
  business_unit_id: string;
  business_unit?: { name: string; code: string };
  report_date: string;
  planned_priorities: string;
  expected_outcomes?: string;
  work_completed: string;
  blockers?: string;
  support_required?: string;
  next_actions?: string;
  supervisor_ack: boolean;
  supervisor_feedback?: string;
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  user?: { full_name: string; email: string };
  business_unit_id: string;
  business_unit?: { name: string; code: string };
  period_start: string;
  period_end: string;
  planned_outcomes?: string;
  completed_deliverables: string;
  missed_commitments?: string;
  reasons_for_delays?: string;
  lessons_learned?: string;
  current_risks?: string;
  next_week_objectives: string;
  review_status: string;
  supervisor_feedback?: string;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  subject: string;
  details?: string;
  entity_type: 'deliverable' | 'task' | 'leave' | 'strategic';
  entity_id?: string;
  requester_id: string;
  requester?: { full_name: string; email: string };
  approver_id?: string;
  approver?: { full_name: string };
  status: 'pending' | 'approved' | 'rejected';
  decision_notes?: string;
  decided_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface IntegrationConnection {
  id: string;
  provider: string;
  status: 'connected' | 'unconfigured' | 'error' | 'disconnected';
  config: Record<string, unknown>;
  last_sync_at?: string;
  last_error?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor?: { full_name: string };
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
