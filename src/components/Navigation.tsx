'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Briefcase,
  CheckSquare,
  Users,
  FileText,
  FileCheck2,
  Bot,
  RefreshCw,
  MessageSquare,
  BookOpen,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { User, BusinessUnit } from '@/lib/types';

interface NavigationProps {
  currentPersona?: User | null;
  onPersonaChange?: (user: User) => void;
  availableUsers?: User[];
  selectedBuId?: string;
  onSelectBu?: (buId: string) => void;
  businessUnits?: BusinessUnit[];
}

export function Navigation({
  currentPersona,
  onPersonaChange,
  availableUsers = [],
  selectedBuId = 'all',
  onSelectBu,
  businessUnits = [],
}: NavigationProps) {
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [buDropdownOpen, setBuDropdownOpen] = useState(false);

  const activeUser = currentPersona || availableUsers[0] || {
    id: '836b7147-c063-42ac-ab89-dcf6ed0bc890',
    full_name: 'LJ Executive Director',
    email: 'ceo@ljgroup.com',
    role: 'ceo',
    status: 'active',
  };

  const selectedBu = businessUnits.find((b) => b.id === selectedBuId);

  const navLinks = [
    { href: '/', label: 'Executive Overview', icon: Building2 },
    { href: '/app/whatsapp', label: 'WhatsApp Command', icon: MessageSquare, badge: 'Live API' },
    { href: '/app/agents', label: 'AI Agent Swarm', icon: Bot, badge: '13 Agents' },
    { href: '/app/knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'pgvector' },
    { href: '/app/portfolio', label: 'Workspaces', icon: Briefcase },
    { href: '/app/tasks', label: 'Tasks & Evidence', icon: CheckSquare },
    { href: '/app/people', label: 'Workforce', icon: Users },
    { href: '/app/reports', label: 'Daily Reports', icon: FileText },
    { href: '/app/approvals', label: 'Approvals Queue', icon: FileCheck2 },
    { href: '/app/integrations', label: 'Integrations', icon: RefreshCw },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070F22] border-b border-[#182C48] text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#8C6D1F] flex items-center justify-center font-black text-[#070F22] text-xl shadow-lg ring-1 ring-[#D4AF37]/50">
                LJ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-lg text-white">
                    LJ <span className="text-[#D4AF37]">SuperAgent</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#F5D061] border border-[#D4AF37]/40 uppercase font-bold tracking-wider">
                    BOS v2.0
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Autonomous Multi-Tenant Business Operating System
                </div>
              </div>
            </Link>
          </div>

          {/* Business Unit & Persona Switchers */}
          <div className="flex items-center space-x-3">
            {/* Business Unit Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setBuDropdownOpen(!buDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center space-x-2 bg-[#0C1B33] hover:bg-[#122442] border border-[#1E3A5F] px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition"
                title="Filter by Business Workspace"
              >
                <Layers className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span className="max-w-[130px] truncate">
                  {selectedBu ? selectedBu.name : 'All Workspaces (8)'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {buDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0B1728] border border-[#1E385B] rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-slate-400 font-bold border-b border-[#182C48] uppercase tracking-wider text-[10px]">
                    Select Business Workspace
                  </div>
                  <button
                    onClick={() => {
                      onSelectBu?.('all');
                      setBuDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#132238] flex items-center justify-between ${
                      selectedBuId === 'all' ? 'bg-[#142642] text-[#D4AF37] font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>All Business Entities (Consolidated)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">8 Units</span>
                  </button>
                  {businessUnits.map((bu) => (
                    <button
                      key={bu.id}
                      onClick={() => {
                        onSelectBu?.(bu.id);
                        setBuDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#132238] flex items-center justify-between ${
                        selectedBuId === bu.id ? 'bg-[#142642] text-[#D4AF37] font-bold' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{bu.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{bu.code} · Verified</div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setBuDropdownOpen(false);
                }}
                className="flex items-center space-x-2 bg-[#0C1B33] hover:bg-[#122442] border border-[#1E3A5F] px-3 py-1.5 rounded-lg text-xs transition"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-[#070F22] font-black flex items-center justify-center text-[11px] shadow">
                  {activeUser.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-200 text-xs">{activeUser.full_name}</div>
                  <div className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider">
                    {activeUser.role?.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0B1728] border border-[#1E385B] rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-slate-400 font-bold border-b border-[#182C48] uppercase tracking-wider text-[10px]">
                    Switch Active User (RBAC Simulation)
                  </div>
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onPersonaChange?.(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-[#132238] flex items-center justify-between ${
                        u.id === activeUser.id ? 'bg-[#142642] text-[#D4AF37] font-bold' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.full_name}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#182C48] text-slate-300">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Menu */}
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 border-t border-[#162740] no-scrollbar">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#F5D061] border border-[#D4AF37]/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#0D1C33]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive ? 'bg-[#D4AF37]/30 text-[#FFF0B3]' : 'bg-[#162740] text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
