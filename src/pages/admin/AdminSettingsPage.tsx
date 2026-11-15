import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { db } from '../../services/db';
import {
  CpaNetwork,
  ProxySite,
  AntidetectBrowser,
  WebsiteContent,
} from '../../types';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Lock,
  Globe,
  Share2,
  Network,
  Server,
  Layers,
  Edit,
  X,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'content' | 'cpa' | 'proxies' | 'browsers' | 'security'>('content');

  // Website Content state
  const [content, setContent] = useState<WebsiteContent>(() => db.getWebsiteContent());

  // Resources state
  const [cpaNetworks, setCpaNetworks] = useState<CpaNetwork[]>(() => db.getCpaNetworks());
  const [proxySites, setProxySites] = useState<ProxySite[]>(() => db.getProxySites());
  const [browsers, setBrowsers] = useState<AntidetectBrowser[]>(() => db.getAntidetectBrowsers());

  // CPA Modal/Form
  const [cpaModalOpen, setCpaModalOpen] = useState(false);
  const [editingCpa, setEditingCpa] = useState<CpaNetwork | null>(null);

  // Proxy Modal/Form
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<ProxySite | null>(null);

  // Browser Modal/Form
  const [browserModalOpen, setBrowserModalOpen] = useState(false);
  const [editingBrowser, setEditingBrowser] = useState<AntidetectBrowser | null>(null);

  // Admin Master Password state
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Save Website Content
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateWebsiteContent(content);
    showToast('Website content updated successfully!', 'success');
  };

  // Seed Data Handler
  const handleSeedAll = () => {
    const res = db.seedCuratedDemoData();
    setCpaNetworks(db.getCpaNetworks());
    setProxySites(db.getProxySites());
    setBrowsers(db.getAntidetectBrowsers());
    showToast(`Successfully published ${res.cpaCount} CPA networks, ${res.proxyCount} proxy sites, and ${res.browserCount} browsers!`, 'success');
  };

  // Save CPA Network
  const handleSaveCpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCpa?.name || !editingCpa?.joinUrl) return;
    db.saveCpaNetwork(editingCpa);
    setCpaNetworks(db.getCpaNetworks());
    setCpaModalOpen(false);
    setEditingCpa(null);
    showToast('CPA network saved.', 'success');
  };

  // Delete CPA Network
  const handleDeleteCpa = (id: string) => {
    db.deleteCpaNetwork(id);
    setCpaNetworks(db.getCpaNetworks());
    showToast('CPA network removed.', 'info');
  };

  // Save Proxy Site
  const handleSaveProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProxy?.name || !editingProxy?.buyUrl) return;
    db.saveProxySite(editingProxy);
    setProxySites(db.getProxySites());
    setProxyModalOpen(false);
    setEditingProxy(null);
    showToast('Proxy provider saved.', 'success');
  };

  // Delete Proxy Site
  const handleDeleteProxy = (id: string) => {
    db.deleteProxySite(id);
    setProxySites(db.getProxySites());
    showToast('Proxy provider removed.', 'info');
  };

  // Save Browser
  const handleSaveBrowser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrowser?.name || !editingBrowser?.downloadUrl) return;
    db.saveAntidetectBrowser(editingBrowser);
    setBrowsers(db.getAntidetectBrowsers());
    setBrowserModalOpen(false);
    setEditingBrowser(null);
    showToast('Antidetect browser saved.', 'success');
  };

  // Delete Browser
  const handleDeleteBrowser = (id: string) => {
    db.deleteAntidetectBrowser(id);
    setBrowsers(db.getAntidetectBrowsers());
    showToast('Antidetect browser removed.', 'info');
  };

  // Update Master Password
  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    const res = await updateProfile({ newPassword: adminNewPassword });
    if (res.success) {
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      showToast('Admin Master Password updated successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update admin password.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <Settings className="w-4 h-4" />
            <span>Site CMS & Master Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Content & Resource Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Edit landing page text, manage referral URLs, configure social links, and update master security keys.
          </p>
        </div>

        <button
          onClick={handleSeedAll}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Publish Curated Default Catalogs</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Homepage & Socials</span>
        </button>

        <button
          onClick={() => setActiveTab('cpa')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'cpa'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>CPA Networks ({cpaNetworks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proxies')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'proxies'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Proxy Providers ({proxySites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('browsers')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'browsers'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Antidetect Browsers ({browsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Admin Security</span>
        </button>
      </div>

      {/* TAB 1: Content & Social Links */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Homepage Hero Section
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Hero Title Lead</label>
                <input
                  type="text"
                  required
                  value={content.heroTitle}
                  onChange={e => setContent({ ...content, heroTitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Hero Highlight (Gradient Text)</label>
                <input
                  type="text"
                  required
                  value={content.heroHighlight}
                  onChange={e => setContent({ ...content, heroHighlight: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1">Hero Description</label>
              <textarea
                rows={3}
                required
                value={content.heroDescription}
                onChange={e => setContent({ ...content, heroDescription: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              About Section & Footer Copy
            </h3>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">About Title</label>
                <input
                  type="text"
                  required
                  value={content.aboutTitle}
                  onChange={e => setContent({ ...content, aboutTitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">About Text</label>
                <textarea
                  rows={4}
                  required
                  value={content.aboutText}
                  onChange={e => setContent({ ...content, aboutText: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Footer Description</label>
                <textarea
                  rows={2}
                  required
                  value={content.footerDescription}
                  onChange={e => setContent({ ...content, footerDescription: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Contact Info & Social Links (Editable URLs)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Support Email</label>
                <input
                  type="email"
                  required
                  value={content.contactEmail}
                  onChange={e => setContent({ ...content, contactEmail: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={content.contactPhone}
                  onChange={e => setContent({ ...content, contactPhone: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Telegram Handle</label>
                <input
                  type="text"
                  required
                  value={content.contactTelegram}
                  onChange={e => setContent({ ...content, contactTelegram: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block text-slate-400 mb-1">Facebook URL</label>
                <input
                  type="url"
                  required
                  value={content.socialLinks.facebook}
                  onChange={e =>
                    setContent({
                      ...content,
                      socialLinks: { ...content.socialLinks, facebook: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Instagram URL</label>
                <input
                  type="url"
                  required
                  value={content.socialLinks.instagram}
                  onChange={e =>
                    setContent({
                      ...content,
                      socialLinks: { ...content.socialLinks, instagram: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">TikTok URL</label>
                <input
                  type="url"
                  required
                  value={content.socialLinks.tiktok}
                  onChange={e =>
                    setContent({
                      ...content,
                      socialLinks: { ...content.socialLinks, tiktok: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Telegram Channel Link</label>
                <input
                  type="url"
                  required
                  value={content.socialLinks.telegram}
                  onChange={e =>
                    setContent({
                      ...content,
                      socialLinks: { ...content.socialLinks, telegram: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Content Updates</span>
          </button>
        </form>
      )}

      {/* TAB 2: CPA Networks Management */}
      {activeTab === 'cpa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">CPA Networks Catalog</h3>
              <p className="text-xs text-slate-400">
                Manage the public directory of affiliate networks and signup links.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCpa({
                  id: 'cpa_' + Date.now(),
                  name: '',
                  type: 'CPA / CPL Network',
                  minPayment: '$50',
                  description: '',
                  joinUrl: 'https://',
                });
                setCpaModalOpen(true);
              }}
              className="py-2 px-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add CPA Network</span>
            </button>
          </div>

          {cpaNetworks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
              <Network className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
              <p>No CPA networks listed. Add one or click 'Publish Curated Default Catalogs' above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cpaNetworks.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                        {item.minPayment}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-400 font-semibold block">{item.type}</span>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{item.joinUrl}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingCpa(item);
                        setCpaModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Network"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCpa(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Network"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CPA Edit/Add Modal */}
          {cpaModalOpen && editingCpa && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-white">
                    {editingCpa.id ? 'Edit CPA Network' : 'Add CPA Network'}
                  </h4>
                  <button onClick={() => setCpaModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveCpa} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Network Name</label>
                    <input
                      type="text"
                      required
                      value={editingCpa.name}
                      onChange={e => setEditingCpa({ ...editingCpa, name: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Network Type</label>
                    <input
                      type="text"
                      required
                      value={editingCpa.type}
                      onChange={e => setEditingCpa({ ...editingCpa, type: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Minimum Payment</label>
                    <input
                      type="text"
                      required
                      value={editingCpa.minPayment}
                      onChange={e => setEditingCpa({ ...editingCpa, minPayment: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Short Description</label>
                    <textarea
                      rows={3}
                      required
                      value={editingCpa.description}
                      onChange={e => setEditingCpa({ ...editingCpa, description: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Join Network URL</label>
                    <input
                      type="url"
                      required
                      value={editingCpa.joinUrl}
                      onChange={e => setEditingCpa({ ...editingCpa, joinUrl: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCpaModalOpen(false)}
                      className="py-2 px-3 rounded-lg border border-slate-700 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold">
                      Save Network
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Proxy Sites Management */}
      {activeTab === 'proxies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Proxy Sites Catalog</h3>
              <p className="text-xs text-slate-400">
                Manage proxy provider cards and purchase affiliate links.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProxy({
                  id: 'prx_' + Date.now(),
                  name: '',
                  validity: '30 Days',
                  traffic: 'Unlimited GB',
                  price: 'From $5.00 / GB',
                  buyUrl: 'https://',
                });
                setProxyModalOpen(true);
              }}
              className="py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Proxy Provider</span>
            </button>
          </div>

          {proxySites.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
              <Server className="w-8 h-8 mx-auto opacity-30 text-emerald-500" />
              <p>No proxy sites listed. Add one or click 'Publish Curated Default Catalogs' above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proxySites.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                        {item.price}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <p>Validity: <strong className="text-white">{item.validity}</strong></p>
                      <p>Traffic: <strong className="text-white">{item.traffic}</strong></p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{item.buyUrl}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingProxy(item);
                        setProxyModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProxy(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Proxy Modal */}
          {proxyModalOpen && editingProxy && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-white">Proxy Provider Details</h4>
                  <button onClick={() => setProxyModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveProxy} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Provider Name</label>
                    <input
                      type="text"
                      required
                      value={editingProxy.name}
                      onChange={e => setEditingProxy({ ...editingProxy, name: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Validity</label>
                    <input
                      type="text"
                      required
                      value={editingProxy.validity}
                      onChange={e => setEditingProxy({ ...editingProxy, validity: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">GB / Traffic Information</label>
                    <input
                      type="text"
                      required
                      value={editingProxy.traffic}
                      onChange={e => setEditingProxy({ ...editingProxy, traffic: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Price</label>
                    <input
                      type="text"
                      required
                      value={editingProxy.price}
                      onChange={e => setEditingProxy({ ...editingProxy, price: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Buy Proxy URL</label>
                    <input
                      type="url"
                      required
                      value={editingProxy.buyUrl}
                      onChange={e => setEditingProxy({ ...editingProxy, buyUrl: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setProxyModalOpen(false)}
                      className="py-2 px-3 rounded-lg border border-slate-700 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="py-2 px-4 rounded-lg bg-emerald-600 text-white font-bold">
                      Save Proxy Provider
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Antidetect Browsers Management */}
      {activeTab === 'browsers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Antidetect Browsers Catalog</h3>
              <p className="text-xs text-slate-400">
                Manage recommended browsers and official download URLs.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBrowser({
                  id: 'adb_' + Date.now(),
                  name: '',
                  description: '',
                  downloadUrl: 'https://',
                });
                setBrowserModalOpen(true);
              }}
              className="py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Browser</span>
            </button>
          </div>

          {browsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/60 space-y-2">
              <Layers className="w-8 h-8 mx-auto opacity-30 text-indigo-500" />
              <p>No antidetect browsers listed. Add one or click 'Publish Curated Default Catalogs' above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {browsers.map(item => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{item.downloadUrl}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingBrowser(item);
                        setBrowserModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrowser(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Browser Modal */}
          {browserModalOpen && editingBrowser && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-white">Browser Configuration</h4>
                  <button onClick={() => setBrowserModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveBrowser} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Browser Name</label>
                    <input
                      type="text"
                      required
                      value={editingBrowser.name}
                      onChange={e => setEditingBrowser({ ...editingBrowser, name: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Short Description</label>
                    <textarea
                      rows={3}
                      required
                      value={editingBrowser.description}
                      onChange={e => setEditingBrowser({ ...editingBrowser, description: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Download URL</label>
                    <input
                      type="url"
                      required
                      value={editingBrowser.downloadUrl}
                      onChange={e => setEditingBrowser({ ...editingBrowser, downloadUrl: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBrowserModalOpen(false)}
                      className="py-2 px-3 rounded-lg border border-slate-700 text-slate-300"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="py-2 px-4 rounded-lg bg-indigo-600 text-white font-bold">
                      Save Browser
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Admin Security & Master Password */}
      {activeTab === 'security' && (
        <div className="max-w-xl space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Master Admin Password Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Update the master administrator credentials. Passwords are securely digested with SHA-256 + cryptographic salt.
            </p>

            <form onSubmit={handleUpdateAdminPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Master Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={e => setAdminNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Confirm Master Password</label>
                <input
                  type="password"
                  required
                  value={adminConfirmPassword}
                  onChange={e => setAdminConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer"
              >
                Update Admin Master Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
