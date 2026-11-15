import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, clampStr, sanitizeId } from '../lib/supabase';
import {
  User,
  ToolItem,
  UserAgentEntry,
  LeadEntry,
  NumberEntry,
  MailEntry,
  CpaNetwork,
  ProxySite,
  AntidetectBrowser,
  SupportTicket,
  SupportChatMessage,
  UsageHistoryEntry,
  SavedResult,
  WebsiteContent,
  PaymentGatewaySettings,
  PaymentRequest,
} from '../types';

export interface SyncCallbacks {
  onTools: (tools: ToolItem[]) => void;
  onWebsiteContent: (content: WebsiteContent) => void;
  onPaymentGateways: (settings: PaymentGatewaySettings) => void;
  onCpaNetworks: (items: CpaNetwork[]) => void;
  onProxySites: (items: ProxySite[]) => void;
  onAntidetectBrowsers: (items: AntidetectBrowser[]) => void;
  onUsers: (users: User[], replaceAll: boolean) => void;
  onUaPool: (items: UserAgentEntry[]) => void;
  onLeadsPool: (items: LeadEntry[]) => void;
  onNumbersPool: (items: NumberEntry[]) => void;
  onMailsPool: (items: MailEntry[]) => void;
  onPaymentRequests: (items: PaymentRequest[]) => void;
  onUsageHistory: (items: UsageHistoryEntry[]) => void;
  onSavedResults: (items: SavedResult[]) => void;
  onSupportTickets: (items: SupportTicket[]) => void;
}

class SupabaseSyncService {
  private publicChannel: RealtimeChannel | null = null;
  private userChannel: RealtimeChannel | null = null;
  private callbacks: SyncCallbacks | null = null;
  private syncedUid: string | null = null;
  private activeEmail: string | null = null;

  public registerCallbacks(cb: SyncCallbacks) {
    this.callbacks = cb;
  }

  public isConnected(): boolean {
    return Boolean(isSupabaseConfigured && supabase && this.syncedUid);
  }

  private async fetchPublicTools() {
    if (!supabase || !this.callbacks) return;
    const { data, error } = await supabase.from('tools').select('*');
    if (error || !data || data.length === 0) return;
    const list: ToolItem[] = data.map(row => ({
      id: String(row.id),
      name: String(row.name || ''),
      slug: String(row.slug || ''),
      description: String(row.description || ''),
      category: String(row.category || ''),
      enabled: Boolean(row.enabled),
      iconName: String(row.icon_name || 'Wrench'),
    }));
    this.callbacks.onTools(list);
  }

  private async fetchWebsiteContent() {
    if (!supabase || !this.callbacks) return;
    const { data, error } = await supabase
      .from('site_config')
      .select('data')
      .eq('key', 'websiteContent')
      .maybeSingle();
    if (error || !data?.data) return;
    const d = data.data as Record<string, unknown>;
    const social = (d.socialLinks as Record<string, unknown>) || {};
    this.callbacks.onWebsiteContent({
      heroTitle: String(d.heroTitle || ''),
      heroHighlight: String(d.heroHighlight || ''),
      heroDescription: String(d.heroDescription || ''),
      aboutTitle: String(d.aboutTitle || ''),
      aboutText: String(d.aboutText || ''),
      contactEmail: String(d.contactEmail || ''),
      contactPhone: String(d.contactPhone || ''),
      contactTelegram: String(d.contactTelegram || ''),
      socialLinks: {
        facebook: String(social.facebook || ''),
        instagram: String(social.instagram || ''),
        tiktok: String(social.tiktok || ''),
        telegram: String(social.telegram || ''),
      },
      footerDescription: String(d.footerDescription || ''),
    });
  }

  public startPublicListeners() {
    this.stopPublicListeners();
    if (!isSupabaseConfigured || !supabase) return;

    void this.fetchPublicTools();
    void this.fetchWebsiteContent();

    this.publicChannel = supabase
      .channel('public-site-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
        void this.fetchPublicTools();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, () => {
        void this.fetchWebsiteContent();
      })
      .subscribe();
  }

  public stopPublicListeners() {
    if (supabase && this.publicChannel) {
      void supabase.removeChannel(this.publicChannel);
    }
    this.publicChannel = null;
  }

  public stopUserListeners() {
    if (supabase && this.userChannel) {
      void supabase.removeChannel(this.userChannel);
    }
    this.userChannel = null;
    this.syncedUid = null;
    this.activeEmail = null;
  }

