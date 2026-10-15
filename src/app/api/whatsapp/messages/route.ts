import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, sendWhatsAppTemplateMessage } from '@/lib/whatsapp/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const convId = searchParams.get('conversationId');

    if (convId) {
      const { data: messages, error } = await supabase
        .from('bos_whatsapp_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json(messages || []);
    }

    // List conversations
    const { data: convs, error } = await supabase
      .from('bos_whatsapp_conversations')
      .select('*, business_unit:bos_business_units(name, code)')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(convs || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, text, templateName, parameters, conversationId, businessUnitId } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient phone number is required' }, { status: 400 });
    }

    if (templateName) {
      const res = await sendWhatsAppTemplateMessage({
        to,
        templateName,
        parameters,
        conversationId,
      });
      return NextResponse.json(res);
    }

    if (!text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const res = await sendWhatsAppMessage({
      to,
      text,
      conversationId,
      businessUnitId,
    });

    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
