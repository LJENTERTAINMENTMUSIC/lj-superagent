-- =========================================================================
-- LJ SuperAgent - Autonomous Business Operating System
-- Migration: 20261015_superagent_expansion.sql
-- Knowledge Management, Vector Search, WhatsApp Cloud API, Agent Runs
-- =========================================================================

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Knowledge Base Documents
CREATE TABLE IF NOT EXISTS bos_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES bos_organisations(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  department TEXT,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  storage_path TEXT,
  content_text TEXT,
  doc_status TEXT DEFAULT 'active',
  verification_status TEXT DEFAULT 'verified',
  author TEXT,
  confidence_score NUMERIC(4,3) DEFAULT 1.000,
  verified_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Knowledge Base Document Chunks with Vector Embeddings
CREATE TABLE IF NOT EXISTS bos_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES bos_documents(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  token_count INT DEFAULT 0,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Structured Knowledge Registry (Facts, Assumptions, Decisions)
CREATE TABLE IF NOT EXISTS bos_knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('fact', 'assumption', 'proposed_decision', 'verified_decision')),
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  source_document_id UUID REFERENCES bos_documents(id) ON DELETE SET NULL,
  confidence NUMERIC(4,3) DEFAULT 1.000,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_verification', 'disputed')),
  verified_by UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  review_due_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Knowledge Gaps Tracker
CREATE TABLE IF NOT EXISTS bos_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  requested_by TEXT DEFAULT 'SuperAgent System',
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. WhatsApp Conversations
CREATE TABLE IF NOT EXISTS bos_whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'customer_service' CHECK (channel IN ('executive_command', 'customer_service')),
  active_agent TEXT DEFAULT 'SuperAgent',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'handed_over')),
  handover_reason TEXT,
  opt_in_status BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. WhatsApp Messages
CREATE TABLE IF NOT EXISTS bos_whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES bos_whatsapp_conversations(id) ON DELETE CASCADE,
  wamid TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_phone TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  transcription TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  business_unit_id UUID REFERENCES bos_business_units(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WhatsApp Approved Templates
CREATE TABLE IF NOT EXISTS bos_whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'APPROVED',
  components JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Failed Message Retry Queue
CREATE TABLE IF NOT EXISTS bos_failed_message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES bos_whatsapp_messages(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  payload JSONB NOT NULL,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 5,
  next_retry_at TIMESTAMPTZ DEFAULT now(),
  last_error TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'dead_letter')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Agent Execution Runs
CREATE TABLE IF NOT EXISTS bos_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  structured_context JSONB DEFAULT '{}'::jsonb,
  final_response TEXT,
  total_tokens INT DEFAULT 0,
  execution_time_ms INT DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'blocked_for_approval')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Agent Tool Invocations
CREATE TABLE IF NOT EXISTS bos_agent_tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES bos_agent_runs(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  risk_tier TEXT NOT NULL DEFAULT 'read_only' CHECK (risk_tier IN ('read_only', 'reversible_internal', 'external_communication', 'high_impact')),
  approval_status TEXT NOT NULL DEFAULT 'auto_approved' CHECK (approval_status IN ('auto_approved', 'pending_approval', 'approved', 'rejected')),
  approved_by UUID REFERENCES bos_users(id) ON DELETE SET NULL,
  execution_status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Agent Long-Term Memory
CREATE TABLE IF NOT EXISTS bos_agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  confidence NUMERIC(4,3) DEFAULT 1.000,
  user_consented BOOLEAN DEFAULT true,
  ttl_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Vector Search and High Concurrency
CREATE INDEX IF NOT EXISTS idx_bos_chunks_doc ON bos_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_bos_chunks_bu ON bos_document_chunks(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_bos_wa_msgs_wamid ON bos_whatsapp_messages(wamid);
CREATE INDEX IF NOT EXISTS idx_bos_wa_msgs_conv ON bos_whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bos_tool_calls_run ON bos_agent_tool_calls(run_id);
CREATE INDEX IF NOT EXISTS idx_bos_tool_calls_tier ON bos_agent_tool_calls(risk_tier);