  private mapUserRow(row: Record<string, unknown>): User {
    return {
      id: String(row.id || ''),
      fullName: String(row.full_name || ''),
      username: row.username ? String(row.username) : undefined,
      mobile: String(row.mobile || ''),
      gmail: String(row.gmail || ''),
      telegramUsername: row.telegram_username ? String(row.telegram_username) : undefined,
      passwordHash: '',
      salt: '',
      role: row.role === 'admin' ? 'admin' : 'user',
      status: row.status === 'deactivated' ? 'deactivated' : 'active',
      plan: row.plan ? String(row.plan) : undefined,
      planStatus: (row.plan_status as User['planStatus']) || 'none',
      credits: typeof row.credits === 'number' ? row.credits : Number(row.credits || 0),
      usedCredits: typeof row.used_credits === 'number' ? row.used_credits : Number(row.used_credits || 0),
      planUpdatedAt: row.plan_updated_at ? String(row.plan_updated_at) : undefined,
      emailVerified: row.email_verified !== undefined ? Boolean(row.email_verified) : true,
      telegramVerified: row.telegram_verified !== undefined ? Boolean(row.telegram_verified) : false,
      phoneVerified: row.phone_verified !== undefined ? Boolean(row.phone_verified) : false,
      twoFactorEnabled: row.two_factor_enabled !== undefined ? Boolean(row.two_factor_enabled) : false,
      adminNote: row.admin_note ? String(row.admin_note) : undefined,
      lastLoginAt: row.last_login_at ? String(row.last_login_at) : undefined,
      createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
      updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    };
  }

  private async fetchResourcesAndConfig() {
    if (!supabase || !this.callbacks) return;

    const [cpaRes, proxyRes, adbRes, pgRes] = await Promise.all([
      supabase.from('cpa_networks').select('*'),
      supabase.from('proxy_sites').select('*'),
      supabase.from('antidetect_browsers').select('*'),
      supabase.from('site_config').select('data').eq('key', 'paymentGateways').maybeSingle(),
    ]);

    if (!cpaRes.error && cpaRes.data && cpaRes.data.length > 0) {
      this.callbacks.onCpaNetworks(
        cpaRes.data.map(r => ({
          id: String(r.id),
          name: String(r.name || ''),
          type: String(r.type || ''),
          minPayment: String(r.min_payment || ''),
          description: String(r.description || ''),
          joinUrl: String(r.join_url || ''),
        }))
      );
    }

    if (!proxyRes.error && proxyRes.data && proxyRes.data.length > 0) {
      this.callbacks.onProxySites(
        proxyRes.data.map(r => ({
          id: String(r.id),
          name: String(r.name || ''),
          validity: String(r.validity || ''),
          traffic: String(r.traffic || ''),
          price: String(r.price || ''),
          buyUrl: String(r.buy_url || ''),
        }))
      );
    }

    if (!adbRes.error && adbRes.data && adbRes.data.length > 0) {
      this.callbacks.onAntidetectBrowsers(
        adbRes.data.map(r => ({
          id: String(r.id),
          name: String(r.name || ''),
          description: String(r.description || ''),
          downloadUrl: String(r.download_url || ''),
        }))
      );
    }

    if (!pgRes.error && pgRes.data?.data) {
      const d = pgRes.data.data as Record<string, unknown>;
      this.callbacks.onPaymentGateways({
        bkashNumber: String(d.bkashNumber || ''),
        bkashType: String(d.bkashType || ''),
        nagadNumber: String(d.nagadNumber || ''),
        nagadType: String(d.nagadType || ''),
        rocketNumber: String(d.rocketNumber || ''),
        rocketType: String(d.rocketType || ''),
        binancePayId: String(d.binancePayId || ''),
        binanceTrc20Address: String(d.binanceTrc20Address || ''),
        binanceBep20Address: String(d.binanceBep20Address || ''),
        instructionsNote: String(d.instructionsNote || ''),
      });
    }
  }

