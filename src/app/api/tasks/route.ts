import { NextRequest, NextResponse } from 'next/server';
import { getTasks, updateTaskStatus } from '@/lib/services';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = searchParams.get('businessUnitId') || undefined;
    const status = searchParams.get('status') || undefined;
    const ownerId = searchParams.get('ownerId') || undefined;

    const tasks = await getTasks({ businessUnitId, status, ownerId });
    return NextResponse.json(tasks);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, newStatus, actorId, blockerReason } = body;

    if (!taskId || !newStatus) {
      return NextResponse.json({ error: 'taskId and newStatus are required' }, { status: 400 });
    }

    const res = await updateTaskStatus(taskId, newStatus, actorId || 'system', blockerReason);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, businessUnitId, title, description, ownerId, reviewerId, priority, dueDate, acceptanceCriteria } = body;

    const { data, error } = await supabase.from('bos_tasks').insert({
      project_id: projectId,
      business_unit_id: businessUnitId,
      title,
      description,
      owner_id: ownerId,
      reviewer_id: reviewerId,
      priority: priority || 'Medium',
      due_date: dueDate,
      acceptance_criteria: acceptanceCriteria,
      status: 'Ready',
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
