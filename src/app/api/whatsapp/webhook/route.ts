import { NextResponse } from 'next/server';
import { getWhatsAppConfig } from '@/lib/whatsapp/client';
import { handleInboundWhatsAppWebhook, verifyMetaSignature } from '@/lib/whatsapp/webhookHandler';

/**
 * GET Handler: Meta Webhook Handshake Verification
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const config = getWhatsAppConfig();

  if (mode === 'subscribe' && token === config.verifyToken) {
    console.log('[WhatsApp Webhook] Handshake verified successfully.');
    return new Response(challenge || '', { status: 200 });
  }

  console.warn('[WhatsApp Webhook] Handshake verification failed: Token mismatch.');
  return new Response('Forbidden', { status: 403 });
}

/**
 * POST Handler: Inbound Messages & Delivery Statuses
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // If signature header is present, verify HMAC-SHA256
    if (signature) {
      const isValid = verifyMetaSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[WhatsApp Webhook] Invalid HMAC signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const result = await handleInboundWhatsAppWebhook(payload);

    return NextResponse.json({ status: 'ok', result });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Error processing event:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
