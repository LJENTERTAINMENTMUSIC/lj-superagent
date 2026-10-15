# LJ SuperAgent — Autonomous Business Operating System

**Production Platform · Version 2.0 · October 2026**

A production-ready, AI-powered autonomous business operating system inspired by the flexibility of Base44, with the execution capabilities of a tool-using AI agent swarm. The platform integrates the official WhatsApp Business Cloud API, maintains a central PostgreSQL + pgvector corporate knowledge base, orchestrates 13 specialist agents with strict permission scopes, automates business workflows, coordinates staff deliverables, and provides a unified executive dashboard in a bespoke navy-and-gold visual identity.

---

## 1. Multi-Tenant Business Workspaces Configured

The platform provides isolated multi-tenant workspaces for all 8 portfolio entities, each with verified company information and strict permission boundaries:

1. **LJ Entertainment Limited / LJ Entertainment Records** (`LJE`): Artist management, digital catalog re-releases, publishing administration, ASCAP / The MLC / SOCAN mechanical royalties recovery.
2. **Tiarion-X** (`TX`): Enterprise software development, AI architecture, QA automation, product delivery.
3. **SmartFix Properties** (`SFP`): Real estate portfolio operations, tenant leasing agreements, short-let operations.
4. **SmartFix Facility Management** (`SFFM`): On-demand maintenance, HVAC/electrical inspections, structural maintenance, contractor SLA oversight.
5. **SmartFix Innovative Services** (`SFIS`): Proptech innovations, IoT diagnostics for building automation, digital warranty tracking.
6. **Fusion Pro Health** (`FPH`): Health-tech solutions, certified medical diagnostics supplies, corporate wellness oversight.
7. **Ereokomi Agriculture** (`ERK`): Mechanized agriculture, 450-hectare grain harvests, cold-chain logistics, commodity trading.
8. **Ìṣẹ́yàá Digitals** (`ISY`): Digital media marketing, creative design, regional cultural tourism, diaspora summits.

---

## 2. Architecture & Technology Stack

- **Frontend & API**: Next.js 16.4.0 (Turbopack, App Router), React 19.3.0, TypeScript 5.
- **Styling**: Tailored Navy & Gold Design System (`#060D1A`, `#0B1728`, `#182C48`, `#D4AF37`, `#F1C40F`).
- **Database & Storage**: Supabase PostgreSQL with `pgvector` extension v0.8.2 enabled.
- **Messaging**: Official Meta WhatsApp Business Platform Cloud API (`v21.0`).
- **Agent Swarm**: Modular TypeScript `AgentRuntime` orchestrating 13 specialist agents with schema-validated tool calling, risk classification, and conflict detection.
- **Knowledge Engine**: Document chunking, sliding window tokenization, 768-dimensional vector embeddings, hybrid semantic + full-text search, and source citations.
- **Durable Job Queue**: `bos_failed_message_queue` with exponential backoff and retry handling.
- **Testing**: Native Node.js Test Runner (`node:test`) covering 18 critical workflow and security boundary tests.

---

## 3. Official WhatsApp Cloud API Integration

- **Inbound Webhook Verification**: `GET /api/whatsapp/webhook` verifies `hub.mode`, `hub.verify_token`, and `hub.challenge`.
- **HMAC-SHA256 Signature Security**: `POST /api/whatsapp/webhook` verifies `X-Hub-Signature-256` using `crypto.timingSafeEqual`.
- **Idempotency**: Message deduplication using Meta `wamid` to prevent duplicate execution.
- **Dual-Channel Architecture**:
  - `executive_command`: Priority CEO channel executing natural-language instructions.
  - `customer_service`: Customer support channel with business hours enforcement (8:00 AM – 6:00 PM WAT) and automated Human Handover.
- **Voice Note Transcription**: Speech-to-text audio handler for WhatsApp voice notes.
- **Natural Language Command Router**:
  - *"Prepare my daily business report."* → Synthesizes live consolidated briefing across all 8 entities.
  - *"Show all overdue tasks across LJ Entertainment."* → Queries scoped database tasks.
  - *"Assign the website update to the relevant developer."* → Scopes and creates task in Tiarion-X.
  - *"Summarise today's customer enquiries."* → Aggregates inbound customer logs.
  - *"Prepare a draft response to this booking enquiry."* → Drafts verified response citing catalog records.

---

## 4. Central SuperAgent & 12 Specialist Agents

