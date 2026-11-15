import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
import {
  LifeBuoy,
  Send,
  User,
  Shield,
  Search,
  Save,
  Coins,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export const AdminSupportPage: React.FC = () => {
  useDbSync();
  const { showToast } = useToast();

  const tickets = db.getSupportTickets();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeTicket = tickets.find(t => t.id === activeTicketId) || filteredTickets[0] || null;
  const ticketUser = activeTicket ? db.getUserById(activeTicket.userId) : undefined;

  useEffect(() => {
    if (activeTicket) {
      setAdminNote(activeTicket.adminNote || '');
    }
  }, [activeTicket?.id]);

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    db.replyToTicket(activeTicket.id, 'admin', 'Master Administrator', replyText);
    setReplyText('');
    playUiSound('notification');
    showToast('Official admin reply dispatched!', 'success');
  };

  const handleUpdateStatus = (ticketId: string, status: 'open' | 'replied' | 'closed') => {
    db.updateTicketStatus(ticketId, status);
    playUiSound('click');
    showToast(`Ticket marked as ${status}.`, 'info');
  };

  const handleSaveAdminNote = () => {
    if (!activeTicket) return;
    db.updateTicketAdminNote(activeTicket.id, adminNote);
    playUiSound('click');
    showToast('Private admin note saved to ticket.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <LifeBuoy className="w-4 h-4" />
            <span>Customer Desk & Live Chat Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Support Chat Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage incoming user tickets, respond live, inspect customer credit status, and record private admin notes.
          </p>
        </div>

        <div className="oe-panel px-4 py-2 rounded-xl text-xs font-mono text-slate-300 self-start sm:self-auto">
          Tickets: <strong className="text-slate-100">{tickets.length}</strong> · Open:{' '}
          <strong className="text-amber-400">{tickets.filter(t => t.status === 'open').length}</strong>
        </div>
      </div>

      {/* 3-Column Chat Manager Workspace (Image 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Inbox */}
        <div className="lg:col-span-3 oe-panel rounded-2xl p-4 flex flex-col space-y-3 min-h-[560px]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search user or subject..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px]">
            {(['all', 'open', 'replied', 'closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`py-1.5 rounded-lg capitalize font-bold transition-colors cursor-pointer ${
                  statusFilter === s ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-xs text-slate-500 space-y-2">
              <LifeBuoy className="w-8 h-8 opacity-30 text-violet-400" />
              <p>No tickets match current filters.</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 max-h-[440px] overflow-y-auto pr-1">
              {filteredTickets.map(ticket => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-violet-500/60 bg-violet-600/15'
                        : 'border-slate-800/70 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-100 truncate">{ticket.subject}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                          ticket.status === 'open'
                            ? 'bg-rose-500/20 text-rose-400'
                            : ticket.status === 'replied'
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate">{ticket.userName}</span>
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Conversation Thread */}
        <div className="lg:col-span-6 oe-panel rounded-2xl p-5 flex flex-col justify-between min-h-[560px]">
          {activeTicket ? (
            <>
              <div className="border-b border-slate-800/80 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-100 truncate">{activeTicket.subject}</h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeTicket.userName} · {activeTicket.userEmail}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(activeTicket.id, 'open')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      activeTicket.status === 'open' ? 'bg-rose-600 text-white' : 'btn-premium-glass text-slate-300'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeTicket.id, 'replied')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      activeTicket.status === 'replied' ? 'bg-violet-600 text-white' : 'btn-premium-glass text-slate-300'
                    }`}
                  >
                    Replied
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeTicket.id, 'closed')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      activeTicket.status === 'closed' ? 'bg-emerald-600 text-white' : 'btn-premium-glass text-slate-300'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[390px] overflow-y-auto pr-2 py-4 flex-1">
                {activeTicket.messages.map(msg => {
                  const isAdminMsg = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        {isAdminMsg ? (
                          <>
                            <Shield className="w-3 h-3 text-amber-400" />
                            <span className="font-semibold text-amber-400">Admin</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-violet-400" />
                            <span className="font-semibold text-slate-100">{activeTicket.userName}</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                          isAdminMsg
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

              <form onSubmit={handleSendAdminReply} className="pt-3.5 border-t border-slate-800/80 flex gap-2.5">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type official admin response..."
                  className="flex-1 px-4 py-2.5 rounded-xl border text-xs text-slate-100"
                />
                <button
                  type="submit"
                  className="btn-premium-vivid py-2.5 px-5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center py-16 text-slate-400 text-xs">
              <LifeBuoy className="w-10 h-10 mx-auto opacity-30 text-violet-400 mb-2" />
              <p>Select a ticket on the left to review messages and reply.</p>
            </div>
          )}
        </div>

        {/* Column 3: User Info + Ticket Info + Private Admin Notes */}
        <div className="lg:col-span-3 oe-panel oe-rgb-violet rounded-2xl p-5 flex flex-col justify-between space-y-5">
          {activeTicket ? (
            <>
              <div className="space-y-3 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
                  Customer Profile
                </h4>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1.5">
                  <p className="font-bold text-slate-100">{activeTicket.userName}</p>
                  <p className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 break-all">
                    <Mail className="w-3 h-3 text-violet-400 shrink-0" />
                    <span>{activeTicket.userEmail}</span>
                  </p>
                  {ticketUser?.mobile && (
                    <p className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{ticketUser.mobile}</span>
                    </p>
                  )}
                </div>

                {ticketUser && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                    <span className="text-slate-400">Plan & Credits</span>
                    <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {(ticketUser.credits ?? 0).toLocaleString()} Cr
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private Admin Note</span>
                </label>
                <textarea
                  rows={6}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Write internal resolution note (not shown to user)..."
                  className="w-full p-3 rounded-xl border text-xs text-slate-100 resize-none leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleSaveAdminNote}
                  className="btn-premium-primary w-full py-2.5 rounded-xl text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Private Note</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Ticket metadata appears here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
