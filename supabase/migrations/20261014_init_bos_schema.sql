-- =========================================================================
-- LJ Business Operating System (LJ BOS) - Database Schema Migration
-- Migration: 20261014_init_bos_schema.sql
-- Scoped for Multi-Tenant Conglomerate Workforce & Project Management
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organisations
CREATE TABLE IF NOT EXISTS bos_organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  timezone TEXT DEFAULT 'Africa/Lagos',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Business Units (Configurable by admin)
CREATE TABLE IF NOT EXISTS bos_business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES bos_organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  lead_user_id UUID,
  color TEXT DEFAULT '#1E3A8A',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Departments
CREATE TABLE IF NOT EXISTS bos_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Users (Personas with RBAC)
CREATE TABLE IF NOT EXISTS bos_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Memberships
CREATE TABLE IF NOT EXISTS bos_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES bos_organisations(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Staff Profiles & Virtual Intern Cohorts
CREATE TABLE IF NOT EXISTS bos_staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES bos_users(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL DEFAULT 'employee',
  supervisor_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  department TEXT,
  title TEXT,
  skills TEXT[] DEFAULT '{}',
  responsibilities TEXT,
  onboarding_status TEXT DEFAULT 'in_progress',
  onboarding_checklist JSONB DEFAULT '[]'::jsonb,
  intern_cohort TEXT,
  learning_goals JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Projects
CREATE TABLE IF NOT EXISTS bos_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  objectives TEXT,
  manager_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  health_score INT DEFAULT 100,
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Project Members
CREATE TABLE IF NOT EXISTS bos_project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES bos_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  project_role TEXT DEFAULT 'contributor',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Milestones
CREATE TABLE IF NOT EXISTS bos_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES bos_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tasks
CREATE TABLE IF NOT EXISTS bos_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES bos_projects(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES bos_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Backlog',
  acceptance_criteria TEXT,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2),
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  blocker_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Task Dependencies
CREATE TABLE IF NOT EXISTS bos_task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_id UUID REFERENCES bos_tasks(id) ON DELETE CASCADE,
  dependent_id UUID REFERENCES bos_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Task Updates
CREATE TABLE IF NOT EXISTS bos_task_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES bos_tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  previous_status TEXT,
  new_status TEXT,
  update_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Deliverables & Evidence Attachments
CREATE TABLE IF NOT EXISTS bos_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES bos_tasks(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  title TEXT NOT NULL,
  submission_notes TEXT,
  file_url TEXT,
  external_link TEXT,
  evidence_type TEXT DEFAULT 'link',
  submitted_by UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  review_status TEXT DEFAULT 'pending',
  reviewer_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

-- 14. Daily Standup & EOD Reports
CREATE TABLE IF NOT EXISTS bos_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  planned_priorities TEXT NOT NULL,
  expected_outcomes TEXT,
  tasks_worked JSONB DEFAULT '[]'::jsonb,
  work_completed TEXT NOT NULL,
  blockers TEXT,
  support_required TEXT,
  next_actions TEXT,
  supervisor_ack BOOLEAN DEFAULT false,
  supervisor_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- 15. Weekly Reports
CREATE TABLE IF NOT EXISTS bos_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  planned_outcomes TEXT,
  completed_deliverables TEXT NOT NULL,
  missed_commitments TEXT,
  reasons_for_delays TEXT,
  lessons_learned TEXT,
  current_risks TEXT,
  next_week_objectives TEXT NOT NULL,
  review_status TEXT DEFAULT 'submitted',
  supervisor_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- 16. Goals
CREATE TABLE IF NOT EXISTS bos_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES bos_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  measurable_target TEXT,
  progress_percent INT DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  timeframe TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Reviews
CREATE TABLE IF NOT EXISTS bos_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  period TEXT NOT NULL,
  on_time_rate NUMERIC(5,2),
  quality_score NUMERIC(3,1),
  criteria_feedback JSONB DEFAULT '{}'::jsonb,
  manager_feedback TEXT NOT NULL,
  employee_response TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS bos_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Approval Requests (Executive Queue)
CREATE TABLE IF NOT EXISTS bos_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  details TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  requester_id UUID REFERENCES bos_users(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Integration Connections (ClickUp, Email, WhatsApp)
CREATE TABLE IF NOT EXISTS bos_integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'unconfigured',
  config JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Integration Sync Events
CREATE TABLE IF NOT EXISTS bos_sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES bos_integration_connections(id) ON DELETE CASCADE,
  external_record_id TEXT,
  operation TEXT NOT NULL,
  result TEXT NOT NULL,
  retry_count INT DEFAULT 0,
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. Audit Logs
CREATE TABLE IF NOT EXISTS bos_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_bos_tasks_project ON bos_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_bos_tasks_bu ON bos_tasks(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_bos_tasks_owner ON bos_tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_bos_tasks_status ON bos_tasks(status);
CREATE INDEX IF NOT EXISTS idx_bos_deliverables_task ON bos_deliverables(task_id);
CREATE INDEX IF NOT EXISTS idx_bos_daily_reports_user_date ON bos_daily_reports(user_id, report_date);
CREATE INDEX IF NOT EXISTS idx_bos_approvals_status ON bos_approval_requests(status);
