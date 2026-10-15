import crypto from 'crypto';
import { supabase } from '../supabase';
import { getWhatsAppConfig, sendWhatsAppMessage, transcribeVoiceNote } from './client';
import { runAgentOrchestrator } from '../agents/orchestrator';

/**
 * Verify HMAC-SHA256 Webhook Signature from Meta
 */
export function verifyMetaSignature(rawBody: string, signatureHeader?: string | null): boolean {
  if (!signatureHeader) return false;
  const config = getWhatsAppConfig();
  const secret = config.webhookSecret;

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;
  const expectedHash = parts[1];

  const calculatedHash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(calculatedHash, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Check if current time is within business hours (08:00 - 18:00 WAT)
 */
export function isWithinBusinessHours(): boolean {
  const now = new Date();
  // WAT is UTC+1
  const watHour = (now.getUTCHours() + 1) % 24;
  return watHour >= 8 && watHour < 18;
}

/**
 * Processes an inbound WhatsApp message webhook payload
 */
export async function handleInboundWhatsAppWebhook(payload: any) {
  const entry = payload?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  // 1. Handle Status Updates (sent, delivered, read, failed)
  if (value?.statuses && value.statuses.length > 0) {
    for (const status of value.statuses) {
      const wamid = status.id;
      const newStatus = status.status;
      await supabase
        .from('bos_whatsapp_messages')
        .update({ status: newStatus })
        .eq('wamid', wamid);
    }
    return { handled: true, type: 'status_update' };
  }

  // 2. Handle Inbound Messages
  if (value?.messages && value.messages.length > 0) {
    const msg = value.messages[0];
    const contact = value.contacts?.[0];
    const senderPhone = msg.from;
    const senderName = contact?.profile?.name || 'WhatsApp User';
    const wamid = msg.id;

    // Idempotency check: Ignore duplicate delivery
    const { data: existing } = await supabase
      .from('bos_whatsapp_messages')
      .select('id')
      .eq('wamid', wamid)
      .single();

    if (existing) {
      return { handled: true, duplicate: true };
    }

    // Determine message text and media
    let messageText = '';
    let messageType = msg.type || 'text';
    let mediaUrl = '';
    let transcription = '';

    if (msg.type === 'text') {
      messageText = msg.text?.body || '';
    } else if (msg.type === 'audio' || msg.type === 'voice') {
      mediaUrl = msg.audio?.id || msg.voice?.id || '';
      transcription = await transcribeVoiceNote(mediaUrl);
      messageText = transcription;
      messageType = 'voice';
    } else if (msg.type === 'document') {
      messageText = `[Document received: ${msg.document?.filename || 'file'}]`;
      mediaUrl = msg.document?.id || '';
    } else {
      messageText = `[Unsupported message type: ${msg.type}]`;
    }

    // Determine channel: Executive command vs Customer support
    const isExecutiveNumber =
      senderPhone.includes('234') || senderPhone.includes('44') || senderPhone.includes('1');
    const channel = isExecutiveNumber ? 'executive_command' : 'customer_service';

    // 3. Find or Create Conversation
    let { data: conv } = await supabase
      .from('bos_whatsapp_conversations')
      .select('*')
      .eq('customer_phone', senderPhone)
      .single();

    if (!conv) {
      const { data: newConv } = await supabase
        .from('bos_whatsapp_conversations')
        .insert({
          customer_phone: senderPhone,
          customer_name: senderName,
          channel,
          active_agent: 'SuperAgent',
          status: 'open',
          opt_in_status: true,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();
      conv = newConv;
    } else {
      await supabase
        .from('bos_whatsapp_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conv.id);
    }

    // 4. Save Inbound Message
    await supabase.from('bos_whatsapp_messages').insert({
      conversation_id: conv?.id || null,
      wamid,
      direction: 'inbound',
      sender_phone: senderPhone,
      recipient_phone: value.metadata?.display_phone_number || 'LJ-BOS',
      message_type: messageType,
      content: messageText,
      media_url: mediaUrl,
      transcription,
      status: 'received',
    });

    // 5. Check Human Handover
    const lower = messageText.toLowerCase();
    if (
      lower.includes('talk to human') ||
      lower.includes('speak to manager') ||
      lower.includes('human agent')
    ) {
      if (conv?.id) {
        await supabase
          .from('bos_whatsapp_conversations')
          .update({
            status: 'handed_over',
            handover_reason: 'User explicitly requested human assistance',
          })
          .eq('id', conv.id);
      }

      await sendWhatsAppMessage({
        to: senderPhone,
        text: 'Your conversation has been routed to our human executive support team. A team manager will respond shortly.',
        conversationId: conv?.id,
      });

      return { handled: true, handover: true };
    }

    // 6. Check Business Hours for Customer Service
    if (channel === 'customer_service' && !isWithinBusinessHours()) {
      await sendWhatsAppMessage({
        to: senderPhone,
        text: 'Thank you for reaching out to LJ Group. Our offices are currently closed (hours: 8:00 AM - 6:00 PM WAT). Your inquiry has been logged and our team will reply first thing in the morning.',
        conversationId: conv?.id,
      });
      return { handled: true, outOfHours: true };
    }

    // 7. Route through SuperAgent Orchestrator
    const mockCeoUser = {
      id: '836b7147-c063-42ac-ab89-dcf6ed0bc890',
      email: 'ceo@ljgroup.com',
      full_name: senderName,
      role: 'ceo' as const,
      status: 'active',
    };

    const agentResult = await runAgentOrchestrator({
      prompt: messageText,
      actor: mockCeoUser,
      channel: 'whatsapp',
    });

    // 8. Send reply back to WhatsApp
    const replyBody =
      agentResult.finalResponse.replace(/[#*`_]/g, '').trim() ||
      'Your request has been received and processed by LJ SuperAgent.';

    await sendWhatsAppMessage({
      to: senderPhone,
      text: replyBody,
      conversationId: conv?.id,
    });

    return {
      handled: true,
      agentResult,
    };
  }

  return { handled: false, reason: 'unknown_payload' };
}
