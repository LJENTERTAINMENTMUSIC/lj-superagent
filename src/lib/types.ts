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

export type VerificationStatus = 'verified' | 'pending_verification' | 'unverified' | 'disputed';

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
  verification_status?: VerificationStatus;
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
  entity_type: 'deliverable' | 'task' | 'leave' | 'strategic' | 'agent_tool_action';
  entity_id?: string;
  requester_id?: string;
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

// ==========================================
// KNOWLEDGE MANAGEMENT TYPES
// ==========================================

export interface KnowledgeDocument {
  id: string;
  organisation_id?: string;
  business_unit_id?: string;
  business_unit?: { name: string; code: string };
  department?: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path?: string;
  content_text?: string;
  doc_status: 'active' | 'archived' | 'deprecated';
  verification_status: VerificationStatus;
  author?: string;
  confidence_score: number;
  verified_at?: string;
  last_reviewed_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  chunks_count?: number;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  document_title?: string;
  business_unit_id?: string;
  chunk_index: number;
  content: string;
  token_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  similarity?: number;
}

export interface KnowledgeItem {
  id: string;
  business_unit_id?: string;
  business_unit?: { name: string; code: string };
  item_type: 'fact' | 'assumption' | 'proposed_decision' | 'verified_decision';
  title: string;
  statement: string;
  source_document_id?: string;
  source_document?: { title: string; file_name: string };
  confidence: number;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  review_due_date?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface KnowledgeGap {
  id: string;
  business_unit_id?: string;
  business_unit?: { name: string; code: string };
  topic: string;
  description: string;
  requested_by: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'open' | 'in_progress' | 'resolved';
  resolved_at?: string;
  created_at: string;
}

// ==========================================
// WHATSAPP CLOUD API TYPES
// ==========================================

export type WhatsAppMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'voice'
  | 'template'
  | 'interactive';

export type WhatsAppMessageDirection = 'inbound' | 'outbound';

export type WhatsAppMessageStatus =
  | 'received'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface WhatsAppConversation {
  id: string;
  customer_phone: string;
  customer_name?: string;
  business_unit_id?: string;
  business_unit?: { name: string; code: string };
  channel: 'executive_command' | 'customer_service';
  active_agent: string;
  status: 'open' | 'closed' | 'handed_over';
  handover_reason?: string;
  opt_in_status: boolean;
  last_message_at: string;
  created_at: string;
  recent_messages?: WhatsAppMessage[];
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  wamid?: string;
  direction: WhatsAppMessageDirection;
  sender_phone: string;
  recipient_phone: string;
  message_type: WhatsAppMessageType;
  content?: string;
  media_url?: string;
  transcription?: string;
  status: WhatsAppMessageStatus;
  error_message?: string;
  business_unit_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: Array<{ type: string; text?: string }>;
  created_at: string;
}

// ==========================================
// AGENT ORCHESTRATION & SAFETY TYPES
// ==========================================

export type ActionRiskTier =
  | 'read_only'
  | 'reversible_internal'
  | 'external_communication'
  | 'high_impact';

export type SpecialistAgentName =
  | 'Executive Chief of Staff'
  | 'Research and Knowledge Agent'
  | 'Project and Task Manager'
  | 'Staff Performance Agent'
  | 'Finance and Business Intelligence Agent'
  | 'Sales and CRM Agent'
  | 'Marketing and Content Agent'
  | 'Music Business, Royalties and Rights Agent'
  | 'Events and Artist Management Agent'
  | 'Real Estate and Facility Operations Agent'
  | 'Software Development Agent'
  | 'Customer Support Agent'
  | 'Document and Contract Analysis Agent';

export interface AgentRun {
  id: string;
  session_id: string;
  agent_name: string;
  prompt: string;
  structured_context?: Record<string, unknown>;
  final_response?: string;
  total_tokens?: number;
  execution_time_ms?: number;
  status: 'running' | 'completed' | 'failed' | 'blocked_for_approval';
  created_at: string;
  tool_calls?: AgentToolCall[];
}

export interface AgentToolCall {
  id: string;
  run_id: string;
  agent_name: string;
  tool_name: string;
  parameters: Record<string, unknown>;
  result?: Record<string, unknown>;
  risk_tier: ActionRiskTier;
  approval_status: 'auto_approved' | 'pending_approval' | 'approved' | 'rejected';
  approved_by?: string;
  execution_status: 'success' | 'failed' | 'blocked';
  created_at: string;
}

export interface AgentMemory {
  id: string;
  entity_type: string;
  entity_id: string;
  memory_key: string;
  memory_value: string;
  confidence: number;
  user_consented: boolean;
  ttl_expires_at?: string;
  created_at: string;
}