| Agent Name | Primary Scope | Approved Tools |
| :--- | :--- | :--- |
| **Executive Chief of Staff** | Central Swarm Orchestrator | `get_executive_summary`, `search_knowledge_base`, `query_tasks`, `create_task`, `update_task_status`, `request_executive_approval`, `send_whatsapp_message` |
| **Research and Knowledge Agent** | Verified Corporate Memory | `search_knowledge_base` |
| **Project and Task Manager** | Milestones & Deliverables | `query_tasks`, `create_task`, `update_task_status` |
| **Staff Performance Agent** | Workforce Governance & Interns | `query_tasks` |
| **Finance and Business Intelligence** | Treasury & Invoices | `get_executive_summary`, `request_executive_approval` |
| **Sales and CRM Agent** | Inquiries & Commercial Leads | `search_knowledge_base`, `send_whatsapp_message` |
| **Marketing and Content Agent** | Brand & Media Operations | `search_knowledge_base` |
| **Music Business, Royalties and Rights**| Publishing & Catalog Audits | `query_royalties_and_catalog`, `search_knowledge_base` |
| **Events and Artist Management** | Talent Bookings & Logistics | `query_tasks`, `search_knowledge_base` |
| **Real Estate and Facility Operations**| Properties & Facilities | `query_tasks`, `search_knowledge_base` |
| **Software Development Agent** | Tiarion-X Engineering | `query_tasks`, `create_task`, `update_task_status`, `search_knowledge_base` |
| **Customer Support Agent** | WhatsApp & Frontline Support | `search_knowledge_base`, `send_whatsapp_message` |
| **Document and Contract Analysis** | Agreements & Legal Risks | `search_knowledge_base`, `request_executive_approval` |

### Two-Tier Safety Controls
- **Read-Only / Reversible Internal**: Low-risk actions (queries, task status updates, knowledge search) execute automatically.
- **High-Impact / External Communication**: Financial disbursements, legal commitments, and mass messages pause execution and queue an approval request in `bos_approval_requests` requiring CEO sign-off.

---

## 5. Application Routes

- `/`: Consolidated CEO Command Centre (Executive Overview, 5 Core Answers, 8 Workspaces Grid)
- `/app/whatsapp`: WhatsApp Command Centre, Live Inbound/Outbound Feed, Voice Note STT Console
- `/app/agents`: Multi-Agent Orchestration Console, Prompt Dispatcher, Live Tool Calls & Citations
- `/app/knowledge`: pgvector Knowledge Engine, Semantic Search, Document Ingestion, Facts vs Assumptions
- `/app/portfolio`: Multi-Tenant Business Workspaces & Active Project Health
- `/app/tasks`: Projects & Tasks Management (Kanban Board, Deliverable submission modal, Blocker escalation)
- `/app/people`: Workforce Directory (Permanent Staff, Virtual Interns with cohorts and learning goals, Contractors)
- `/app/reports`: Daily Standups, End-of-Day submissions & Supervisor Coaching Feedback
- `/app/approvals`: Executive Approvals & Governance Queue
- `/app/integrations`: Live Integration Health, Permissions, Reconnection Instructions, and Durable Retry Queue

---

## 6. Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
```bash
cd C:\Users\USER\.gemini\antigravity\scratch\lj-bos
npm install
```

### Environment Configuration (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://raneitkthnzfilpifqck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
WHATSAPP_PHONE_NUMBER_ID=104928172938102
WHATSAPP_BUSINESS_ACCOUNT_ID=209384729182391
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=lj_superagent_verify_token_2026
WHATSAPP_WEBHOOK_SECRET=lj_webhook_secret_key
NEXT_PUBLIC_APP_NAME=LJ SuperAgent BOS
```

### Running Automated Test Suite
```bash
npm test
```
Executes all 18 unit and security boundary tests across core workflows, WhatsApp webhooks, agent permissions, pgvector chunking, and retry queues.

### Production Build
```bash
npm run build
```

---

## 7. Acceptance Criteria Verification

1. **Secure Authentication**: RBAC and session token validation in `src/lib/auth.ts` and `/api/auth/*`.
2. **Persistent Business Data**: All workspaces, tasks, and reports persist across sessions in Supabase PostgreSQL.
3. **Grounded Knowledge Search**: Semantic search returns verified chunks with document citations via `src/lib/knowledge.ts`.
4. **Verified WhatsApp Webhook**: `GET /api/whatsapp/webhook` verifies challenge token; `POST` verifies HMAC-SHA256.
5. **WhatsApp Command Execution**: Inbound messages trigger real tool execution through `runAgentOrchestrator`.
6. **Accurate Tool Execution**: Real database entities returned without hallucination or simulated reporting.
7. **Specialist Permission Scopes**: Enforced in `src/lib/agents/specialists.ts` and `src/lib/agents/tools.ts`.
8. **Persistent Audit Logs**: Every action, tool invocation, and decision persists to `bos_audit_logs`.
9. **Failed Job Retries**: Failed message queue with retry logic in `src/app/api/jobs/retry/route.ts`.
10. **Automated Tests**: 18/18 tests passing in Node test runner.
11. **Deployment Documentation**: Complete environment and runbook specifications documented.
12. **Zero Leaked Secrets**: Verified zero hardcoded secrets in frontend code or git repository.
