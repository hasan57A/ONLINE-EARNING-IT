import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDbSync } from '../../hooks/useDbSync';
import { db } from '../../services/db';
import { playUiSound } from '../../services/sound';
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
  Network,
  Server,
  Layers,
  Edit,
  X,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const dbTick = useDbSync();
  const { updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'content' | 'cpa' | 'proxies' | 'browsers' | 'security'>('content');

  const [content, setContent] = useState<WebsiteContent>(() => db.getWebsiteContent());
  const cpaNetworks = db.getCpaNetworks();
  const proxySites = db.getProxySites();
  const browsers = db.getAntidetectBrowsers();

  useEffect(() => {
    setContent(db.getWebsiteContent());
  }, [dbTick]);

  const [cpaModalOpen, setCpaModalOpen] = useState(false);
  const [editingCpa, setEditingCpa] = useState<CpaNetwork | null>(null);

  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<ProxySite | null>(null);

  const [browserModalOpen, setBrowserModalOpen] = useState(false);
  const [editingBrowser, setEditingBrowser] = useState<AntidetectBrowser | null>(null);

  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateWebsiteContent(content);
    playUiSound('click');
    showToast('Website content updated successfully!', 'success');
  };

  const handleSeedAll = () => {
    const res = db.seedCuratedDemoData();
    playUiSound('generate');
    showToast(
      `Successfully published ${res.cpaCount} CPA networks, ${res.proxyCount} proxy sites, and ${res.browserCount} browsers!`,
      'success'
    );
  };

  const handleSaveCpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCpa?.name || !editingCpa?.joinUrl) return;
    db.saveCpaNetwork(editingCpa);
    setCpaModalOpen(false);
    setEditingCpa(null);
    playUiSound('click');
    showToast('CPA network saved.', 'success');
  };

  const handleDeleteCpa = (id: string) => {
    db.deleteCpaNetwork(id);
    showToast('CPA network removed.', 'info');
  };

  const handleSaveProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProxy?.name || !editingProxy?.buyUrl) return;
    db.saveProxySite(editingProxy);
    setProxyModalOpen(false);
    setEditingProxy(null);
    playUiSound('click');
    showToast('Proxy provider saved.', 'success');
  };

  const handleDeleteProxy = (id: string) => {
    db.deleteProxySite(id);
    showToast('Proxy provider removed.', 'info');
  };

  const handleSaveBrowser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrowser?.name || !editingBrowser?.downloadUrl) return;
    db.saveAntidetectBrowser(editingBrowser);
    setBrowserModalOpen(false);
    setEditingBrowser(null);
    playUiSound('click');
    showToast('Antidetect browser saved.', 'success');
  };

  const handleDeleteBrowser = (id: string) => {
    db.deleteAntidetectBrowser(id);
    showToast('Antidetect browser removed.', 'info');
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
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
      playUiSound('click');
      showToast('Admin Master Password updated successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update admin password.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Settings className="w-4 h-4" />
            <span>Site CMS & Master Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Content & Resource Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Edit landing page copy, manage referral URLs, configure social links, and update master security keys.
          </p>
        </div>

        <button
          onClick={handleSeedAll}
          className="btn-premium-vivid py-2.5 px-4 rounded-xl text-xs inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Publish Default Catalogs</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'content' as const, label: 'Homepage & Socials', icon: Globe },
          { key: 'cpa' as const, label: `CPA Networks (${cpaNetworks.length})`, icon: Network },
          { key: 'proxies' as const, label: `Proxy Providers (${proxySites.length})`, icon: Server },
          { key: 'browsers' as const, label: `Antidetect Browsers (${browsers.length})`, icon: Layers },
          { key: 'security' as const, label: 'Admin Security', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                active ? 'btn-premium-primary' : 'btn-premium-glass text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'content' && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="oe-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Hero Highlight (Gradient Text)</label>
                <input
                  type="text"
                  required
                  value={content.heroHighlight}
                  onChange={e => setContent({ ...content, heroHighlight: e.target.value })}
                  className="w-full p-2.5 rounded-xl border text-slate-100"
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
                className="w-full p-2.5 rounded-xl border text-slate-100 leading-relaxed"
              />
            </div>
          </div>

          <div className="oe-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">About Text</label>
                <textarea
                  rows={4}
                  required
                  value={content.aboutText}
                  onChange={e => setContent({ ...content, aboutText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border text-slate-100 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Footer Description</label>
                <textarea
                  rows={2}
                  required
                  value={content.footerDescription}
                  onChange={e => setContent({ ...content, footerDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border text-slate-100 leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="oe-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">
              Contact Info & Social Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Support Email</label>
                <input
                  type="email"
                  required
                  value={content.contactEmail}
                  onChange={e => setContent({ ...content, contactEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={content.contactPhone}
                  onChange={e => setContent({ ...content, contactPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Telegram Handle</label>
                <input
                  type="text"
                  required
                  value={content.contactTelegram}
                  onChange={e => setContent({ ...content, contactTelegram: e.target.value })}
                  className="w-full p-2.5 rounded-xl border text-slate-100"
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
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
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-premium-vivid py-3 px-6 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Content Updates</span>
          </button>
        </form>
      )}

      {activeTab === 'cpa' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">CPA Networks Catalog</h3>
              <p className="text-xs text-slate-400">Manage affiliate networks and signup links.</p>
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
              className="btn-premium-primary py-2 px-3.5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add CPA Network</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cpaNetworks.map(item => (
              <div key={item.id} className="oe-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                      {item.minPayment}
                    </span>
                  </div>
                  <span className="text-[11px] text-violet-400 font-semibold block">{item.type}</span>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{item.joinUrl}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setEditingCpa(item);
                      setCpaModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCpa(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cpaModalOpen && editingCpa && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="oe-panel oe-rgb-violet max-w-md w-full p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-sm font-bold text-slate-100">CPA Network Details</h4>
                  <button onClick={() => setCpaModalOpen(false)} className="text-slate-400 hover:text-slate-100 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveCpa} className="space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    value={editingCpa.name}
                    onChange={e => setEditingCpa({ ...editingCpa, name: e.target.value })}
                    placeholder="Network Name"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={editingCpa.type}
                    onChange={e => setEditingCpa({ ...editingCpa, type: e.target.value })}
                    placeholder="Type"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={editingCpa.minPayment}
                    onChange={e => setEditingCpa({ ...editingCpa, minPayment: e.target.value })}
                    placeholder="Minimum Payment"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <textarea
                    rows={3}
                    required
                    value={editingCpa.description}
                    onChange={e => setEditingCpa({ ...editingCpa, description: e.target.value })}
                    placeholder="Description"
                    className="w-full p-2.5 rounded-xl border text-slate-100 resize-none"
                  />
                  <input
                    type="url"
                    required
                    value={editingCpa.joinUrl}
                    onChange={e => setEditingCpa({ ...editingCpa, joinUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border text-slate-100 font-mono"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setCpaModalOpen(false)} className="btn-premium-glass py-2 px-3 rounded-xl cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" className="btn-premium-primary py-2 px-4 rounded-xl cursor-pointer">
                      Save Network
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'proxies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Proxy Sites Catalog</h3>
              <p className="text-xs text-slate-400">Manage proxy provider cards and purchase links.</p>
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
              className="btn-premium-emerald py-2 px-3.5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Proxy Provider</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proxySites.map(item => (
              <div key={item.id} className="oe-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {item.validity} · {item.traffic}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{item.buyUrl}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setEditingProxy(item);
                      setProxyModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProxy(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {proxyModalOpen && editingProxy && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="oe-panel oe-rgb-emerald max-w-md w-full p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-sm font-bold text-slate-100">Proxy Provider Details</h4>
                  <button onClick={() => setProxyModalOpen(false)} className="text-slate-400 hover:text-slate-100 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveProxy} className="space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    value={editingProxy.name}
                    onChange={e => setEditingProxy({ ...editingProxy, name: e.target.value })}
                    placeholder="Provider Name"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={editingProxy.validity}
                    onChange={e => setEditingProxy({ ...editingProxy, validity: e.target.value })}
                    placeholder="Validity"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={editingProxy.traffic}
                    onChange={e => setEditingProxy({ ...editingProxy, traffic: e.target.value })}
                    placeholder="Traffic Info"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={editingProxy.price}
                    onChange={e => setEditingProxy({ ...editingProxy, price: e.target.value })}
                    placeholder="Price"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <input
                    type="url"
                    required
                    value={editingProxy.buyUrl}
                    onChange={e => setEditingProxy({ ...editingProxy, buyUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border text-slate-100 font-mono"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setProxyModalOpen(false)} className="btn-premium-glass py-2 px-3 rounded-xl cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" className="btn-premium-emerald py-2 px-4 rounded-xl cursor-pointer">
                      Save Proxy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'browsers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Antidetect Browsers Catalog</h3>
              <p className="text-xs text-slate-400">Manage recommended browsers and official download URLs.</p>
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
              className="btn-premium-primary py-2 px-3.5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Browser</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {browsers.map(item => (
              <div key={item.id} className="oe-panel p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                  <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{item.downloadUrl}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setEditingBrowser(item);
                      setBrowserModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBrowser(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {browserModalOpen && editingBrowser && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="oe-panel oe-rgb-violet max-w-md w-full p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-sm font-bold text-slate-100">Browser Configuration</h4>
                  <button onClick={() => setBrowserModalOpen(false)} className="text-slate-400 hover:text-slate-100 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveBrowser} className="space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    value={editingBrowser.name}
                    onChange={e => setEditingBrowser({ ...editingBrowser, name: e.target.value })}
                    placeholder="Browser Name"
                    className="w-full p-2.5 rounded-xl border text-slate-100"
                  />
                  <textarea
                    rows={3}
                    required
                    value={editingBrowser.description}
                    onChange={e => setEditingBrowser({ ...editingBrowser, description: e.target.value })}
                    placeholder="Description"
                    className="w-full p-2.5 rounded-xl border text-slate-100 resize-none"
                  />
                  <input
                    type="url"
                    required
                    value={editingBrowser.downloadUrl}
                    onChange={e => setEditingBrowser({ ...editingBrowser, downloadUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border text-slate-100 font-mono"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setBrowserModalOpen(false)} className="btn-premium-glass py-2 px-3 rounded-xl cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" className="btn-premium-primary py-2 px-4 rounded-xl cursor-pointer">
                      Save Browser
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-xl">
          <div className="oe-panel oe-rgb-amber p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-3">
              Master Admin Password Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Update the master administrator credentials. Passwords are digested with SHA-256 + cryptographic salt.
            </p>
            <form onSubmit={handleUpdateAdminPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">New Master Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={e => setAdminNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Confirm Master Password</label>
                <input
                  type="password"
                  required
                  value={adminConfirmPassword}
                  onChange={e => setAdminConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 rounded-xl border text-slate-100"
                />
              </div>
              <button
                type="submit"
                className="btn-premium-vivid w-full py-2.5 rounded-xl text-xs cursor-pointer"
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
