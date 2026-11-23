import React, { useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { useDbSync } from '../../hooks/useDbSync';
import { SupportChannel } from '../../types';
import supportConciergeArt from '../../assets/images/support_concierge_art_1794739934523.jpg';
import {
  MessageCircle,
  Plus,
  Send,
  Phone,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  Star,
  X,
  Save,
} from 'lucide-react';

export const AdminSupportChannelsPage: React.FC = () => {
  useDbSync();
  const { showToast } = useToast();
  const channels = db.getSupportChannels();
  const [tab, setTab] = useState<'all' | 'telegram' | 'whatsapp'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [chType, setChType] = useState<'telegram' | 'whatsapp'>('telegram');
  const [chName, setChName] = useState('');
  const [chHandle, setChHandle] = useState('');
  const [chPrimary, setChPrimary] = useState(false);
  const [chStatus, setChStatus] = useState<'active' | 'inactive'>('active');
  const [chVisible, setChVisible] = useState(true);
  const [chOrder, setChOrder] = useState(1);

  const telegramList = channels.filter(c => c.type === 'telegram').sort((a, b) => a.order - b.order);
  const whatsappList = channels.filter(c => c.type === 'whatsapp').sort((a, b) => a.order - b.order);

  const openAddModal = (defaultType: 'telegram' | 'whatsapp' = 'telegram') => {
    setEditingId(null);
    setChType(defaultType);
    setChName('');
    setChHandle('');
    setChPrimary(false);
    setChStatus('active');
    setChVisible(true);
    setChOrder(channels.filter(c => c.type === defaultType).length + 1);
    setModalOpen(true);
  };

  const openEditModal = (item: SupportChannel) => {
    setEditingId(item.id);
    setChType(item.type);
    setChName(item.name);
    setChHandle(item.handleOrNumber);
    setChPrimary(item.isPrimary);
    setChStatus(item.status);
    setChVisible(item.visibleToUsers);
    setChOrder(item.order);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chName.trim() || !chHandle.trim()) {
      showToast('Please enter both channel name and handle/number.', 'error');
      return;
    }
    db.saveSupportChannel({
      id: editingId || `ch_${chType}_${Date.now()}`,
      type: chType,
      name: chName.trim(),
      handleOrNumber: chHandle.trim(),
      isPrimary: chPrimary,
      status: chStatus,
      visibleToUsers: chVisible,
      order: Number(chOrder) || 1,
    });
    setModalOpen(false);
    showToast(editingId ? 'Support channel updated.' : 'New support channel added!', 'success');
  };

  const handleDelete = (id: string) => {
    db.deleteSupportChannel(id);
    showToast('Support channel removed.', 'info');
  };

  const toggleStatus = (item: SupportChannel) => {
    db.saveSupportChannel({ ...item, status: item.status === 'active' ? 'inactive' : 'active' });
  };

  const toggleVisibility = (item: SupportChannel) => {
    db.saveSupportChannel({ ...item, visibleToUsers: !item.visibleToUsers });
  };

  const bumpOrder = (item: SupportChannel, delta: number) => {
    db.saveSupportChannel({ ...item, order: Math.max(1, item.order + delta) });
  };

  const primarySetCount =
    (telegramList.some(t => t.isPrimary) ? 1 : 0) + (whatsappList.some(w => w.isPrimary) ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Support Channels Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add, update, reorder, and manage Telegram & WhatsApp channels visible in the user Support Center.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAddModal('telegram')}
          className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Channel</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Telegram Channels</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{telegramList.length}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              {telegramList.filter(t => t.status === 'active').length} Active
            </div>
          </div>
        </div>

        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">WhatsApp Numbers</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{whatsappList.length}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              {whatsappList.filter(w => w.status === 'active').length} Active
            </div>
          </div>
        </div>

        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400 shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Channels</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{channels.length}</div>
            <div className="text-[11px] text-slate-400">
              {channels.filter(c => c.visibleToUsers).length} Visible to Users
            </div>
          </div>
        </div>

        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Primary Channels Set</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{primarySetCount} / 2</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Both Configured
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        {[
          { id: 'all', label: 'All Channels' },
          { id: 'telegram', label: 'Telegram Only' },
          { id: 'whatsapp', label: 'WhatsApp Only' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as 'all' | 'telegram' | 'whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === t.id
                ? 'btn-premium-primary text-white'
                : 'text-slate-400 hover:text-slate-100 bg-slate-900/60 border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Telegram Table */}
      {(tab === 'all' || tab === 'telegram') && (
        <div className="oe-panel rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-bold text-slate-100">Telegram Support Channels</h2>
            </div>
            <button
              type="button"
              onClick={() => openAddModal('telegram')}
              className="btn-premium-cyan px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Telegram</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-4">Channel Name</th>
                  <th className="py-3.5 px-4">Username / Handle</th>
                  <th className="py-3.5 px-4">Primary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Visible</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {telegramList.map((ch, idx) => (
                  <tr key={ch.id}>
                    <td className="py-3.5 px-5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{ch.name}</td>
                    <td className="py-3.5 px-4 font-mono text-sky-300">{ch.handleOrNumber}</td>
                    <td className="py-3.5 px-4">
                      {ch.isPrimary ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/35 text-violet-200 text-[10px] font-bold">
                          Primary
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(ch)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border ${
                          ch.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ch.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(ch)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-300 hover:text-slate-100 cursor-pointer"
                        title={ch.visibleToUsers ? 'Visible to users' : 'Hidden from users'}
                      >
                        {ch.visibleToUsers ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => bumpOrder(ch, -1)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => bumpOrder(ch, 1)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(ch)}
                          className="px-2.5 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ch.id)}
                          className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                          title="Delete channel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp Table */}
      {(tab === 'all' || tab === 'whatsapp') && (
        <div className="oe-panel rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">WhatsApp Support Channels</h2>
            </div>
            <button
              type="button"
              onClick={() => openAddModal('whatsapp')}
              className="btn-premium-emerald px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add WhatsApp</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-4">Channel Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Primary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Visible</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {whatsappList.map((ch, idx) => (
                  <tr key={ch.id}>
                    <td className="py-3.5 px-5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{ch.name}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-300">{ch.handleOrNumber}</td>
                    <td className="py-3.5 px-4">
                      {ch.isPrimary ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/35 text-violet-200 text-[10px] font-bold">
                          Primary
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(ch)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border ${
                          ch.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ch.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(ch)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-300 hover:text-slate-100 cursor-pointer"
                      >
                        {ch.visibleToUsers ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => bumpOrder(ch, -1)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => bumpOrder(ch, 1)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(ch)}
                          className="px-2.5 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ch.id)}
                          className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom How It Works Banner with Concierge Illustration */}
      <div className="oe-panel rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2.5">
          <h3 className="text-lg font-bold text-slate-100">How Support Channel Routing Works</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Channels marked <strong>Active</strong> and <strong>Visible</strong> appear automatically as one-click Telegram & WhatsApp contact cards inside every user&apos;s Support Center. Primary badges highlight your fastest official response desks.
          </p>
        </div>
        <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-slate-800 max-h-44">
          <img
            src={supportConciergeArt}
            alt="Support Concierge routing illustration"
            className="w-full h-44 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md oe-panel rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                {editingId ? 'Edit Support Channel' : 'Add New Support Channel'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['telegram', 'whatsapp'] as const).map(tp => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setChType(tp)}
                  className={`py-2.5 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                    chType === tp
                      ? 'border-violet-500 bg-violet-500/20 text-slate-100'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Channel Name</label>
              <input
                type="text"
                value={chName}
                onChange={e => setChName(e.target.value)}
                placeholder={chType === 'telegram' ? 'Official Support' : 'Support WhatsApp 1'}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {chType === 'telegram' ? 'Telegram Handle (@username)' : 'WhatsApp Number (+country code)'}
              </label>
              <input
                type="text"
                value={chHandle}
                onChange={e => setChHandle(e.target.value)}
                placeholder={chType === 'telegram' ? '@OnlineLearningPro_Official' : '+880 1712-345678'}
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  value={chStatus}
                  onChange={e => setChStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={chOrder}
                  onChange={e => setChOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chPrimary}
                  onChange={e => setChPrimary(e.target.checked)}
                  className="accent-violet-500"
                />
                <span>Set as Primary</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chVisible}
                  onChange={e => setChVisible(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>Visible to Users</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-premium-glass px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Channel</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
