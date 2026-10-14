'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  FileText,
  FileCheck2,
  Bot,
  RefreshCw,
  Building2,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { User } from '@/lib/types';

interface NavigationProps {
  currentPersona?: User | null;
  onPersonaChange?: (user: User) => void;
  availableUsers?: User[];
}

export function Navigation({
  currentPersona,
  onPersonaChange,
  availableUsers = [],
}: NavigationProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Default persona list if none passed
  const activeUser = currentPersona || availableUsers[0] || {
    id: 'ceo-default',
    full_name: 'LJ Executive Director',
    email: 'ceo@ljgroup.com',
    role: 'ceo',
    status: 'active',
  };

  const navLinks = [
    { href: '/', label: 'CEO Command', icon: Building2 },
    { href: '/app/portfolio', label: 'Business Units', icon: Briefcase },
    { href: '/app/tasks', label: 'Tasks & Deliverables', icon: CheckSquare },
    { href: '/app/people', label: 'Workforce & Interns', icon: Users },
    { href: '/app/reports', label: 'Daily & Weekly Reports', icon: FileText },
    { href: '/app/approvals', label: 'Approvals Queue', icon: FileCheck2 },
    { href: '/app/ai-assistant', label: 'AI Copilot', icon: Bot },
    { href: '/app/integrations', label: 'Integrations', icon: RefreshCw },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B] border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-xl tracking-wider shadow">
              LJ
            </div>
            <div>
              <div className="font-bold tracking-tight text-lg text-slate-100 flex items-center gap-2">
                LJ Business OS
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                  v1.0 Hybrid
                </span>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">
                Conglomerate Operations & Virtual Internship Management
              </div>
            </div>
          </div>

          {/* Persona Switcher (For live testing and role evaluation) */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition"
              >
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-[11px]">
                  {activeUser.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-medium text-slate-200">{activeUser.full_name}</div>
                  <div className="text-[10px] text-amber-400 uppercase tracking-wide">
                    {activeUser.role?.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-slate-400 font-semibold border-b border-slate-800">
                    Switch Active Persona (RBAC Simulation)
                  </div>
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onPersonaChange?.(u);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                        u.id === activeUser.id ? 'bg-slate-800/60 text-amber-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{u.full_name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
