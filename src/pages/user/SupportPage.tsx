import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import { SupportTicket } from '../../types';
import {
  LifeBuoy,
  Send,
  PlusCircle,
  MessageSquare,
  Shield,
  Search,
  X,
  ExternalLink,
  PhoneCall,
  Clock,
  CheckCircle2,
  Hash,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  useDbSync();
  const { user } = useAuth();
  const { showToast } = useToast();

  const tickets = db.getSupportTickets(user?.id);
  const channels = db
    .getSupportChannels()
    .filter(c => c.status === 'active' && c.visibleToUsers)
    .sort((a, b) => a.order - b.order);

  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('all');
  const [search, setSearch] = useState('');

  // New ticket modal
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  // Reply message text
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch =
      !search.trim() ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeTicket =
    tickets.find(t => t.id === activeTicketId) || filteredTickets[0] || null;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newSubject.trim() || !newInitialMsg.trim()) {
      showToast('Please provide both a subject and inquiry details.', 'error');
      return;
    }

    const created = db.createSupportTicket(user, newSubject, newInitialMsg);
    setNewTicketModalOpen(false);
    setNewSubject('');
    setNewInitialMsg('');
    setActiveTicketId(created.id);
    playUiSound('notification');
    showToast('Support ticket created! An admin will review shortly.', 'success');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeTicket || !replyText.trim()) return;

    db.replyToTicket(activeTicket.id, 'user', user.fullName, replyText);
    setReplyText('');
    playUiSound('click');
    showToast('Reply dispatched to support desk.', 'success');
  };

  const statusBadge = (status: SupportTicket['status']) => {
    if (status === 'replied') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 whitespace-nowrap">
          Admin Replied
        </span>
      );
    }
    if (status === 'closed') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
          Resolved
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
        Open
      </span>
    );
  };

  const buildChannelHref = (type: 'telegram' | 'whatsapp', handleOrNumber: string) => {
    if (type === 'telegram') {
      const clean = handleOrNumber.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
      return `https://t.me/${clean}`;
    }
    const digits = handleOrNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${digits}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
            <LifeBuoy className="w-4 h-4" />
            <span>Help Desk & Live Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Support Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Connect via direct Telegram & WhatsApp channels or chat directly with our ticket desk.
          </p>
        </div>

        <button
          onClick={() => {
            playUiSound('click');
            setNewTicketModalOpen(true);
          }}
          className="btn-premium-vivid py-2.5 px-5 rounded-xl text-xs inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Live Support Channels Strip */}
      {channels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map(ch => {
            const isTg = ch.type === 'telegram';
            return (
              <a
                key={ch.id}
                href={buildChannelHref(ch.type, ch.handleOrNumber)}
                target="_blank"
                rel="noreferrer"
                className={`oe-panel oe-panel-hover rounded-2xl p-4 flex items-center justify-between gap-3 group ${
                  isTg ? 'oe-rgb-cyan' : 'oe-rgb-emerald'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isTg
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isTg ? <Send className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100 truncate">{ch.name}</span>
                      {ch.isPrimary && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">{ch.handleOrNumber}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-100 shrink-0 transition-colors" />
              </a>
            );
          })}
        </div>
      )}

      {/* 3-Column Help Desk Workspace (Image 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Conversations List */}
        <div className="lg:col-span-4 oe-panel rounded-2xl p-4 flex flex-col space-y-3 min-h-[540px]">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-bold text-slate-100">
              Conversations ({filteredTickets.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">{tickets.length} Total</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border text-xs text-slate-100"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800/70 text-[11px]">
            {(['all', 'open', 'replied', 'closed'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 rounded-lg capitalize font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-30 text-violet-400" />
              <p>No tickets match filters. Open a new ticket to chat with Admin.</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 max-h-[420px] overflow-y-auto pr-1">
              {filteredTickets.map(ticket => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-violet-500/60 bg-violet-600/15 shadow-md'
                        : 'border-slate-800/70 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-100 truncate">{ticket.subject}</span>
                      {statusBadge(ticket.status)}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ticket.messages[ticket.messages.length - 1]?.text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{ticket.messages.length} msgs</span>
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Live Chat Thread */}
        <div className="lg:col-span-5 oe-panel rounded-2xl p-5 flex flex-col justify-between min-h-[540px]">
          {activeTicket ? (
            <>
              <div className="border-b border-slate-800/80 pb-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-100 truncate">{activeTicket.subject}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {activeTicket.id}
                  </span>
                </div>
                {statusBadge(activeTicket.status)}
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 py-4 flex-1">
                {activeTicket.messages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        {isUser ? (
                          <>
                            <span className="font-semibold text-violet-300">You</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span className="font-semibold text-emerald-400">Support Team</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        )}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-[88%] text-xs leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                            : 'bg-slate-950/90 text-slate-200 rounded-tl-none border border-slate-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="pt-3.5 border-t border-slate-800/80 flex gap-2.5">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl border text-xs text-slate-100"
                />
                <button
                  type="submit"
                  className="btn-premium-primary py-2.5 px-4 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center py-16 text-slate-400 space-y-2 text-xs">
              <LifeBuoy className="w-10 h-10 mx-auto opacity-30 text-violet-400" />
              <p className="font-bold text-slate-100">No Conversation Selected</p>
              <p className="max-w-xs text-slate-400">
                Select a ticket on the left or click "New Support Ticket" to start chatting.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Ticket Details Inspector */}
        <div className="lg:col-span-3 oe-panel rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-2.5">
              Ticket Details
            </h3>

            {activeTicket ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Reference ID
                  </span>
                  <p className="font-mono text-slate-100 text-[11px] break-all">{activeTicket.id}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  {statusBadge(activeTicket.status)}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Created
                    </span>
                    <span className="font-mono text-slate-200">
                      {new Date(activeTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Updated
                    </span>
                    <span className="font-mono text-slate-200">
                      {new Date(activeTicket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a ticket to view metadata.</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 space-y-2 text-[11px]">
            <p className="font-bold text-violet-300">Fast Escalation Tip</p>
            <p className="text-slate-300 leading-relaxed">
              Include your Transaction ID (TrxID) or tool name for instant billing or pool support.
            </p>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {newTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="oe-panel oe-rgb-violet max-w-lg w-full p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-slate-100">Open New Support Ticket</h3>
              <button
                onClick={() => setNewTicketModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Payment verification or User Agent batch inquiry"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Inquiry
                </label>
                <textarea
                  rows={5}
                  required
                  value={newInitialMsg}
                  onChange={e => setNewInitialMsg(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  className="btn-premium-glass py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-premium-vivid py-2.5 px-5 rounded-xl text-xs cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
