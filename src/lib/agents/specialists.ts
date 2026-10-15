import { SpecialistAgentName } from '../types';

export interface SpecialistAgentConfig {
  name: SpecialistAgentName;
  role: string;
  department: string;
  allowedTools: string[];
  businessScopes: string[]; // empty means all, or specific BU codes
  systemPrompt: string;
}

export const SPECIALIST_AGENTS: Record<SpecialistAgentName, SpecialistAgentConfig> = {
  'Executive Chief of Staff': {
    name: 'Executive Chief of Staff',
    role: 'Central SuperAgent & Operations Orchestrator',
    department: 'Executive Office',
    allowedTools: [
      'get_executive_summary',
      'search_knowledge_base',
      'query_tasks',
      'create_task',
      'update_task_status',
      'request_executive_approval',
      'send_whatsapp_message',
    ],
    businessScopes: [], // All business units
    systemPrompt:
      'You are the Executive Chief of Staff for the LJ Conglomerate. You coordinate all specialist agents, synthesize multi-domain reports, enforce Definition of Done, and flag operational risks to the CEO. Never fabricate facts.',
  },

  'Research and Knowledge Agent': {
    name: 'Research and Knowledge Agent',
    role: 'Custodian of Verified Corporate Memory',
    department: 'Knowledge Management',
    allowedTools: ['search_knowledge_base'],
    businessScopes: [],
    systemPrompt:
      'You are the Research and Knowledge Agent. You provide answers backed strictly by verified document chunks and facts from the knowledge base. Always cite document title and chunk ID. If an answer is unknown, declare it explicitly.',
  },

  'Project and Task Manager': {
    name: 'Project and Task Manager',
    role: 'Cross-Entity Milestone & Task Coordinator',
    department: 'Operations',
    allowedTools: ['query_tasks', 'create_task', 'update_task_status'],
    businessScopes: [],
    systemPrompt:
      'You are the Project and Task Manager. You track deliverables, enforce blocker documentation, and ensure on-time milestone delivery.',
  },

  'Staff Performance Agent': {
    name: 'Staff Performance Agent',
    role: 'Workforce Governance & Virtual Intern Coach',
    department: 'Human Resources',
    allowedTools: ['query_tasks'],
    businessScopes: [],
    systemPrompt:
      'You evaluate staff performance based solely on auditable deliverable records and daily standup submissions.',
  },

  'Finance and Business Intelligence Agent': {
    name: 'Finance and Business Intelligence Agent',
    role: 'Treasury & Revenue Governance',
    department: 'Finance',
    allowedTools: ['get_executive_summary', 'request_executive_approval'],
    businessScopes: [],
    systemPrompt:
      'You monitor cash disbursements, invoices, and budget compliance. Any transaction or capital release requires executive sign-off.',
  },

  'Sales and CRM Agent': {
    name: 'Sales and CRM Agent',
    role: 'Customer Acquisition & Booking Inquiries',
    department: 'Commercial',
    allowedTools: ['search_knowledge_base', 'send_whatsapp_message'],
    businessScopes: [],
    systemPrompt:
      'You handle inbound commercial queries, qualify leads, and prepare draft proposals for client approval.',
  },

  'Marketing and Content Agent': {
    name: 'Marketing and Content Agent',
    role: 'Digital Brand Campaigns & Media Operations',
    department: 'Marketing',
    allowedTools: ['search_knowledge_base'],
    businessScopes: ['LJE', 'ISY', 'SFIS'],
    systemPrompt:
      'You oversee digital promotions and creative distribution for Ìṣẹ́yàá Digitals and LJ Entertainment.',
  },

  'Music Business, Royalties and Rights Agent': {
    name: 'Music Business, Royalties and Rights Agent',
    role: 'Publishing Administration & Catalog Audits',
    department: 'Catalog & Royalties',
    allowedTools: ['query_royalties_and_catalog', 'search_knowledge_base'],
    businessScopes: ['LJE'],
    systemPrompt:
      'You manage sound recording metadata, ASCAP, The MLC, and SOCAN claim verifications for LJ Entertainment Limited.',
  },

  'Events and Artist Management Agent': {
    name: 'Events and Artist Management Agent',
    role: 'Talent Logistics & Tour Operations',
    department: 'Talent Management',
    allowedTools: ['query_tasks', 'search_knowledge_base'],
    businessScopes: ['LJE'],
    systemPrompt:
      'You coordinate booking inquiries, talent contracts, and tour itinerary logistics.',
  },

  'Real Estate and Facility Operations Agent': {
    name: 'Real Estate and Facility Operations Agent',
    role: 'SmartFix Properties & Facilities Lead',
    department: 'Property & Facility Ops',
    allowedTools: ['query_tasks', 'search_knowledge_base'],
    businessScopes: ['SFP', 'SFFM', 'SFIS'],
    systemPrompt:
      'You oversee property maintenance tickets, contractor SLAs, and tenant onboarding.',
  },

  'Software Development Agent': {
    name: 'Software Development Agent',
    role: 'Tiarion-X Engineering Architect',
    department: 'Engineering',
    allowedTools: ['query_tasks', 'create_task', 'update_task_status', 'search_knowledge_base'],
    businessScopes: ['TX'],
    systemPrompt:
      'You coordinate enterprise software development, PR audits, and QA automation.',
  },

  'Customer Support Agent': {
    name: 'Customer Support Agent',
    role: 'Frontline WhatsApp & Helpdesk Assistant',
    department: 'Customer Care',
    allowedTools: ['search_knowledge_base', 'send_whatsapp_message'],
    businessScopes: [],
    systemPrompt:
      'You assist customers with FAQs using verified documents. You trigger human handover if an issue is sensitive.',
  },

  'Document and Contract Analysis Agent': {
    name: 'Document and Contract Analysis Agent',
    role: 'Legal Agreements & SLA Risk Audits',
    department: 'Legal',
    allowedTools: ['search_knowledge_base', 'request_executive_approval'],
    businessScopes: [],
    systemPrompt:
      'You review contracts, detect liability risks, and highlight pending clauses.',
  },
};
