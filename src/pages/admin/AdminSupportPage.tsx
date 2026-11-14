import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { SupportTicket } from '../../types';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Search,
} from 'lucide-react';

export const AdminSupportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const tickets = db.getSupportTickets();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('all');
  const [search, setSearch] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeTicket = tickets.find(t => t.id === activeTicketId) || filteredTickets[0] || null;

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    db.replyToTicket(activeTicket.id, 'admin', 'Master Administrator', replyText);
    setReplyText('');
    showToast('Reply dispatched to user!', 'success');
  };

  const handleUpdateStatus = (ticketId: string, status: 'open' | 'replied' | 'closed') => {
    db.updateTicketStatus(ticketId, status);
    showToast(`Ticket status updated to ${status}.`, 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <LifeBuoy className="w-4 h-4" />
            <span>Customer Desk & Communications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Support Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review user help requests, provide technical guidance, and manage dispute resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Tickets: <strong className="text-white">{tickets.length}</strong></span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets by subject, user name, or Gmail..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {(['all', 'open', 'replied', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Ticket Inbox vs Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inbox */}
        <div className="lg:col-span-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-3">
          <span className="text-xs font-bold text-white block pb-2 border-b border-slate-800">
            Incoming Inquiries ({filteredTickets.length})
          </span>

          {filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <LifeBuoy className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
              <p>No tickets found matching current filters.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredTickets.map(ticket => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-white truncate">
                        {ticket.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          ticket.status === 'open'
                            ? 'bg-rose-500/20 text-rose-400'
                            : ticket.status === 'replied'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{ticket.userName}</span>
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversation Thread & Admin Actions */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm flex flex-col justify-between min-h-[550px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between space-y-6">
              {/* Header with status controls */}
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-amber-400 font-semibold">{activeTicket.userName}</span>
                    <span>·</span>
                    <span className="font-mono">{activeTicket.userEmail}</span>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(activeTicket.id, 'open')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      activeTicket.status === 'open'
                        ? 'bg-rose-500 text-white'
                        : 'border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeTicket.id, 'replied')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      activeTicket.status === 'replied'
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Replied
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeTicket.id, 'closed')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      activeTicket.status === 'closed'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 flex-1">
                {activeTicket.messages.map(msg => {
                  const isAdminMsg = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        {isAdminMsg ? (
                          <>
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-semibold text-amber-400">Admin</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-semibold text-white">{activeTicket.userName}</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-wrap ${
                          isAdminMsg
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendAdminReply} className="pt-4 border-t border-slate-800 flex gap-3">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type official admin response..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="m-auto text-center py-16 text-slate-500 text-xs">
              <LifeBuoy className="w-10 h-10 mx-auto opacity-30 text-amber-500 mb-2" />
              <p>Select a ticket on the left to review messages and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