  private async fetchUsersData(uid: string, isAdmin: boolean) {
    if (!supabase || !this.callbacks) return;
    if (isAdmin) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        this.callbacks.onUsers(data.map(r => this.mapUserRow(r)), true);
      }
    } else {
      const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
      if (!error && data) {
        this.callbacks.onUsers([this.mapUserRow(data)], false);
      }
    }
  }

  private async fetchPoolsData(isAdmin: boolean) {
    if (!supabase || !this.callbacks) return;

    const uaQuery = isAdmin ? supabase.from('ua_pool').select('*') : supabase.from('ua_pool').select('*').eq('used', false);
    const leadsQuery = isAdmin ? supabase.from('leads_pool').select('*') : supabase.from('leads_pool').select('*').eq('used', false);
    const numbersQuery = isAdmin ? supabase.from('numbers_pool').select('*') : supabase.from('numbers_pool').select('*').eq('used', false);
    const mailsQuery = isAdmin ? supabase.from('mails_pool').select('*') : supabase.from('mails_pool').select('*').eq('used', false);

    const [uaRes, leadsRes, numRes, mailRes] = await Promise.all([uaQuery, leadsQuery, numbersQuery, mailsQuery]);

    if (!uaRes.error && uaRes.data) {
      this.callbacks.onUaPool(
        uaRes.data.map(r => ({
          id: String(r.id),
          device: r.device,
          browser: r.browser,
          inAppBrowser: r.in_app_browser,
          country: String(r.country || ''),
          userAgentString: String(r.user_agent_string || ''),
          used: Boolean(r.used),
          usedBy: r.used_by ? String(r.used_by) : undefined,
          usedAt: r.used_at ? String(r.used_at) : undefined,
          createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
        }))
      );
    }

    if (!leadsRes.error && leadsRes.data) {
      this.callbacks.onLeadsPool(
        leadsRes.data.map(r => ({
          id: String(r.id),
          fullName: String(r.full_name || ''),
          gender: r.gender,
          gmail: String(r.gmail || ''),
          phoneNumber: String(r.phone_number || ''),
          country: String(r.country || ''),
          used: Boolean(r.used),
          usedBy: r.used_by ? String(r.used_by) : undefined,
          usedAt: r.used_at ? String(r.used_at) : undefined,
          createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
        }))
      );
    }

    if (!numRes.error && numRes.data) {
      this.callbacks.onNumbersPool(
        numRes.data.map(r => ({
          id: String(r.id),
          country: String(r.country || ''),
          phoneNumber: String(r.phone_number || ''),
          used: Boolean(r.used),
          usedBy: r.used_by ? String(r.used_by) : undefined,
          usedAt: r.used_at ? String(r.used_at) : undefined,
          createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
        }))
      );
    }

    if (!mailRes.error && mailRes.data) {
      this.callbacks.onMailsPool(
        mailRes.data.map(r => ({
          id: String(r.id),
          country: String(r.country || ''),
          email: String(r.email || ''),
          used: Boolean(r.used),
          usedBy: r.used_by ? String(r.used_by) : undefined,
          usedAt: r.used_at ? String(r.used_at) : undefined,
          createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
        }))
      );
    }
  }

  private async fetchUserActivityData(uid: string, isAdmin: boolean) {
    if (!supabase || !this.callbacks) return;

    const payQ = isAdmin
      ? supabase.from('payment_requests').select('*').order('created_at', { ascending: false })
      : supabase.from('payment_requests').select('*').eq('user_id', uid).order('created_at', { ascending: false });

    const histQ = isAdmin
      ? supabase.from('usage_history').select('*').order('created_at', { ascending: false })
      : supabase.from('usage_history').select('*').eq('user_id', uid).order('created_at', { ascending: false });

    const savedQ = isAdmin
      ? supabase.from('saved_results').select('*').order('created_at', { ascending: false })
      : supabase.from('saved_results').select('*').eq('user_id', uid).order('created_at', { ascending: false });

    const ticketQ = isAdmin
      ? supabase.from('support_tickets').select('*').order('updated_at', { ascending: false })
      : supabase.from('support_tickets').select('*').eq('user_id', uid).order('updated_at', { ascending: false });

    const msgQ = isAdmin
      ? supabase.from('support_messages').select('*').order('created_at', { ascending: true })
      : supabase.from('support_messages').select('*').eq('ticket_owner_id', uid).order('created_at', { ascending: true });

    const [payRes, histRes, savedRes, ticketRes, msgRes] = await Promise.all([payQ, histQ, savedQ, ticketQ, msgQ]);

    if (!payRes.error && payRes.data) {
      this.callbacks.onPaymentRequests(
        payRes.data.map(r => ({
          id: String(r.id),
          userId: String(r.user_id || ''),
          userName: String(r.user_name || ''),
          userEmail: String(r.user_email || ''),
          packageId: String(r.package_id || ''),
          packageName: String(r.package_name || ''),
          packageCredits: r.package_credits !== null && r.package_credits !== undefined ? Number(r.package_credits) : undefined,
          method: r.method,
          currency: r.currency,
          amount: Number(r.amount || 0),
          senderAccount: String(r.sender_account || ''),
          transactionId: String(r.transaction_id || ''),
          note: r.note ? String(r.note) : '',
          status: r.status,
          adminNote: r.admin_note ? String(r.admin_note) : undefined,
          reviewedBy: r.reviewed_by ? String(r.reviewed_by) : undefined,
          reviewedAt: r.reviewed_at ? String(r.reviewed_at) : undefined,
          createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
        }))
      );
    }

    if (!histRes.error && histRes.data) {
      this.callbacks.onUsageHistory(
        histRes.data.map(r => ({
          id: String(r.id),
          userId: String(r.user_id || ''),
          toolSlug: String(r.tool_slug || ''),
          toolName: String(r.tool_name || ''),
          date: String(r.date || ''),
          time: String(r.time || ''),
          resultCount: Number(r.result_count || 0),
          status: r.status,
          summary: r.summary ? String(r.summary) : undefined,
        }))
      );
    }

    if (!savedRes.error && savedRes.data) {
      this.callbacks.onSavedResults(
        savedRes.data.map(r => ({
          id: String(r.id),
          userId: String(r.user_id || ''),
          toolSlug: String(r.tool_slug || ''),
          toolName: String(r.tool_name || ''),
          title: String(r.title || ''),
          resultsText: String(r.results_text || ''),
          count: Number(r.count || 0),
          savedDate: String(r.saved_date || ''),
        }))
      );
    }

    if (!ticketRes.error && ticketRes.data) {
      const messagesByTicket = new Map<string, SupportChatMessage[]>();
      if (!msgRes.error && msgRes.data) {
        msgRes.data.forEach(m => {
          const tid = String(m.ticket_id);
          const list = messagesByTicket.get(tid) || [];
          list.push({
            id: String(m.id),
            sender: m.sender,
            senderName: String(m.sender_name || ''),
            text: String(m.text || ''),
            timestamp: String(m.timestamp || ''),
          });
          messagesByTicket.set(tid, list);
        });
      }

      const tickets: SupportTicket[] = ticketRes.data.map(t => ({
        id: String(t.id),
        userId: String(t.user_id || ''),
        userName: String(t.user_name || ''),
        userEmail: String(t.user_email || ''),
        subject: String(t.subject || ''),
        status: t.status,
        adminNote: t.admin_note ? String(t.admin_note) : undefined,
        createdAt: t.created_at ? String(t.created_at) : new Date().toISOString(),
        updatedAt: t.updated_at ? String(t.updated_at) : new Date().toISOString(),
        messages: messagesByTicket.get(String(t.id)) || [],
      }));
      this.callbacks.onSupportTickets(tickets);
    }
  }

  public startUserListeners(uid: string, isAdmin: boolean) {
    if (!isSupabaseConfigured || !supabase) return;
    if (this.syncedUid === uid) return;

    this.stopUserListeners();
    this.syncedUid = uid;

    void this.fetchResourcesAndConfig();
    void this.fetchUsersData(uid, isAdmin);
    void this.fetchPoolsData(isAdmin);
    void this.fetchUserActivityData(uid, isAdmin);

    this.userChannel = supabase
      .channel(`user-sync-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        void this.fetchUsersData(uid, isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cpa_networks' }, () => {
        void this.fetchResourcesAndConfig();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proxy_sites' }, () => {
        void this.fetchResourcesAndConfig();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'antidetect_browsers' }, () => {
        void this.fetchResourcesAndConfig();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_config' }, () => {
        void this.fetchResourcesAndConfig();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ua_pool' }, () => {
        void this.fetchPoolsData(isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads_pool' }, () => {
        void this.fetchPoolsData(isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'numbers_pool' }, () => {
        void this.fetchPoolsData(isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mails_pool' }, () => {
        void this.fetchPoolsData(isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, () => {
        void this.fetchUserActivityData(uid, isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usage_history' }, () => {
        void this.fetchUserActivityData(uid, isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_results' }, () => {
        void this.fetchUserActivityData(uid, isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        void this.fetchUserActivityData(uid, isAdmin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
        void this.fetchUserActivityData(uid, isAdmin);
      })
      .subscribe();
  }

  // --- Auth User Provisioning in Supabase ---
  public async syncSupabaseAuthenticatedUser(
    uid: string,
    email: string,
    displayName: string,
    adminEmails: string[]
  ): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerAdmin = adminEmails.includes(cleanEmail);
    const cleanUid = sanitizeId(uid);
    this.activeEmail = cleanEmail;

    const fallbackUser: User = {
      id: cleanUid,
      fullName: clampStr(displayName.trim() || cleanEmail.split('@')[0], 120),
      mobile: '',
      gmail: clampStr(cleanEmail, 160),
      passwordHash: '',
      salt: '',
      role: isOwnerAdmin ? 'admin' : 'user',
      status: 'active',
      planStatus: 'none',
      credits: 0,
      createdAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured || !supabase) return fallbackUser;

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', cleanUid)
        .maybeSingle();

      if (fetchErr) {
        console.error('Supabase user lookup error:', fetchErr.message);
        return fallbackUser;
      }

      if (!existing) {
        const insertPayload = {
          id: cleanUid,
          full_name: fallbackUser.fullName,
          mobile: '',
          gmail: fallbackUser.gmail,
          role: isOwnerAdmin ? 'admin' : 'user',
          status: 'active',
          plan_status: 'none',
          credits: 0,
        };
        const { data: inserted, error: insertErr } = await supabase
          .from('users')
          .upsert(insertPayload, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (insertErr) {
          console.error('Supabase user insert error:', insertErr.message);
          return fallbackUser;
        }
        return inserted ? this.mapUserRow(inserted) : fallbackUser;
      }

      if (isOwnerAdmin && (existing.role !== 'admin' || existing.status !== 'active')) {
        const { data: updated, error: updateErr } = await supabase
          .from('users')
          .update({ role: 'admin', status: 'active' })
          .eq('id', cleanUid)
          .select()
          .maybeSingle();
        if (!updateErr && updated) {
          return this.mapUserRow(updated);
        }
      }

      return this.mapUserRow(existing);
    } catch (err) {
      console.error('Supabase user sync failed:', err);
      return fallbackUser;
    }
  }

  public async bootstrapAdminDefaults(defaults: {
    tools: ToolItem[];
    websiteContent: WebsiteContent;
    paymentGateways: PaymentGatewaySettings;
  }) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    try {
      const { data: existingTools } = await supabase.from('tools').select('id').limit(1);
      if (!existingTools || existingTools.length === 0) {
        await supabase.from('tools').upsert(
          defaults.tools.map(t => ({
            id: sanitizeId(t.id),
            name: clampStr(t.name, 100),
            slug: clampStr(t.slug, 100),
            description: clampStr(t.description, 500),
            category: clampStr(t.category, 80),
            enabled: Boolean(t.enabled),
            icon_name: clampStr(t.iconName, 50),
          })),
          { onConflict: 'id' }
        );
      }

      const { data: wc } = await supabase
        .from('site_config')
        .select('key')
        .eq('key', 'websiteContent')
        .maybeSingle();
      if (!wc) {
        await supabase.from('site_config').upsert({
          key: 'websiteContent',
          data: this.sanitizeWebsiteContent(defaults.websiteContent),
        });
      }

      const { data: pg } = await supabase
        .from('site_config')
        .select('key')
        .eq('key', 'paymentGateways')
        .maybeSingle();
      if (!pg) {
        await supabase.from('site_config').upsert({
          key: 'paymentGateways',
          data: this.sanitizePaymentGateways(defaults.paymentGateways),
        });
      }
    } catch (err) {
      console.error('Supabase bootstrap defaults failed:', err);
    }
  }

  // --- Writes ---
  public async syncUserStatus(userId: string, status: 'active' | 'deactivated') {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const { error } = await supabase.from('users').update({ status }).eq('id', sanitizeId(userId));
    if (error) console.error('Supabase syncUserStatus error:', error.message);
  }

  public async syncUserProfile(userId: string, data: { fullName?: string; mobile?: string }) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const patch: Record<string, unknown> = {};
    if (data.fullName !== undefined) patch.full_name = clampStr(data.fullName.trim(), 120) || 'User';
    if (data.mobile !== undefined) patch.mobile = clampStr(data.mobile.trim(), 40);
    if (Object.keys(patch).length === 0) return;

    const { error } = await supabase.from('users').update(patch).eq('id', sanitizeId(userId));
    if (error) console.error('Supabase syncUserProfile error:', error.message);
  }

  public async syncUserCreditsUpdate(
    userId: string,
    credits: number,
    planPatch?: { plan?: string; planStatus?: 'none' | 'pending' | 'active' }
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const patch: Record<string, unknown> = {
      credits: Math.max(0, Math.min(10000000, Math.floor(Number(credits) || 0))),
    };
    if (planPatch?.planStatus !== undefined) patch.plan_status = planPatch.planStatus;
    if (planPatch?.plan !== undefined) {
      patch.plan = clampStr(planPatch.plan, 80);
      patch.plan_updated_at = new Date().toISOString();
    }
    const { error } = await supabase.from('users').update(patch).eq('id', sanitizeId(userId));
    if (error) console.error('Supabase syncUserCreditsUpdate error:', error.message);
  }

  public async syncTool(tool: ToolItem) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const id = sanitizeId(tool.id);
    const { error } = await supabase.from('tools').upsert(
      {
        id,
        name: clampStr(tool.name, 100),
        slug: clampStr(tool.slug, 100),
        description: clampStr(tool.description, 500),
        category: clampStr(tool.category, 80),
        enabled: Boolean(tool.enabled),
        icon_name: clampStr(tool.iconName, 50),
      },
      { onConflict: 'id' }
    );
    if (error) console.error('Supabase syncTool error:', error.message);
  }

  private mapPoolTable(collectionName: 'uaPool' | 'leadsPool' | 'numbersPool' | 'mailsPool') {
    switch (collectionName) {
      case 'uaPool':
        return 'ua_pool';
      case 'leadsPool':
        return 'leads_pool';
      case 'numbersPool':
        return 'numbers_pool';
      case 'mailsPool':
        return 'mails_pool';
    }
  }

  public async syncPoolAdd(
    collectionName: 'uaPool' | 'leadsPool' | 'numbersPool' | 'mailsPool',
    items: Array<UserAgentEntry | LeadEntry | NumberEntry | MailEntry>
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid || items.length === 0) return;
    const table = this.mapPoolTable(collectionName);
    const CHUNK = 400;

    for (let i = 0; i < items.length; i += CHUNK) {
      const slice = items.slice(i, i + CHUNK);
      const rows = slice.map(item => {
        const id = sanitizeId(item.id);
        if (collectionName === 'uaPool') {
          const u = item as UserAgentEntry;
          return {
            id,
            device: u.device,
            browser: u.browser,
            in_app_browser: u.inAppBrowser,
            country: clampStr(u.country, 100),
            user_agent_string: clampStr(u.userAgentString, 1000),
            used: false,
          };
        }
        if (collectionName === 'leadsPool') {
          const l = item as LeadEntry;
          return {
            id,
            full_name: clampStr(l.fullName, 120),
            gender: l.gender,
            gmail: clampStr(l.gmail, 160),
            phone_number: clampStr(l.phoneNumber, 40),
            country: clampStr(l.country, 100),
            used: false,
          };
        }
        if (collectionName === 'numbersPool') {
          const n = item as NumberEntry;
          return {
            id,
            country: clampStr(n.country, 100),
            phone_number: clampStr(n.phoneNumber, 40),
            used: false,
          };
        }
        const m = item as MailEntry;
        return {
          id,
          country: clampStr(m.country, 100),
          email: clampStr(m.email, 160),
          used: false,
        };
      });

      const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
      if (error) console.error(`Supabase syncPoolAdd(${table}) error:`, error.message);
    }
  }

  public async syncPoolConsume(
    collectionName: 'uaPool' | 'leadsPool' | 'numbersPool' | 'mailsPool',
    docIds: string[]
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid || docIds.length === 0) return;
    const table = this.mapPoolTable(collectionName);
    const cleanIds = docIds.map(sanitizeId);
    const CHUNK = 400;

    for (let i = 0; i < cleanIds.length; i += CHUNK) {
      const slice = cleanIds.slice(i, i + CHUNK);
      const { error } = await supabase
        .from(table)
        .update({
          used: true,
          used_by: this.syncedUid,
          used_at: new Date().toISOString(),
        })
        .in('id', slice);
      if (error) console.error(`Supabase syncPoolConsume(${table}) error:`, error.message);
    }
  }

  public async syncPoolDelete(
    collectionName: 'uaPool' | 'leadsPool' | 'numbersPool' | 'mailsPool',
    docIds: string[]
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid || docIds.length === 0) return;
    const table = this.mapPoolTable(collectionName);
    const cleanIds = docIds.map(sanitizeId);
    const CHUNK = 400;

    for (let i = 0; i < cleanIds.length; i += CHUNK) {
      const slice = cleanIds.slice(i, i + CHUNK);
      const { error } = await supabase.from(table).delete().in('id', slice);
      if (error) console.error(`Supabase syncPoolDelete(${table}) error:`, error.message);
    }
  }

  private mapResourceTable(collectionName: 'cpaNetworks' | 'proxySites' | 'antidetectBrowsers') {
    switch (collectionName) {
      case 'cpaNetworks':
        return 'cpa_networks';
      case 'proxySites':
        return 'proxy_sites';
      case 'antidetectBrowsers':
        return 'antidetect_browsers';
    }
  }

  public async syncResourceUpsert(
    collectionName: 'cpaNetworks' | 'proxySites' | 'antidetectBrowsers',
    item: CpaNetwork | ProxySite | AntidetectBrowser
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const table = this.mapResourceTable(collectionName);
    const id = sanitizeId(item.id);
    let payload: Record<string, unknown>;

    if (collectionName === 'cpaNetworks') {
      const c = item as CpaNetwork;
      payload = {
        id,
        name: clampStr(c.name, 120),
        type: clampStr(c.type, 120),
        min_payment: clampStr(c.minPayment, 80),
        description: clampStr(c.description, 800),
        join_url: clampStr(c.joinUrl, 400),
      };
    } else if (collectionName === 'proxySites') {
      const p = item as ProxySite;
      payload = {
        id,
        name: clampStr(p.name, 120),
        validity: clampStr(p.validity, 120),
        traffic: clampStr(p.traffic, 160),
        price: clampStr(p.price, 80),
        buy_url: clampStr(p.buyUrl, 400),
      };
    } else {
      const b = item as AntidetectBrowser;
      payload = {
        id,
        name: clampStr(b.name, 120),
        description: clampStr(b.description, 800),
        download_url: clampStr(b.downloadUrl, 400),
      };
    }

    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) console.error(`Supabase syncResourceUpsert(${table}) error:`, error.message);
  }

  public async syncResourceDelete(
    collectionName: 'cpaNetworks' | 'proxySites' | 'antidetectBrowsers',
    id: string
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const table = this.mapResourceTable(collectionName);
    const { error } = await supabase.from(table).delete().eq('id', sanitizeId(id));
    if (error) console.error(`Supabase syncResourceDelete(${table}) error:`, error.message);
  }

  public async syncUsageHistoryAdd(entry: UsageHistoryEntry) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const id = sanitizeId(entry.id);
    const { error } = await supabase.from('usage_history').upsert(
      {
        id,
        user_id: this.syncedUid,
        tool_slug: clampStr(entry.toolSlug, 100),
        tool_name: clampStr(entry.toolName, 100),
        date: clampStr(entry.date, 30),
        time: clampStr(entry.time, 30),
        result_count: Math.max(0, Math.min(10000, Number(entry.resultCount || 0))),
        status: entry.status === 'Failed' ? 'Failed' : 'Success',
        summary: entry.summary ? clampStr(entry.summary, 300) : null,
      },
      { onConflict: 'id' }
    );
    if (error) console.error('Supabase syncUsageHistoryAdd error:', error.message);
  }

  public async syncUsageHistoryClear(ids: string[]) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid || ids.length === 0) return;
    const { error } = await supabase.from('usage_history').delete().in('id', ids.map(sanitizeId));
    if (error) console.error('Supabase syncUsageHistoryClear error:', error.message);
  }

  public async syncSavedResultAdd(entry: SavedResult) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const id = sanitizeId(entry.id);
    const { error } = await supabase.from('saved_results').upsert(
      {
        id,
        user_id: this.syncedUid,
        tool_slug: clampStr(entry.toolSlug, 100),
        tool_name: clampStr(entry.toolName, 100),
        title: clampStr(entry.title, 160) || 'Saved Export',
        results_text: clampStr(entry.resultsText, 100000),
        count: Math.max(0, Math.min(10000, Number(entry.count || 0))),
        saved_date: clampStr(entry.savedDate, 60),
      },
      { onConflict: 'id' }
    );
    if (error) console.error('Supabase syncSavedResultAdd error:', error.message);
  }

  public async syncSavedResultDelete(id: string) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const { error } = await supabase.from('saved_results').delete().eq('id', sanitizeId(id));
    if (error) console.error('Supabase syncSavedResultDelete error:', error.message);
  }

  public async syncSupportTicketCreate(ticket: SupportTicket) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const tid = sanitizeId(ticket.id);
    const uid = this.syncedUid;

    const { error: ticketErr } = await supabase.from('support_tickets').upsert(
      {
        id: tid,
        user_id: uid,
        user_name: clampStr(ticket.userName, 120) || 'User',
        user_email: clampStr(ticket.userEmail, 160),
        subject: clampStr(ticket.subject, 200) || 'Support Request',
        status: 'open',
      },
      { onConflict: 'id' }
    );
    if (ticketErr) {
      console.error('Supabase syncSupportTicketCreate error:', ticketErr.message);
      return;
    }

    const firstMsg = ticket.messages[0];
    if (firstMsg) {
      const mid = sanitizeId(firstMsg.id);
      const { error: msgErr } = await supabase.from('support_messages').upsert(
        {
          id: mid,
          ticket_id: tid,
          ticket_owner_id: uid,
          sender: 'user',
          sender_uid: uid,
          sender_name: clampStr(firstMsg.senderName, 120) || 'User',
          text: clampStr(firstMsg.text, 2000),
          timestamp: clampStr(firstMsg.timestamp, 60),
        },
        { onConflict: 'id' }
      );
      if (msgErr) console.error('Supabase syncSupportTicketCreate msg error:', msgErr.message);
    }
  }

  public async syncSupportTicketReply(
    ticketId: string,
    ticketOwnerId: string,
    msg: SupportChatMessage,
    nextStatus: 'open' | 'replied' | 'closed'
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const tid = sanitizeId(ticketId);
    const mid = sanitizeId(msg.id);

    const { error: msgErr } = await supabase.from('support_messages').upsert(
      {
        id: mid,
        ticket_id: tid,
        ticket_owner_id: sanitizeId(ticketOwnerId),
        sender: msg.sender,
        sender_uid: this.syncedUid,
        sender_name: clampStr(msg.senderName, 120) || 'User',
        text: clampStr(msg.text, 2000),
        timestamp: clampStr(msg.timestamp, 60),
      },
      { onConflict: 'id' }
    );
    if (msgErr) console.error('Supabase syncSupportTicketReply msg error:', msgErr.message);

    const { error: ticketErr } = await supabase
      .from('support_tickets')
      .update({ status: nextStatus })
      .eq('id', tid);
    if (ticketErr) console.error('Supabase syncSupportTicketReply ticket error:', ticketErr.message);
  }

  public async syncSupportTicketStatus(ticketId: string, status: 'open' | 'replied' | 'closed') {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', sanitizeId(ticketId));
    if (error) console.error('Supabase syncSupportTicketStatus error:', error.message);
  }

  private sanitizeWebsiteContent(c: WebsiteContent) {
    return {
      heroTitle: clampStr(c.heroTitle, 250),
      heroHighlight: clampStr(c.heroHighlight, 200),
      heroDescription: clampStr(c.heroDescription, 1000),
      aboutTitle: clampStr(c.aboutTitle, 200),
      aboutText: clampStr(c.aboutText, 2000),
      contactEmail: clampStr(c.contactEmail, 160),
      contactPhone: clampStr(c.contactPhone, 60),
      contactTelegram: clampStr(c.contactTelegram, 100),
      socialLinks: {
        facebook: clampStr(c.socialLinks?.facebook, 300),
        instagram: clampStr(c.socialLinks?.instagram, 300),
        tiktok: clampStr(c.socialLinks?.tiktok, 300),
        telegram: clampStr(c.socialLinks?.telegram, 300),
      },
      footerDescription: clampStr(c.footerDescription, 600),
    };
  }

  public async syncWebsiteContent(content: WebsiteContent) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const { error } = await supabase.from('site_config').upsert(
      {
        key: 'websiteContent',
        data: this.sanitizeWebsiteContent(content),
      },
      { onConflict: 'key' }
    );
    if (error) console.error('Supabase syncWebsiteContent error:', error.message);
  }

  private sanitizePaymentGateways(s: PaymentGatewaySettings) {
    return {
      bkashNumber: clampStr(s.bkashNumber, 60),
      bkashType: clampStr(s.bkashType, 80),
      nagadNumber: clampStr(s.nagadNumber, 60),
      nagadType: clampStr(s.nagadType, 80),
      rocketNumber: clampStr(s.rocketNumber, 60),
      rocketType: clampStr(s.rocketType, 80),
      binancePayId: clampStr(s.binancePayId, 80),
      binanceTrc20Address: clampStr(s.binanceTrc20Address, 120),
      binanceBep20Address: clampStr(s.binanceBep20Address, 120),
      instructionsNote: clampStr(s.instructionsNote, 600),
    };
  }

  public async syncPaymentGateways(settings: PaymentGatewaySettings) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const { error } = await supabase.from('site_config').upsert(
      {
        key: 'paymentGateways',
        data: this.sanitizePaymentGateways(settings),
      },
      { onConflict: 'key' }
    );
    if (error) console.error('Supabase syncPaymentGateways error:', error.message);
  }

  public async syncPaymentRequestCreate(req: PaymentRequest) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const id = sanitizeId(req.id);
    const uid = this.syncedUid;

    const { error: reqErr } = await supabase.from('payment_requests').upsert(
      {
        id,
        user_id: uid,
        user_name: clampStr(req.userName, 120) || 'User',
        user_email: clampStr(req.userEmail, 160),
        package_id: clampStr(req.packageId, 60),
        package_name: clampStr(req.packageName, 80),
        package_credits: Math.max(0, Math.min(10000000, Math.floor(Number(req.packageCredits || 0)))),
        method: req.method,
        currency: req.currency,
        amount: Math.max(0.01, Math.min(1000000, Number(req.amount))),
        sender_account: clampStr(req.senderAccount, 120),
        transaction_id: clampStr(req.transactionId, 120),
        note: req.note ? clampStr(req.note, 500) : '',
        status: 'pending',
      },
      { onConflict: 'id' }
    );
    if (reqErr) console.error('Supabase syncPaymentRequestCreate error:', reqErr.message);

    await supabase
      .from('users')
      .update({ plan_status: 'pending' })
      .eq('id', uid)
      .eq('plan_status', 'none');
  }

  public async syncPaymentRequestReview(
    req: PaymentRequest,
    userPlanPatch?: { plan?: string; planStatus: 'none' | 'pending' | 'active'; credits?: number }
  ) {
    if (!isSupabaseConfigured || !supabase || !this.syncedUid) return;
    const id = sanitizeId(req.id);

    const { error: payErr } = await supabase
      .from('payment_requests')
      .update({
        status: req.status,
        admin_note: clampStr(req.adminNote || '', 500),
        reviewed_by: clampStr(req.reviewedBy || this.activeEmail || '', 160),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (payErr) console.error('Supabase syncPaymentRequestReview error:', payErr.message);

    if (userPlanPatch && req.userId) {
      const patch: Record<string, unknown> = {
        plan_status: userPlanPatch.planStatus,
      };
      if (userPlanPatch.plan !== undefined) {
        patch.plan = clampStr(userPlanPatch.plan, 80);
        patch.plan_updated_at = new Date().toISOString();
      }
      if (userPlanPatch.credits !== undefined) {
        patch.credits = Math.max(0, Math.min(10000000, Math.floor(Number(userPlanPatch.credits) || 0)));
      }
      const { error: uErr } = await supabase
        .from('users')
        .update(patch)
        .eq('id', sanitizeId(req.userId));
      if (uErr) console.error('Supabase user plan update error:', uErr.message);
    }
  }
}

export const supabaseSync = new SupabaseSyncService();
