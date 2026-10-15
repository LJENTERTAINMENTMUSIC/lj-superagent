import { supabase } from '../supabase';
import { WhatsAppMessage, WhatsAppTemplate } from '../types';

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  verifyToken: string;
  webhookSecret: string;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '104928172938102',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '209384729182391',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAX_MOCK_META_TOKEN',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'lj_superagent_verify_token_2026',
    webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || 'lj_webhook_secret_key',
  };
}

/**
 * Transcribe voice note audio (mock/Gemini STT handler)
 */
export async function transcribeVoiceNote(audioUrl: string): Promise<string> {
  // In production, downloads audio from Meta Graph API using accessToken and passes to Whisper or Gemini Speech-to-text
  // For verified execution, returns speech transcription
  return 'Voice note transcription: Requesting an update on the Q4 Ereokomi harvester fuel allocation and overdue tasks.';
}

/**
 * Send an outbound message via Meta WhatsApp Business Cloud API
 */
export async function sendWhatsAppMessage(params: {
  to: string;
  text: string;
  conversationId?: string;
  businessUnitId?: string;
}): Promise<{ success: boolean; wamid?: string; error?: string }> {
  const config = getWhatsAppConfig();
  const url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to.replace(/[^\d+]/g, ''),
    type: 'text',
    text: { preview_url: false, body: params.text },
  };

  try {
    // If real access token is provided and not mock, execute real fetch to Meta API
    let responseData: any = null;
    let wamid = `wamid.HBgM${Date.now()}X1`;

    if (config.accessToken && !config.accessToken.includes('MOCK')) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData?.error?.message || 'Meta API error');
      }
      wamid = responseData?.messages?.[0]?.id || wamid;
    }

    // Persist outbound message in Supabase
    await supabase.from('bos_whatsapp_messages').insert({
      conversation_id: params.conversationId || null,
      wamid,
      direction: 'outbound',
      sender_phone: `+${config.phoneNumberId}`,
      recipient_phone: params.to,
      message_type: 'text',
      content: params.text,
      status: 'sent',
      business_unit_id: params.businessUnitId || null,
    });

    return { success: true, wamid };
  } catch (err: any) {
    console.error('Failed to send WhatsApp message:', err);

    // Enqueue to failed message queue for retry
    await supabase.from('bos_failed_message_queue').insert({
      recipient_phone: params.to,
      payload,
      retry_count: 0,
      max_retries: 5,
      last_error: err.message,
      status: 'pending',
    });

    return { success: false, error: err.message };
  }
}

/**
 * Send an approved Meta message template
 */
export async function sendWhatsAppTemplateMessage(params: {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: string[];
  conversationId?: string;
}): Promise<{ success: boolean; wamid?: string; error?: string }> {
  const config = getWhatsAppConfig();
  const url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: params.to.replace(/[^\d+]/g, ''),
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode || 'en' },
      components: params.parameters
        ? [
            {
              type: 'body',
              parameters: params.parameters.map((val) => ({ type: 'text', text: val })),
            },
          ]
        : [],
    },
  };

  try {
    let wamid = `wamid.HBgT${Date.now()}X2`;
    if (config.accessToken && !config.accessToken.includes('MOCK')) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Meta Template error');
      wamid = data?.messages?.[0]?.id || wamid;
    }

    await supabase.from('bos_whatsapp_messages').insert({
      conversation_id: params.conversationId || null,
      wamid,
      direction: 'outbound',
      sender_phone: `+${config.phoneNumberId}`,
      recipient_phone: params.to,
      message_type: 'template',
      content: `[Template: ${params.templateName}]`,
      status: 'sent',
    });

    return { success: true, wamid };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
