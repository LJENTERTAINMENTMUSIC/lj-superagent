import { NextRequest, NextResponse } from 'next/server';
import { submitDailyReport, acknowledgeDailyReport } from '@/lib/services';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bos_daily_reports')
      .select(`
        *,
        user:bos_users(full_name, email, role),
        business_unit:bos_business_units(name, code)
      `)
      .order('report_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reports';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await submitDailyReport(body);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit daily report';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, feedback, supervisorId } = body;
    const res = await acknowledgeDailyReport(reportId, feedback || '', supervisorId || 'system');
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to acknowledge daily report';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
