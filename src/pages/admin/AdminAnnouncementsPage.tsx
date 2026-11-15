import React, { useMemo, useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import { useDbSync } from '../../hooks/useDbSync';
import { AnnouncementPost } from '../../types';
import announcementBonusBanner from '../../assets/images/announcement_bonus_banner_1794739934535.jpg';
import {
  Megaphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Edit3,
  Copy,
  Trash2,
  X,
  Save,
  Sparkles,
} from 'lucide-react';

export const AdminAnnouncementsPage: React.FC = () => {
  useDbSync();
  const { showToast } = useToast();
  const posts = db.getAnnouncements();
  const allUsers = db.getUsers();
  const [statusTab, setStatusTab] = useState<'All' | 'Published' | 'Scheduled' | 'Draft' | 'Sent'>('All');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | AnnouncementPost['type']>('All');
  const [audienceFilter, setAudienceFilter] = useState<'All' | AnnouncementPost['audience']>('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<AnnouncementPost | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AnnouncementPost['type']>('Announcement');
  const [audience, setAudience] = useState<AnnouncementPost['audience']>('All Users');
  const [status, setStatus] = useState<AnnouncementPost['status']>('Published');

  const getAudienceReach = (aud: AnnouncementPost['audience']) => {
    if (aud === 'All Users') return allUsers.length;
    if (aud === 'Premium Users') {
      return allUsers.filter(u => u.planStatus === 'active' || u.role === 'admin').length;
    }
    return Math.min(allUsers.length, 1);
  };

  const totalRecipients = useMemo(
    () => posts.reduce((sum, p) => sum + (p.recipientsCount > 0 ? p.recipientsCount : getAudienceReach(p.audience)), 0),
    [posts, allUsers.length]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(p => {
      if (statusTab !== 'All' && p.status !== statusTab) return false;
      if (typeFilter !== 'All' && p.type !== typeFilter) return false;
      if (audienceFilter !== 'All' && p.audience !== audienceFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.message.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, statusTab, typeFilter, audienceFilter, search]);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setType('Announcement');
    setAudience('All Users');
    setStatus('Published');
    setModalOpen(true);
  };

  const openEdit = (post: AnnouncementPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setMessage(post.message);
    setType(post.type);
    setAudience(post.audience);
    setStatus(post.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Title and message are required.', 'error');
      return;
    }
    const recipientsCount = getAudienceReach(audience);

    db.saveAnnouncement({
      id: editingId || `ann_${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      audience,
      status,
      recipientsCount,
      thumbnailVariant: type === 'Announcement' ? 'bonus' : type === 'Update' ? 'tool' : 'maintenance',
    });
    setModalOpen(false);
    showToast(editingId ? 'Announcement updated!' : 'New announcement created!', 'success');
  };

  const handleDuplicate = (post: AnnouncementPost) => {
    db.saveAnnouncement({
      ...post,
      id: `ann_${Date.now()}`,
      title: `${post.title} (Copy)`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    });
    showToast('Duplicated post as Draft.', 'info');
  };

  const handleDelete = (id: string) => {
    db.deleteAnnouncement(id);
    showToast('Announcement deleted.', 'info');
  };

  const statusPill = (st: AnnouncementPost['status']) => {
    switch (st) {
      case 'Published':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Sent':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Scheduled':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Draft':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Announcements & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish updates, promo credit announcements, and platform notices to user dashboards.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-premium-vivid px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Posts</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">{posts.length}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">All Time</div>
          </div>
        </div>

        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Published Posts</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">
              {posts.filter(p => p.status === 'Published' || p.status === 'Sent').length}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">Live for Users</div>
          </div>
        </div>

        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Scheduled & Drafts</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">
              {posts.filter(p => p.status === 'Scheduled' || p.status === 'Draft').length}
            </div>
            <div className="text-[11px] text-amber-400 font-semibold">Pending Queue</div>
          </div>
        </div>

        <div className="oe-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Reach</div>
            <div className="text-2xl font-extrabold text-slate-100 font-mono">
              {totalRecipients.toLocaleString()}
            </div>
            <div className="text-[11px] text-cyan-300 font-semibold">Impressions</div>
          </div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="oe-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
          {(['All', 'Published', 'Scheduled', 'Draft', 'Sent'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusTab(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusTab === st
                  ? 'btn-premium-primary text-white'
                  : 'text-slate-400 hover:text-slate-100 bg-slate-950/50 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search announcements by title or message..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs text-slate-100"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'All' | AnnouncementPost['type'])}
              className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
            >
              <option value="All">All Types</option>
              <option value="Update">Update</option>
              <option value="Announcement">Announcement</option>
              <option value="Notice">Notice</option>
              <option value="Greeting">Greeting</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={audienceFilter}
              onChange={e => setAudienceFilter(e.target.value as 'All' | AnnouncementPost['audience'])}
              className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
            >
              <option value="All">All Audiences</option>
              <option value="All Users">All Users</option>
              <option value="Premium Users">Premium Users</option>
              <option value="Specific Users">Specific Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="oe-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              <tr>
                <th className="py-3.5 px-5">Title & Message</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Target Audience</th>
                <th className="py-3.5 px-4">Recipients</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(post => (
                <tr key={post.id}>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3 min-w-[260px]">
                      <img
                        src={announcementBonusBanner}
                        alt={post.title}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 truncate max-w-xs">{post.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {post.message}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-200 text-[10px] font-bold">
                      {post.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{post.audience}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-100">
                    {post.recipientsCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPill(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewPost(post)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 cursor-pointer"
                        title="View post"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="p-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 cursor-pointer"
                        title="Edit post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(post)}
                        className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
                        title="Duplicate post"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                        title="Delete post"
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

      {/* Create / Edit Post Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg oe-panel rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 20% Bonus Credits on Pro Plans"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write the announcement details shown to users..."
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AnnouncementPost['type'])}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Update">Update</option>
                  <option value="Notice">Notice</option>
                  <option value="Greeting">Greeting</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Audience</label>
                <select
                  value={audience}
                  onChange={e => setAudience(e.target.value as AnnouncementPost['audience'])}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                >
                  <option value="All Users">All Users</option>
                  <option value="Premium Users">Premium Users</option>
                  <option value="Specific Users">Specific Users</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as AnnouncementPost['status'])}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-100"
                >
                  <option value="Published">Published</option>
                  <option value="Sent">Sent</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
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
                <span>{editingId ? 'Save Post' : 'Publish Post'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md oe-panel rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={announcementBonusBanner}
              alt={previewPost.title}
              className="w-full h-40 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                  {previewPost.type}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPost(null)}
                  className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{previewPost.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{previewPost.message}</p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewPost(null)}
                  className="btn-premium-primary px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
