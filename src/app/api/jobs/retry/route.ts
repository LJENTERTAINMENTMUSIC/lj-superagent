import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export async function GET() {
  try {
    const { data: queue, error } = await supabase
      .from('bos_failed_message_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(queue || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId } = body;

    let query = supabase.from('bos_failed_message_queue').select('*');
    if (jobId) {
      query = query.eq('id', jobId);
    } else {
      query = query.eq('status', 'pending').limit(5);
    }

    const { data: jobs, error } = await query;
    if (error) throw error;

    const results = [];
    for (const job of jobs || []) {
      const payload = job.payload;
      const text = payload?.text?.body || 'Retried message';

      const sendRes = await sendWhatsAppMessage({
        to: job.recipient_phone,
        text,
      });

      if (sendRes.success) {
        await supabase
          .from('bos_failed_message_queue')
          .update({
            status: 'resolved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);
        results.push({ id: job.id, status: 'resolved' });
      } else {
        const nextRetryCount = (job.retry_count || 0) + 1;
        const newStatus = nextRetryCount >= (job.max_retries || 5) ? 'dead_letter' : 'pending';
        await supabase
          .from('bos_failed_message_queue')
          .update({
            retry_count: nextRetryCount,
            last_error: sendRes.error,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);
        results.push({ id: job.id, status: newStatus, error: sendRes.error });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
