'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Tag,
  Plus,
} from 'lucide-react';
import { KnowledgeDocument, KnowledgeItem, KnowledgeGap } from '@/lib/types';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'facts' | 'assumptions' | 'proposed' | 'verified' | 'gaps' | 'documents'>('facts');

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [items, setItems] = useState<{
    facts: KnowledgeItem[];
    assumptions: KnowledgeItem[];
    proposedDecisions: KnowledgeItem[];
    verifiedDecisions: KnowledgeItem[];
  }>({ facts: [], assumptions: [], proposedDecisions: [], verifiedDecisions: [] });
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [loading, setLoading] = useState(true);

  // Ingestion form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState('pdf');
  const [ingesting, setIngesting] = useState(false);

  const fetchKnowledgeData = async () => {
    try {
      setLoading(true);
      const [docsRes, itemsRes] = await Promise.all([
        fetch('/api/knowledge/documents'),
        fetch('/api/knowledge/items'),
      ]);

      const docsData = await docsRes.json();
      const itemsData = await itemsRes.json();

      setDocuments(docsData || []);
      setItems(itemsData.items || { facts: [], assumptions: [], proposedDecisions: [], verifiedDecisions: [] });
      setGaps(itemsData.gaps || []);
    } catch (err) {
      console.error('Error fetching knowledge data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    try {
      setIngesting(true);
      const res = await fetch('/api/knowledge/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          fileType: docType,
          content: docContent,
          verificationStatus: 'verified',
        }),
      });
      await res.json();
      setDocTitle('');
      setDocContent('');
      setShowUploadModal(false);
      await fetchKnowledgeData();
    } catch (err) {
      console.error('Ingestion error:', err);
    } finally {
      setIngesting(false);
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
              <BookOpen className="h-4 w-4" />
              <span>pgvector Semantic Knowledge Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Central Company Knowledge Base
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Vector embeddings, source citations, document ingestion (PDF, DOCX, CSV), facts vs assumptions separation, and knowledge gap detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F1C40F] text-[#060D1A] font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Ingest Document</span>
            </button>
          </div>
        </div>

        {/* Semantic Search Bar */}
        <div className="bg-[#0B1728] border border-[#182C48] p-5 rounded-xl space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask or search company knowledge (e.g. 'Orlando Owoh catalog royalties', 'Ereokomi cold chain plan', 'Tiarion-X architecture')..."
                className="w-full bg-[#060D1A] border border-[#182C48] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#0F223D] hover:bg-[#163156] border border-[#1E3A5F] text-[#D4AF37] font-bold text-xs transition"
            >
              {searching ? 'Embedding & Searching...' : 'Semantic Search'}
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="text-slate-500 text-[11px] self-center">Suggested queries:</span>
            {['ASCAP and MLC catalog recovery', 'Tiarion-X tech stack', 'Ereokomi diesel harvester fuel', 'Apapa port diagnostics clearance'].map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(sq);
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-[#070F22] hover:bg-[#0F223D] border border-[#182C48] text-slate-300 transition"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display (if present) */}
        {searchResults && (
          <div className="bg-[#0B1728] border border-[#D4AF37]/40 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#182C48] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Semantic Matches for: &ldquo;{searchResults.query}&rdquo;
              </span>
              <span className="text-[11px] font-mono text-[#D4AF37]">
                {searchResults.chunks?.length || 0} Chunks Retrieved
              </span>
            </div>

            {searchResults.chunks?.length === 0 ? (
              <div className="p-4 text-xs text-slate-400">
                No matching verified records found in knowledge base. <em>(The system will declare missing information rather than inventing it.)</em>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.chunks.map((chunk: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#060D1A] border border-[#182C48] rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{chunk.documentTitle}</span>
                        <span className="text-slate-500 font-mono">({chunk.fileName})</span>
                      </span>
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                        Confidence: {(chunk.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &ldquo;{chunk.content}&rdquo;
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Source ID: {chunk.documentId} · Status: {chunk.verificationStatus}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Knowledge Explorer Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-[#182C48] space-x-2 text-xs overflow-x-auto no-scrollbar">
            {[
              { id: 'facts', label: `Verified Facts (${items.facts.length})`, icon: CheckCircle2 },
              { id: 'verified', label: `Decisions (${items.verifiedDecisions.length})`, icon: ShieldCheck },
              { id: 'proposed', label: `Proposed (${items.proposedDecisions.length})`, icon: AlertCircle },
              { id: 'assumptions', label: `Assumptions (${items.assumptions.length})`, icon: HelpCircle },
              { id: 'gaps', label: `Knowledge Gaps (${gaps.length})`, icon: Tag },
              { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === 'facts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.facts.map((fact) => (
                  <div key={fact.id} className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{fact.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{fact.statement}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-[#182C48] pt-2">
                      <span>BU: {fact.business_unit?.name || 'General'}</span>
                      <span>Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'verified' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.verifiedDecisions.map((dec) => (
                  <div key={dec.id} className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dec.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        APPROVED POLICY
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{dec.statement}</p>
                    <div className="text-[10px] text-slate-500 border-t border-[#182C48] pt-2">
                      Verified Policy in Supabase
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'proposed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.proposedDecisions.map((prop) => (
                  <div key={prop.id} className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{prop.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        PENDING APPROVAL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{prop.statement}</p>
                    <div className="text-[10px] text-slate-500 border-t border-[#182C48] pt-2">
                      Awaiting CEO Sign-off
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'assumptions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.assumptions.map((assump) => (
                  <div key={assump.id} className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{assump.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        ASSUMPTION
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{assump.statement}</p>
                    <div className="text-[10px] text-slate-500 border-t border-[#182C48] pt-2">
                      Subject to port inspection updates
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'gaps' && (
              <div className="space-y-3">
                {gaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{gap.topic}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                            gap.priority === 'High' || gap.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {gap.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{gap.description}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded bg-[#0F223D] hover:bg-[#163156] border border-[#1E3A5F] text-xs text-[#D4AF37] font-semibold transition">
                      Resolve Gap →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-[#0B1728] border border-[#182C48] rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 truncate pr-2">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#0F223D] text-[#D4AF37]">
                          {doc.file_type.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate mt-1">{doc.title}</h4>
                      </div>
                      <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{doc.file_name}</div>
                    <div className="pt-2 border-t border-[#182C48] flex items-center justify-between text-[10px] text-slate-500">
                      <span>Status: <strong className="text-emerald-400">{doc.verification_status}</strong></span>
                      <span>Author: {doc.author || 'System'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Document Ingestion Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#0B1728] border border-[#182C48] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#182C48] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="h-4 w-4 text-[#D4AF37]" />
                  <span>Ingest Knowledge Document into Vector Store</span>
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleIngestDocument} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. SmartFix Properties Tenant Onboarding SOP 2026"
                    className="w-full bg-[#060D1A] border border-[#182C48] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">File Format</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-[#060D1A] border border-[#182C48] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="pdf">PDF Document (.pdf)</option>
                      <option value="docx">Word Document (.docx)</option>
                      <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                      <option value="csv">CSV Data (.csv)</option>
                      <option value="txt">Plain Text (.txt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Verification Status</label>
                    <div className="px-3 py-2 rounded-lg bg-[#060D1A] border border-[#182C48] text-xs text-emerald-400 font-bold">
                      Verified Corporate Record
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Document Content / Text</label>
                  <textarea
                    rows={6}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Paste or type document text. Content will be automatically tokenized, chunked, and embedded into pgvector..."
                    className="w-full bg-[#060D1A] border border-[#182C48] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#0F223D] hover:bg-[#163156] text-xs text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ingesting}
                    className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F1C40F] disabled:opacity-50 text-[#060D1A] font-bold text-xs transition"
                  >
                    {ingesting ? 'Processing Embeddings...' : 'Save & Vectorize'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
