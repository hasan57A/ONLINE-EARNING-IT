import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { SupportTicket } from '../../types';
import {
  LifeBuoy,
  Send,
  PlusCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Shield,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const tickets = db.getSupportTickets(user?.id);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets[0]?.id || null);

  // New ticket modal
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  // Reply message text
  const [replyText, setReplyText] = useState('');

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0] || null;

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
    showToast('Support ticket created successfully! An admin will review shortly.', 'success');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeTicket || !replyText.trim()) return;

    db.replyToTicket(activeTicket.id, 'user', user.fullName, replyText);
    setReplyText('');
    showToast('Reply dispatched to administrative desk.', 'success');
  };

  const statusBadge = (status: SupportTicket['status']) => {
    if (status === 'replied') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500">
          Admin Replied
        </span>
      );
    }
    if (status === 'closed') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
          Resolved
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-500">
        Awaiting Response
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-widest">
            <LifeBuoy className="w-4 h-4" />
            <span>Help Desk & Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Support System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Submit questions, report data anomalies, or request custom arbitrage tools directly to the administration.
          </p>
        </div>

        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Main Split: Ticket List vs Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ticket List (Left Column) */}
        <div className="lg:col-span-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Your Tickets ({tickets.length})
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
              <p>No tickets yet. Click "New Support Ticket" to start a thread.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {tickets.map(ticket => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {ticket.subject}
                      </span>
                      {statusBadge(ticket.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {ticket.messages[ticket.messages.length - 1]?.text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{ticket.messages.length} messages</span>
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversation Thread (Right Column) */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col justify-between min-h-[520px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between space-y-6">
              {/* Thread Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeTicket.subject}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Ticket ID: {activeTicket.id} · Opened {new Date(activeTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>{statusBadge(activeTicket.status)}</div>
              </div>

              {/* Message History */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 flex-1">
                {activeTicket.messages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500">
                        {isUser ? (
                          <>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">You</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold text-amber-500">Support Desk</span>
                            <span>·</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </>
                        )}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your message reply to support..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="m-auto text-center py-16 text-slate-400 space-y-2 text-xs">
              <LifeBuoy className="w-12 h-12 mx-auto opacity-30 text-blue-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Ticket Selected</p>
              <p className="max-w-xs text-slate-500">
                Choose a ticket from the left panel or initiate a new ticket with the button above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {newTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Open New Support Ticket
              </h3>
              <button
                onClick={() => setNewTicketModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. In-App User Agent question or API inquiry"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Inquiry
                </label>
                <textarea
                  rows={5}
                  required
                  value={newInitialMsg}
                  onChange={e => setNewInitialMsg(e.target.value)}
                  placeholder="Describe your issue, suggestion, or question in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
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
