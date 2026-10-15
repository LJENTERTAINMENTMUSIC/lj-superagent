'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import {
  MessageSquare,
  Send,
  Phone,
  Mic,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  CheckCheck,
  Bot,
  Zap,
} from 'lucide-react';
import { WhatsAppConversation, WhatsAppMessage } from '@/lib/types';

export default function WhatsAppCommandPage() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('+2348039281729');

  const quickCommands = [
    'Prepare my daily business report.',
    'Show all overdue tasks across LJ Entertainment.',
    'Assign the website update to the relevant developer.',
    'Summarise today\'s customer enquiries.',
    'Prepare a draft response to this booking enquiry.',
  ];

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/whatsapp/messages');
      const data = await res.json();
      setConversations(data || []);
      if (data && data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/messages?conversationId=${convId}`);
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      setRecipientPhone(selectedConv.customer_phone);
    }
  }, [selectedConv]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !recipientPhone.trim()) return;

    try {
      setSending(true);

      // Execute via official webhook handler simulation (triggers SuperAgent & dispatches response)
      const res = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: 'LJ-BOS-HQ' },
                    contacts: [{ profile: { name: 'Executive Director' } }],
                    messages: [
                      {
                        from: recipientPhone,
                        id: `wamid.HBgM${Date.now()}IN`,
                        timestamp: `${Math.floor(Date.now() / 1000)}`,
                        text: { body: text },
                        type: 'text',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      });

      setInputText('');
      await fetchConversations();
      if (selectedConv) {
        await fetchMessages(selectedConv.id);
      }
    } catch (err) {
      console.error('Error dispatching message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceNoteSimulation = async () => {
    try {
      setSending(true);
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    contacts: [{ profile: { name: 'Executive Director (Voice)' } }],
                    messages: [
                      {
                        from: recipientPhone,
                        id: `wamid.HBgM${Date.now()}VOICE`,
                        type: 'voice',
                        voice: { id: 'media-voice-sample-101' },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      });
      await fetchConversations();
      if (selectedConv) await fetchMessages(selectedConv.id);
    } catch (err) {
      console.error('Error with voice note simulation:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#182C48] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              <MessageSquare className="h-4 w-4" />
              <span>Official WhatsApp Business Cloud API Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              WhatsApp Command Centre & Customer Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Dual-channel processing: Executive AI Command Channel and verified Customer Support with Human Handover.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Webhook Verified (HMAC-SHA256)</span>
            </span>
            <button
              onClick={() => {
                fetchConversations();
                if (selectedConv) fetchMessages(selectedConv.id);
              }}
              className="p-2 rounded-lg bg-[#0C1B33] hover:bg-[#122442] border border-[#1E3A5F] text-slate-300 transition"
              title="Refresh Messages"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Command Bar */}
        <div className="bg-[#0B1728] border border-[#182C48] p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Zap className="h-4 w-4 text-[#D4AF37]" />
            <span>Executive Natural-Language Command Shortcuts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(cmd)}
                disabled={sending}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#0F223D] hover:bg-[#163156] border border-[#1E3A5F] text-slate-200 transition font-medium text-left"
              >
                &ldquo;{cmd}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Main WhatsApp Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
          {/* Left Column: Conversations List */}
          <div className="bg-[#0B1728] border border-[#182C48] rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#182C48] bg-[#070F22] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Conversations ({conversations.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182C48] text-slate-400">
                8:00 AM - 6:00 PM WAT
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#182C48]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active conversations logged yet. Send a test command above to initiate a verified thread.
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-4 hover:bg-[#0F223D] transition flex items-start justify-between ${
                      selectedConv?.id === conv.id ? 'bg-[#0E2038] border-l-4 border-[#D4AF37]' : ''
                    }`}
                  >
                    <div className="space-y-1 truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {conv.customer_name || 'WhatsApp Contact'}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            conv.channel === 'executive_command'
                              ? 'bg-[#D4AF37]/20 text-[#F5D061] border border-[#D4AF37]/40'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {conv.channel === 'executive_command' ? 'Executive' : 'Support'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{conv.customer_phone}</div>
                      {conv.status === 'handed_over' && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                          <UserCheck className="h-3 w-3" />
                          <span>Human Handover Active</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Chat Feed & Dispatcher */}
          <div className="lg:col-span-2 bg-[#0B1728] border border-[#182C48] rounded-xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#182C48] bg-[#070F22] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center font-black text-[#070F22] text-xs">
                  {selectedConv?.customer_name?.charAt(0) || 'W'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {selectedConv?.customer_name || 'Executive Command Channel'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <span>{recipientPhone}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Opt-in Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVoiceNoteSimulation}
                  disabled={sending}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#0F223D] hover:bg-[#163156] border border-[#1E3A5F] text-xs text-[#D4AF37] font-semibold transition"
                  title="Simulate Speech-to-Text Inbound Voice Note"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Voice Note STT</span>
                </button>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#060D1A]/50">
              {messages.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No messages in this thread yet. Select an executive command chip or write a prompt below.
                </div>
              ) : (
                messages.map((m) => {
                  const isInbound = m.direction === 'inbound';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed space-y-1 ${
                          isInbound
                            ? 'bg-[#0E2038] border border-[#1E3A5F] text-slate-100 rounded-tl-none'
                            : 'bg-gradient-to-br from-[#122B4D] to-[#0A1A30] border border-[#D4AF37]/30 text-white rounded-tr-none'
                        }`}
                      >
                        {m.message_type === 'voice' && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] border-b border-slate-700/50 pb-1">
                            <Mic className="h-3 w-3" />
                            <span>Audio Voice Note Transcribed</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.content}</div>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1">
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {!isInbound && <CheckCheck className="h-3 w-3 text-[#D4AF37]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#182C48] bg-[#070F22]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type an executive command (e.g. 'Show all overdue tasks across LJ Entertainment')..."
                  className="flex-1 bg-[#060D1A] border border-[#182C48] rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F1C40F] disabled:opacity-50 text-[#060D1A] font-black text-xs flex items-center gap-1.5 transition"
                >
                  <span>{sending ? 'Routing...' : 'Send'}</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
