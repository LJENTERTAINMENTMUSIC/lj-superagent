'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { TaskBoard } from '@/components/TaskBoard';
import { CheckSquare, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Task, User } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPersona, setCurrentPersona] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/executive-overview'),
      ]);
      const tasksData = await tasksRes.json();
      const overviewData = await usersRes.json();

      setTasks(tasksData);
      setUsers(overviewData.users || []);
      if (!currentPersona && overviewData.users?.length > 0) {
        setCurrentPersona(overviewData.users[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentPersona={currentPersona}
        onPersonaChange={(u) => setCurrentPersona(u)}
        availableUsers={users}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <CheckSquare className="h-4 w-4" />
              <span>Project Execution & Accountability Register</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Tasks, Submissions & Deliverables
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforced Definition of Done: Tasks cannot be completed without verified deliverable acceptance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded bg-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            Loading tasks and deliverable history...
          </div>
        ) : (
          <TaskBoard
            tasks={tasks}
            currentUser={currentPersona || users[0]}
            onRefresh={fetchTasks}
          />
        )}
      </main>
    </div>
  );
}
