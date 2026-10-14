import { NextRequest, NextResponse } from 'next/server';
import { decideApproval } from '@/lib/services';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bos_approval_requests')
      .select(`
        *,
        requester:bos_users!requester_id(full_name, email),
        approver:bos_users!approver_id(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch approvals';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { approvalId, decision, notes, actorId } = body;

    if (!approvalId || !decision) {
      return NextResponse.json({ error: 'approvalId and decision are required' }, { status: 400 });
    }

    const res = await decideApproval(approvalId, decision, notes || '', actorId || 'system');
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process approval';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
