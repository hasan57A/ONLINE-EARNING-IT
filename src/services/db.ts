import { createClient } from '@supabase/supabase-js';
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
  UsageHistoryEntry,
  SavedResult,
  WebsiteContent,
  PaymentMethod,
  PaymentStatus,
  PaymentPackage,
  PaymentGatewaySettings,
  PaymentRequest,
} from '../types';
import { findCountryGeo } from '../data/countries';

// Initial Tools Definition
const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'tool_ua',
    name: 'User Agent Generator',
    slug: 'user-agent-generator',
    description: 'Generate high-fidelity desktop, mobile, and in-app browser user agent strings with country & platform targeting.',
    category: 'Browser & Device',
    enabled: true,
    iconName: 'Smartphone',
  },
  {
    id: 'tool_leads',
    name: 'Lead Generator',
    slug: 'lead-generator',
    description: 'Generate formatted test lead profiles with full names, genders, Gmail addresses, and phone numbers.',
    category: 'Marketing & Outreach',
    enabled: true,
    iconName: 'Users',
  },
  {
    id: 'tool_shuffler',
    name: 'Text Shuffler',
    slug: 'text-shuffler',
    description: 'Randomize and shuffle lines, words, or individual characters for spin-tax, variations, and split tests.',
    category: 'Content Processing',
    enabled: true,
    iconName: 'Shuffle',
  },
  {
    id: 'tool_dedup',
    name: 'Duplicate Text Remover',
    slug: 'duplicate-text-remover',
    description: 'Clean up massive text lists, extract unique rows, and remove duplicate entries with case & trim filters.',
    category: 'Data Cleaning',
    enabled: true,
    iconName: 'Filter',
  },
  {
    id: 'tool_number',
    name: 'Number Generator',
    slug: 'number-generator',
    description: 'Generate country-specific formatted test phone numbers for testing workflows and mock databases.',
    category: 'Telephony & Testing',
    enabled: true,
    iconName: 'PhoneCall',
  },
  {
    id: 'tool_mail',
    name: 'Mail Generator',
    slug: 'mail-generator',
    description: 'Produce reserved test email addresses with custom country domains and test mailbox naming patterns.',
    category: 'Email & QA',
    enabled: true,
    iconName: 'Mail',
  },
];

const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  heroTitle: 'All-In-One High-Performance Tools for',
  heroHighlight: 'Digital Marketers & Media Buyers',
  heroDescription:
    'Power up your CPA campaigns, traffic arbitrage, and data processing with enterprise-grade user agent generators, clean lead test pools, text processors, and curated industry resources.',
  aboutTitle: 'About ONLINE EARNING IT',
  aboutText:
    'ONLINE EARNING IT is a premier tools and resources powerhouse engineered specifically for online marketers, traffic arbiters, CPA affiliates, and media buyers. We provide lightning-fast data generation utilities, text normalizers, and vetted marketing knowledge bases to maximize efficiency, scale workflows, and accelerate earnings without operational friction.',
  contactEmail: 'support@onlineearningit.com',
  contactPhone: '+1 (555) 019-2834',
  contactTelegram: '@OnlineEarningIT_Official',
  socialLinks: {
    facebook: 'https://facebook.com/OnlineEarningIT',
    instagram: 'https://instagram.com/OnlineEarningIT',
    tiktok: 'https://tiktok.com/@OnlineEarningIT',
    telegram: 'https://t.me/OnlineEarningIT_Channel',
  },
  footerDescription:
    'The premier destination for online earning professionals, CPA marketing toolsets, lead simulation utilities, and marketing intelligence.',
};

// Storage keys
const STORAGE_KEYS = {
  USERS: 'oe_users_v2',
  CURRENT_USER: 'oe_current_user_v2',
  TOOLS: 'oe_tools_v2',
  UA_POOL: 'oe_ua_pool_v2',
  LEADS_POOL: 'oe_leads_pool_v2',
  NUMBERS_POOL: 'oe_numbers_pool_v2',
  MAILS_POOL: 'oe_mails_pool_v2',
  CPA_NETWORKS: 'oe_cpa_networks_v2',
  PROXY_SITES: 'oe_proxy_sites_v2',
  ANTIDETECT_BROWSERS: 'oe_antidetect_browsers_v2',
  SUPPORT_TICKETS: 'oe_support_tickets_v2',
  USAGE_HISTORY: 'oe_usage_history_v2',
  SAVED_RESULTS: 'oe_saved_results_v2',
  WEBSITE_CONTENT: 'oe_website_content_v2',
  ADMIN_INITIALIZED: 'oe_admin_initialized_v2',
  PAYMENT_REQUESTS: 'oe_payment_requests_v2',
  PAYMENT_SETTINGS: 'oe_payment_settings_v2',
};

const DEFAULT_PAYMENT_GATEWAYS: PaymentGatewaySettings = {
  bkashNumber: '01700-000000',
  bkashType: 'Personal (Send Money)',
  nagadNumber: '01700-000000',
  nagadType: 'Personal (Send Money)',
  rocketNumber: '01700-000000-0',
  rocketType: 'Personal (Send Money)',
  binancePayId: '882041925',
  binanceTrc20Address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
  binanceBep20Address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  instructionsNote:
    'Send the exact package amount to the active wallet/number above, then submit your Sender Number / Pay ID and Transaction ID (TrxID) for admin verification.',
};

const DEFAULT_PAYMENT_PACKAGES: PaymentPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter Pass',
    priceBdt: 500,
    priceUsdt: 5,
    durationLabel: '30 Days',
    description: 'Essential access to admin-verified User Agent, Lead, Number & Mail generation pools.',
    features: ['All 6 Marketing Tools Access', 'Global GEO & Language Targeting', '5-Version Cycling Engine'],
  },
  {
    id: 'pkg_pro',
    name: 'Pro Marketer',
    priceBdt: 1200,
    priceUsdt: 12,
    durationLabel: '90 Days',
    description: 'Extended campaign toolkit designed for active media buyers and CPA marketers.',
    features: ['Priority Pool Allocation', 'Multi-Device UA Batching', 'Full Saved Results Archive'],
  },
  {
    id: 'pkg_agency',
    name: 'Agency Lifetime',
    priceBdt: 2500,
    priceUsdt: 25,
    durationLabel: '1 Year',
    description: 'Maximum operational scale for affiliate teams and high-volume traffic arbitrage.',
    features: ['Unlimited Workflow Exports', 'Dedicated Support Channel', 'Full Resource Directory Access'],
  },
];

// ---------------------------------------------------------------------
// Supabase connection (these two values are PUBLIC by design; the real
// protection is the Row Level Security rules in supabase_schema.sql)
// ---------------------------------------------------------------------
const SUPABASE_URL: string =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://eqmfcgudxhnysxgbveax.supabase.co';
const SUPABASE_KEY: string =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XV3oVHbuYWyDTfkPzSaspA_00ldMqRh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const toCamel = (s: string): string => s.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase());

function showBanner(message: string) {
  try {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText =
      'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;max-width:90vw;' +
      'background:#b91c1c;color:#fff;padding:10px 16px;border-radius:10px;font:14px sans-serif;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.35)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 9000);
  } catch {
    /* ignore */
  }
}

interface TableCfg {
  table: string;
  kind: 'list' | 'single';
  cols: string[];
  order: { col: string; asc: boolean };
  public?: boolean; // readable without logging in
  pool?: boolean; // generator pools that users "claim" items from
  noInsert?: boolean;
  noDelete?: boolean;
  sort?: (a: any, b: any) => number;
}

const TABLES: Record<string, TableCfg> = {
  [STORAGE_KEYS.USERS]: {
    table: 'profiles', kind: 'list', noInsert: true, noDelete: true,
    cols: ['id', 'full_name', 'mobile', 'gmail', 'role', 'status', 'plan', 'plan_status', 'plan_updated_at', 'created_at', 'updated_at'],
    order: { col: 'created_at', asc: true },
  },
  [STORAGE_KEYS.TOOLS]: {
    table: 'tools', kind: 'list', public: true,
    cols: ['id', 'name', 'slug', 'description', 'category', 'enabled', 'icon_name'],
    order: { col: 'id', asc: true },
    sort: (a, b) => {
      const ia = DEFAULT_TOOLS.findIndex(t => t.id === a.id);
      const ib = DEFAULT_TOOLS.findIndex(t => t.id === b.id);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    },
  },
  [STORAGE_KEYS.CPA_NETWORKS]: {
    table: 'cpa_networks', kind: 'list', public: true,
    cols: ['id', 'name', 'type', 'min_payment', 'description', 'join_url'],
    order: { col: 'id', asc: true },
  },
  [STORAGE_KEYS.PROXY_SITES]: {
    table: 'proxy_sites', kind: 'list', public: true,
    cols: ['id', 'name', 'validity', 'traffic', 'price', 'buy_url'],
    order: { col: 'id', asc: true },
  },
  [STORAGE_KEYS.ANTIDETECT_BROWSERS]: {
    table: 'antidetect_browsers', kind: 'list', public: true,
    cols: ['id', 'name', 'description', 'download_url'],
    order: { col: 'id', asc: true },
  },
  [STORAGE_KEYS.WEBSITE_CONTENT]: {
    table: 'website_content', kind: 'single', public: true, cols: [],
    order: { col: 'id', asc: true },
  },
  [STORAGE_KEYS.PAYMENT_SETTINGS]: {
    table: 'payment_settings', kind: 'single', cols: [],
    order: { col: 'id', asc: true },
  },
  [STORAGE_KEYS.UA_POOL]: {
    table: 'user_agents', kind: 'list', pool: true,
    cols: ['id', 'device', 'browser', 'in_app_browser', 'country', 'user_agent_string', 'used', 'used_by', 'used_at', 'created_at'],
    order: { col: 'created_at', asc: true },
  },
  [STORAGE_KEYS.LEADS_POOL]: {
    table: 'leads', kind: 'list', pool: true,
    cols: ['id', 'full_name', 'gender', 'gmail', 'phone_number', 'country', 'used', 'used_by', 'used_at', 'created_at'],
    order: { col: 'created_at', asc: true },
  },
  [STORAGE_KEYS.NUMBERS_POOL]: {
    table: 'numbers', kind: 'list', pool: true,
    cols: ['id', 'country', 'phone_number', 'used', 'used_by', 'used_at', 'created_at'],
    order: { col: 'created_at', asc: true },
  },
  [STORAGE_KEYS.MAILS_POOL]: {
    table: 'mails', kind: 'list', pool: true,
    cols: ['id', 'country', 'email', 'used', 'used_by', 'used_at', 'created_at'],
    order: { col: 'created_at', asc: true },
  },
  [STORAGE_KEYS.USAGE_HISTORY]: {
    table: 'usage_history', kind: 'list',
    cols: ['id', 'user_id', 'tool_slug', 'tool_name', 'date', 'time', 'result_count', 'status', 'summary'],
    order: { col: 'id', asc: false },
  },
  [STORAGE_KEYS.SAVED_RESULTS]: {
    table: 'saved_results', kind: 'list',
    cols: ['id', 'user_id', 'tool_slug', 'tool_name', 'title', 'results_text', 'count', 'saved_date'],
    order: { col: 'id', asc: false },
  },
  [STORAGE_KEYS.SUPPORT_TICKETS]: {
    table: 'support_tickets', kind: 'list',
    cols: ['id', 'user_id', 'user_name', 'user_email', 'subject', 'status', 'messages', 'created_at', 'updated_at'],
    order: { col: 'created_at', asc: false },
  },
  [STORAGE_KEYS.PAYMENT_REQUESTS]: {
    table: 'payment_requests', kind: 'list',
    cols: ['id', 'user_id', 'user_name', 'user_email', 'package_id', 'package_name', 'method', 'currency', 'amount', 'sender_account', 'transaction_id', 'note', 'status', 'admin_note', 'reviewed_by', 'reviewed_at', 'created_at'],
    order: { col: 'created_at', asc: false },
  },
};

class DatabaseService {
  private listeners: Set<() => void> = new Set();
  // In-memory mirror of the Supabase database. Values are JSON strings so every
  // read returns a fresh copy (same behaviour the old localStorage version had).
  private store: Record<string, string> = {};
  // What the server is known to hold: key -> (row id -> JSON string of row)
  private synced: Record<string, Map<string, string>> = {};
  private syncedSingle: Record<string, string> = {};
  private queue: Promise<void> = Promise.resolve();
  private pending = 0;
  private hydrating: Promise<void> | null = null;
  public ready: Promise<void>;

  constructor() {
    this.ready = Promise.race([
      this.hydrate().catch(e => console.error('Initial data load failed:', e)),
      new Promise<void>(res => setTimeout(res, 15000)),
    ]);

    supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT' && this.getCurrentUser()) {
        setTimeout(() => {
          this.hydrate().catch(() => undefined);
        }, 0);
      }
    });

    // Keep data fresh when other people (e.g. users paying, admin approving) change things.
    setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (this.pending > 0) return;
      this.hydrate().catch(() => undefined);
    }, 30000);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.pending === 0) this.hydrate().catch(() => undefined);
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = this.store[key];
      return data !== undefined ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      this.store[key] = JSON.stringify(value);
      const cfg = TABLES[key];
      if (cfg) this.scheduleSync(key, cfg, value);
      this.notify();
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // ------------------------------------------------------------------
  // Loading data from Supabase
  // ------------------------------------------------------------------
  public hydrate(): Promise<void> {
    const run = () => this.doHydrate();
    const p = (this.hydrating ?? Promise.resolve()).then(run, run);
    this.hydrating = p;
    const clear = () => {
      if (this.hydrating === p) this.hydrating = null;
    };
    p.then(clear, clear);
    return p;
  }

  private async doHydrate(): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    let changed = false;

    for (const [key, cfg] of Object.entries(TABLES)) {
      if (!session && !cfg.public) {
        const empty = cfg.kind === 'list' ? '[]' : undefined;
        if (this.store[key] !== empty) {
          if (empty === undefined) delete this.store[key];
          else this.store[key] = empty;
          changed = true;
        }
        this.synced[key] = new Map();
        continue;
      }
      const result = await this.fetchTable(cfg);
      if (result === null) continue; // keep what we had on error
      if (cfg.kind === 'list') {
        const rows = result as any[];
        const json = JSON.stringify(rows);
        const map = new Map<string, string>();
        rows.forEach(r => map.set(String(r.id), JSON.stringify(r)));
        this.synced[key] = map;
        if (this.store[key] !== json) {
          this.store[key] = json;
          changed = true;
        }
      } else {
        const obj = result as any;
        if (obj === undefined) continue;
        const json = JSON.stringify(obj);
        this.syncedSingle[key] = json;
        if (this.store[key] !== json) {
          this.store[key] = json;
          changed = true;
        }
      }
    }

    // Work out who is logged in from their profile row
    let current: User | null = null;
    if (session) {
      const users = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
      current = users.find(u => u.id === session.user.id) || null;
      if (current && current.status === 'deactivated') {
        await supabase.auth.signOut();
        current = null;
      }
    }
    const currentJson = JSON.stringify(current);
    if (this.store[STORAGE_KEYS.CURRENT_USER] !== currentJson) {
      this.store[STORAGE_KEYS.CURRENT_USER] = currentJson;
      changed = true;
    }

    if (changed) this.notify();
  }

  private async fetchTable(cfg: TableCfg): Promise<any[] | any | null> {
    try {
      if (cfg.kind === 'single') {
        const { data, error } = await supabase.from(cfg.table).select('data').eq('id', 1).maybeSingle();
        if (error) throw error;
        return data ? data.data : undefined;
      }
      const rows: any[] = [];
      const PAGE = 1000;
      for (let from = 0; ; from += PAGE) {
        const q = supabase
          .from(cfg.table)
          .select(cfg.cols.join(','))
          .order(cfg.order.col, { ascending: cfg.order.asc })
          .order('id', { ascending: true })
          .range(from, from + PAGE - 1);
        const { data, error } = await q;
        if (error) throw error;
        const got = (data as any[]) || [];
        rows.push(...got);
        if (got.length < PAGE) break;
      }
      let mapped = rows.map(r => this.rowIn(r, cfg));
      if (cfg.sort) mapped = mapped.sort(cfg.sort);
      return mapped;
    } catch (e) {
      console.error(`Could not load "${cfg.table}":`, e);
      return null;
    }
  }

  private rowIn(row: any, cfg: TableCfg): any {
    const out: any = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === null || v === undefined) continue;
      out[toCamel(k)] = v;
    }
    if (cfg.table === 'profiles') {
      out.passwordHash = '';
      out.salt = '';
    }
    return out;
  }

  private rowOutInsert(item: any, cfg: TableCfg): any {
    const out: any = {};
    for (const col of cfg.cols) {
      const v = item[toCamel(col)];
      if (v !== undefined && v !== null) out[col] = v;
    }
    return out;
  }

  private rowOutUpdate(prev: any, item: any, cfg: TableCfg): any {
    const out: any = {};
    for (const col of cfg.cols) {
      if (col === 'id') continue;
      const key = toCamel(col);
      const a = JSON.stringify(prev[key]);
      const b = JSON.stringify(item[key]);
      if (a !== b) out[col] = item[key] === undefined ? null : item[key];
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Saving data to Supabase
  // ------------------------------------------------------------------
  private enqueue(fn: () => Promise<void>) {
    this.pending++;
    this.queue = this.queue
      .then(fn)
      .catch(e => this.syncError(e))
      .finally(() => {
        this.pending--;
      });
  }

  private syncError(e: any) {
    console.error('Database save error:', e);
    const msg = (e && (e.message || e.error_description)) || 'Unknown error';
    showBanner('Could not save to the database: ' + msg);
    this.hydrate().catch(() => undefined);
  }

  private scheduleSync(key: string, cfg: TableCfg, value: any) {
    if (cfg.kind === 'single') {
      const json = JSON.stringify(value);
      if (this.syncedSingle[key] === json) return;
      this.syncedSingle[key] = json;
      this.enqueue(async () => {
        const { error } = await supabase.from(cfg.table).upsert({ id: 1, data: value });
        if (error) throw error;
      });
      return;
    }

    const synced = this.synced[key] || (this.synced[key] = new Map());
    const list = value as any[];
    const seen = new Set<string>();
    const inserts: any[] = [];
    const updates: { id: string; payload: any }[] = [];

    for (const item of list) {
      const id = String(item.id);
      seen.add(id);
      const json = JSON.stringify(item);
      const prev = synced.get(id);
      if (prev === undefined) {
        inserts.push(item);
        synced.set(id, json);
      } else if (prev !== json) {
        const payload = this.rowOutUpdate(JSON.parse(prev), item, cfg);
        synced.set(id, json);
        if (Object.keys(payload).length > 0) updates.push({ id, payload });
      }
    }
    const deletes: string[] = [];
    for (const id of Array.from(synced.keys())) {
      if (!seen.has(id)) {
        deletes.push(id);
        synced.delete(id);
      }
    }
    if (!inserts.length && !updates.length && !deletes.length) return;

    this.enqueue(async () => {
      // 1) inserts
      if (!cfg.noInsert && inserts.length) {
        const rows = inserts.map(i => this.rowOutInsert(i, cfg));
        for (let i = 0; i < rows.length; i += 400) {
          const { error } = await supabase.from(cfg.table).insert(rows.slice(i, i + 400));
          if (error) throw error;
        }
      }

      // 2) updates
      if (updates.length) {
        if (cfg.pool) {
          // group identical changes so thousands of "used" flags become a few requests
          const groups = new Map<string, { ids: string[]; payload: any }>();
          for (const u of updates) {
            const rest = { ...u.payload };
            delete rest.used_at;
            const gk = JSON.stringify(rest);
            const g = groups.get(gk) || { ids: [], payload: { ...u.payload } };
            g.ids.push(u.id);
            groups.set(gk, g);
          }
          for (const g of groups.values()) {
            for (let i = 0; i < g.ids.length; i += 200) {
              let q = supabase.from(cfg.table).update(g.payload).in('id', g.ids.slice(i, i + 200));
              if (g.payload.used === true) q = q.eq('used', false);
              const { error } = await q.select('id');
              if (error) throw error;
            }
          }
        } else {
          for (let i = 0; i < updates.length; i += 10) {
            await Promise.all(
              updates.slice(i, i + 10).map(async u => {
                const { data, error } = await supabase
                  .from(cfg.table)
                  .update(u.payload)
                  .eq('id', u.id)
                  .select('id');
                if (error) throw error;
                if (!data || data.length === 0) {
                  throw new Error('Permission denied or record not found (' + cfg.table + ')');
                }
              })
            );
          }
        }
      }

      // 3) deletes
      if (!cfg.noDelete && deletes.length) {
        for (let i = 0; i < deletes.length; i += 200) {
          const chunk = deletes.slice(i, i + 200);
          const { data, error } = await supabase.from(cfg.table).delete().in('id', chunk).select('id');
          if (error) throw error;
          if (!data || data.length < chunk.length) {
            throw new Error('Permission denied: some records could not be deleted (' + cfg.table + ')');
          }
        }
      }

      // Pools can be claimed by two people at once: reload so we show the truth.
      if (cfg.pool && this.pending === 1) await this.hydrate();
    });
  }

  // ------------------------------------------------------------------
  // Users & Auth (Supabase Auth)
  // ------------------------------------------------------------------
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  public async registerUser(fullName: string, mobile: string, gmail: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const cleanEmail = gmail.trim().toLowerCase();

    if (!cleanEmail.endsWith('@gmail.com')) {
      return { success: false, error: 'Registration requires a valid Gmail address (@gmail.com).' };
    }
    if (pass.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: { data: { full_name: fullName.trim(), mobile: mobile.trim() } },
    });

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('already registered') || m.includes('already been registered')) {
        return { success: false, error: 'This Gmail address is already registered. Please sign in.' };
      }
      return { success: false, error: error.message || 'Registration failed.' };
    }
    if (!data.session) {
      return {
        success: false,
        error: 'Account created. Please confirm your email using the link we sent you, then sign in.',
      };
    }

    await this.hydrate();
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Account was created but your profile could not be loaded. Please sign in again.' };
    }
    return { success: true, user };
  }

  public async authenticate(gmail: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const cleanEmail = gmail.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass });
    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('not confirmed')) {
        return { success: false, error: 'Please confirm your email address first, then sign in.' };
      }
      return { success: false, error: 'Incorrect Gmail or password. Please try again.' };
    }

    await this.hydrate();
    const user = this.getCurrentUser();
    if (!user) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        return { success: false, error: 'Your account has been deactivated by the administrator. Please contact support.' };
      }
      return { success: false, error: 'Could not load your profile. Please try again.' };
    }
    return { success: true, user };
  }

  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    if (user === null) {
      this.store[STORAGE_KEYS.CURRENT_USER] = 'null';
      // forget private data immediately, then end the Supabase session
      for (const [key, cfg] of Object.entries(TABLES)) {
        if (!cfg.public) {
          if (cfg.kind === 'list') this.store[key] = '[]';
          else delete this.store[key];
          this.synced[key] = new Map();
        }
      }
      this.notify();
      supabase.auth.signOut().finally(() => {
        this.hydrate().catch(() => undefined);
      });
      return;
    }
    this.store[STORAGE_KEYS.CURRENT_USER] = JSON.stringify(user);
    this.notify();
  }

  public getUserById(userId: string): User | undefined {
    return this.getUsers().find(u => u.id === userId);
  }

  public updateUserStatus(userId: string, status: 'active' | 'deactivated'): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].status = status;
      users[idx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.USERS, users);
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(users[idx]);
      }
    }
  }

  public async updateUserProfile(userId: string, data: { fullName?: string; mobile?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> {
    if (data.newPassword) {
      if (data.newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) return { success: false, error: error.message };
    }

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) {
      return data.newPassword ? { success: true } : { success: false, error: 'User not found' };
    }
    if (data.fullName) users[idx].fullName = data.fullName.trim();
    if (data.mobile) users[idx].mobile = data.mobile.trim();
    users[idx].updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.USERS, users);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(users[idx]);
    }
    return { success: true };
  }

    // --- Tools Management ---
  public getTools(): ToolItem[] {
    return this.getItem<ToolItem[]>(STORAGE_KEYS.TOOLS, DEFAULT_TOOLS);
  }

  public toggleTool(toolId: string, enabled: boolean): void {
    const tools = this.getTools();
    const idx = tools.findIndex(t => t.id === toolId);
    if (idx !== -1) {
      tools[idx].enabled = enabled;
      this.setItem(STORAGE_KEYS.TOOLS, tools);
    }
  }

  // --- Admin Generator Pools (User Agents, Leads, Numbers, Mails) ---

  // 1. User Agents
  public getUserAgents(): UserAgentEntry[] {
    return this.getItem<UserAgentEntry[]>(STORAGE_KEYS.UA_POOL, []);
  }

  public addUserAgent(entry: Omit<UserAgentEntry, 'id' | 'used' | 'createdAt'>): void {
    const pool = this.getUserAgents();
    const newEntry: UserAgentEntry = {
      ...entry,
      id: 'ua_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      used: false,
      createdAt: new Date().toISOString(),
    };
    pool.push(newEntry);
    this.setItem(STORAGE_KEYS.UA_POOL, pool);
  }

  public addMultipleUserAgents(entries: Array<Omit<UserAgentEntry, 'id' | 'used' | 'createdAt'>>): void {
    const pool = this.getUserAgents();
    const now = Date.now();
    const formatted = entries.map((e, idx) => ({
      ...e,
      id: `ua_${now}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      used: false,
      createdAt: new Date().toISOString(),
    }));
    this.setItem(STORAGE_KEYS.UA_POOL, [...pool, ...formatted]);
  }

  public deleteUserAgent(id: string): void {
    const pool = this.getUserAgents().filter(item => item.id !== id);
    this.setItem(STORAGE_KEYS.UA_POOL, pool);
  }

  public deleteUserAgentsByFilter(
    deviceFilter: string = 'All',
    statusFilter: 'all' | 'available' | 'used' = 'all'
  ): number {
    const pool = this.getUserAgents();
    const kept = pool.filter(u => {
      const deviceMatches = deviceFilter === 'All' ? true : u.device === deviceFilter;
      const statusMatches =
        statusFilter === 'available' ? !u.used : statusFilter === 'used' ? u.used : true;
      return !(deviceMatches && statusMatches);
    });
    const removedCount = pool.length - kept.length;
    this.setItem(STORAGE_KEYS.UA_POOL, kept);
    return removedCount;
  }

  public deleteAllUserAgents(): void {
    this.setItem(STORAGE_KEYS.UA_POOL, []);
  }

  // Consume User Agents (Requirement: "Admin-added data must appear in the appropriate user-facing generator.
  // Match generated results to selected filters. If an optional field is empty, do not require it for matching.
  // After a successful generation, mark the selected records as used and remove them from the available pool.
  // Never send the same database entry to multiple users.")
  public consumeUserAgents(
    userId: string,
    filters: {
      device?: string;
      browser?: string;
      inAppBrowser?: string;
      country?: string;
      quantity: number;
      browserVersion?: string;
      inAppVersion?: string;
      browserVersions?: string[];
      inAppVersions?: string[];
      isBrowserVersionOn?: boolean;
      isInAppVersionOn?: boolean;
    }
  ): { results: string[]; fromPoolCount: number; generatedCount: number; error?: string } {
    const pool = this.getUserAgents();

    // Strict requirement: Only generate from admin-uploaded pool entries.
    const availablePool = pool.filter(item => !item.used);
    if (availablePool.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No User Agents available in the Database Pool. Please upload User Agents in the Admin Panel first.',
      };
    }

    // Strict device isolation: if a specific device is requested, NEVER return another device's UA.
    const strictDevice = filters.device && filters.device !== 'Any' ? filters.device : undefined;
    const devicePool = strictDevice
      ? availablePool.filter(item => (item.device as string) === strictDevice)
      : availablePool;

    if (devicePool.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: `No unused ${strictDevice || 'matching'} User Agents in the Database Pool. Please upload ${strictDevice || ''} User Agents in the Admin Panel first.`,
      };
    }

    const matching: UserAgentEntry[] = [];
    const sameDeviceFallback: UserAgentEntry[] = [];
    const targetQty = Math.max(1, Math.min(1000, filters.quantity));
    const isGlobalCountry =
      !filters.country ||
      filters.country === 'Any' ||
      filters.country === 'All Countries' ||
      filters.country === 'No Language System';

    // First pass: match exact device + optional browser, inAppBrowser, and country
    for (const item of pool) {
      if (item.used) continue;
      if (strictDevice && (item.device as string) !== strictDevice) continue;

      if (matching.length < targetQty) {
        let match = true;
        if (filters.browser && filters.browser !== 'None' && filters.browser !== 'Any' && (item.browser as string) !== filters.browser) {
          match = false;
        }
        if (filters.inAppBrowser && filters.inAppBrowser !== 'None' && filters.inAppBrowser !== 'Any' && (item.inAppBrowser as string) !== filters.inAppBrowser) {
          match = false;
        }
        if (
          !isGlobalCountry &&
          item.country &&
          item.country !== 'Any' &&
          item.country !== 'All Countries' &&
          item.country !== 'No Language System' &&
          item.country !== filters.country
        ) {
          match = false;
        }

        if (match) {
          item.used = true;
          item.usedBy = userId;
          item.usedAt = new Date().toISOString();
          matching.push(item);
          continue;
        }
      }

      // Keep same-device candidates only as secondary fallback
      sameDeviceFallback.push(item);
    }

    // Second pass: if fewer than targetQty matched optional browser/country filters,
    // relax browser/country ONLY within the EXACT SAME selected device.
    if (matching.length < targetQty) {
      for (let i = 0; i < sameDeviceFallback.length && matching.length < targetQty; i++) {
        const candidate = sameDeviceFallback[i];
        if (!candidate.used && (!strictDevice || (candidate.device as string) === strictDevice)) {
          candidate.used = true;
          candidate.usedBy = userId;
          candidate.usedAt = new Date().toISOString();
          matching.push(candidate);
        }
      }
    }

    if (matching.length > 0) {
      this.setItem(STORAGE_KEYS.UA_POOL, pool);
    }

    if (matching.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: `No available ${strictDevice || ''} User Agents found in database pool. Please upload more in the Admin Panel.`,
      };
    }

    const rawResults = matching.map(m => m.userAgentString);

    // Apply 5-version cycling if Version ON switches are enabled
    const activeBrowserVersions = filters.isBrowserVersionOn
      ? (filters.browserVersions && filters.browserVersions.length > 0
          ? filters.browserVersions
          : filters.browserVersion ? [filters.browserVersion] : [])
      : [];

    const activeInAppVersions = filters.isInAppVersionOn
      ? (filters.inAppVersions && filters.inAppVersions.length > 0
          ? filters.inAppVersions
          : filters.inAppVersion ? [filters.inAppVersion] : [])
      : [];

    const geoConfig =
      filters.country &&
      filters.country !== 'All Countries' &&
      filters.country !== 'Any' &&
      filters.country !== 'No Language System'
        ? findCountryGeo(filters.country)
        : null;

    const results = rawResults.map((ua, idx) => {
      let updated = ua;

      // 1. Browser version replacement (cycling through 5 versions)
      if (filters.isBrowserVersionOn && activeBrowserVersions.length > 0) {
        const v = activeBrowserVersions[idx % activeBrowserVersions.length].trim();
        if (v) {
          const b = filters.browser || 'Chrome';
          if (b === 'Chrome' || updated.includes('Chrome/')) {
            if (/Chrome\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/Chrome\/[0-9]+(\.[0-9]+)*/g, `Chrome/${v}`);
            }
          } else if (b === 'Firefox' || updated.includes('Firefox/')) {
            if (/Firefox\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/Firefox\/[0-9]+(\.[0-9]+)*/g, `Firefox/${v}`);
            }
          } else if (b === 'Safari' || updated.includes('Version/')) {
            if (/Version\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/Version\/[0-9]+(\.[0-9]+)*/g, `Version/${v}`);
            }
          } else if (b === 'Edge' || updated.includes('Edg/')) {
            if (/(Edg|Edge)\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/(Edg|Edge)\/[0-9]+(\.[0-9]+)*/g, `Edg/${v}`);
            }
          } else if (b === 'Opera' || updated.includes('OPR/')) {
            if (/(OPR|Opera)\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/(OPR|Opera)\/[0-9]+(\.[0-9]+)*/g, `OPR/${v}`);
            }
          }
        }
      }

      // 2. In-App webview version replacement (cycling through 5 in-app versions)
      if (filters.isInAppVersionOn && filters.inAppBrowser && filters.inAppBrowser !== 'None' && activeInAppVersions.length > 0) {
        const iv = activeInAppVersions[idx % activeInAppVersions.length].trim();
        if (iv) {
          const iab = filters.inAppBrowser;
          if (iab.includes('Facebook')) {
            if (/FBAV\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/FBAV\/[0-9]+(\.[0-9]+)*/g, `FBAV/${iv}`);
            } else {
              updated += ` [FB_IAB/FB4A;FBAV/${iv};]`;
            }
          } else if (iab === 'Instagram') {
            if (/Instagram\s+[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/Instagram\s+[0-9]+(\.[0-9]+)*/g, `Instagram ${iv}`);
            } else {
              updated += ` Instagram ${iv} Android`;
            }
          } else if (iab === 'TikTok') {
            if (/musical_ly_[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/musical_ly_[0-9]+(\.[0-9]+)*/g, `musical_ly_${iv}`);
            } else {
              updated += ` musical_ly_${iv}`;
            }
          } else if (iab === 'Twitter') {
            if (/TwitterAndroid\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/TwitterAndroid\/[0-9]+(\.[0-9]+)*/g, `TwitterAndroid/${iv}`);
            } else {
              updated += ` TwitterAndroid/${iv}`;
            }
          } else if (iab === 'LinkedIn') {
            if (/LinkedInApp\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/LinkedInApp\/[0-9]+(\.[0-9]+)*/g, `LinkedInApp/${iv}`);
            } else {
              updated += ` [LinkedInApp/${iv}]`;
            }
          } else if (iab === 'Snapchat') {
            if (/Snapchat\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/Snapchat\/[0-9]+(\.[0-9]+)*/g, `Snapchat/${iv}`);
            } else {
              updated += ` Snapchat/${iv}`;
            }
          }
        }
      }

      // 3. GEO Target Language / Country locale synchronization
      if (filters.country === 'No Language System') {
        updated = updated.replace(/;\s*[a-z]{2}-[A-Z]{2};/g, ';');
        updated = updated.replace(/;\s*[a-z]{2}_[A-Z]{2};/g, ';');
      } else if (geoConfig && geoConfig.code !== 'ALL' && geoConfig.locale) {
        const dashLocale = geoConfig.locale;
        const underLocale = geoConfig.locale.replace('-', '_');
        if (/FBLC\/[a-z]{2}_[A-Z]{2}/.test(updated)) {
          updated = updated.replace(/FBLC\/[a-z]{2}_[A-Z]{2}/g, `FBLC/${underLocale}`);
        }
        if (/;\s*[a-z]{2}-[A-Z]{2}([;\s)])/.test(updated)) {
          updated = updated.replace(/(;\s*)[a-z]{2}-[A-Z]{2}([;\s)])/g, `$1${dashLocale}$2`);
        }
        if (/;\s*[a-z]{2}_[A-Z]{2}([;\s)])/.test(updated)) {
          updated = updated.replace(/(;\s*)[a-z]{2}_[A-Z]{2}([;\s)])/g, `$1${underLocale}$2`);
        }
      }

      return updated;
    });

    return { results, fromPoolCount: matching.length, generatedCount: 0 };
  }

  public getUserAgentStatsByDevice(): Record<
    'iPhone' | 'iPad' | 'Android' | 'Windows' | 'macOS',
    { total: number; used: number; available: number }
  > {
    const uas = this.getUserAgents();
    const devices = ['iPhone', 'iPad', 'Android', 'Windows', 'macOS'] as const;
    const stats = {
      iPhone: { total: 0, used: 0, available: 0 },
      iPad: { total: 0, used: 0, available: 0 },
      Android: { total: 0, used: 0, available: 0 },
      Windows: { total: 0, used: 0, available: 0 },
      macOS: { total: 0, used: 0, available: 0 },
    };
    for (const u of uas) {
      if (devices.includes(u.device)) {
        stats[u.device].total += 1;
        if (u.used) stats[u.device].used += 1;
        else stats[u.device].available += 1;
      }
    }
    return stats;
  }

  // 2. Leads Pool
  public getLeads(): LeadEntry[] {
    return this.getItem<LeadEntry[]>(STORAGE_KEYS.LEADS_POOL, []);
  }

  public addLead(lead: Omit<LeadEntry, 'id' | 'used' | 'createdAt'>): void {
    const pool = this.getLeads();
    const newEntry: LeadEntry = {
      ...lead,
      id: 'ld_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      used: false,
      createdAt: new Date().toISOString(),
    };
    pool.push(newEntry);
    this.setItem(STORAGE_KEYS.LEADS_POOL, pool);
  }

  public addMultipleLeads(entries: Array<Omit<LeadEntry, 'id' | 'used' | 'createdAt'>>): void {
    const pool = this.getLeads();
    const now = Date.now();
    const formatted = entries.map((e, idx) => ({
      ...e,
      id: `ld_${now}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      used: false,
      createdAt: new Date().toISOString(),
    }));
    this.setItem(STORAGE_KEYS.LEADS_POOL, [...pool, ...formatted]);
  }

  public deleteLead(id: string): void {
    const pool = this.getLeads().filter(item => item.id !== id);
    this.setItem(STORAGE_KEYS.LEADS_POOL, pool);
  }

  public deleteUsedLeads(): number {
    const pool = this.getLeads();
    const kept = pool.filter(l => !l.used);
    this.setItem(STORAGE_KEYS.LEADS_POOL, kept);
    return pool.length - kept.length;
  }

  public deleteAllLeads(): void {
    this.setItem(STORAGE_KEYS.LEADS_POOL, []);
  }

  public consumeLeads(
    userId: string,
    filters: { country?: string; gender: 'Male' | 'Female' | 'Mix'; quantity: number }
  ): {
    results: Array<{ fullName: string; gender: 'Male' | 'Female'; gmail: string; phoneNumber: string }>;
    fromPoolCount: number;
    generatedCount: number;
    error?: string;
  } {
    const pool = this.getLeads();
    const availablePool = pool.filter(l => !l.used);
    if (availablePool.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No Leads available in the Database Pool. Please upload Leads in the Admin Panel first.',
      };
    }

    const matching: LeadEntry[] = [];
    const remaining: LeadEntry[] = [];
    const targetQty = Math.max(1, Math.min(100, filters.quantity));

    const isGlobalCountry = !filters.country || filters.country === 'Any' || filters.country === 'All Countries';

    for (const item of pool) {
      if (matching.length < targetQty && !item.used) {
        let match = true;
        if (!isGlobalCountry && item.country !== filters.country) match = false;
        if (filters.gender !== 'Mix' && item.gender !== filters.gender) match = false;

        if (match) {
          item.used = true;
          item.usedBy = userId;
          item.usedAt = new Date().toISOString();
          matching.push(item);
          continue;
        }
      }
      remaining.push(item);
    }

    // If specific country/gender matching count is smaller than target, fill with any available unused pool items
    if (matching.length < targetQty) {
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (!item.used && matching.length < targetQty) {
          item.used = true;
          item.usedBy = userId;
          item.usedAt = new Date().toISOString();
          matching.push(item);
          remaining.splice(i, 1);
          i--;
        }
      }
    }

    if (matching.length > 0) {
      this.setItem(STORAGE_KEYS.LEADS_POOL, [...matching, ...remaining]);
    }

    if (matching.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No matching Leads available in the Database Pool. Please upload more in Admin Panel.',
      };
    }

    const results: Array<{ fullName: string; gender: 'Male' | 'Female'; gmail: string; phoneNumber: string }> = matching.map(m => ({
      fullName: m.fullName,
      gender: m.gender,
      gmail: m.gmail,
      phoneNumber: m.phoneNumber,
    }));

    return { results, fromPoolCount: matching.length, generatedCount: 0 };
  }

  // 3. Numbers Pool
  public getNumbers(): NumberEntry[] {
    return this.getItem<NumberEntry[]>(STORAGE_KEYS.NUMBERS_POOL, []);
  }

  public addNumber(num: Omit<NumberEntry, 'id' | 'used' | 'createdAt'>): void {
    const pool = this.getNumbers();
    pool.push({
      ...num,
      id: 'num_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      used: false,
      createdAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.NUMBERS_POOL, pool);
  }

  public addMultipleNumbers(entries: Array<Omit<NumberEntry, 'id' | 'used' | 'createdAt'>>): void {
    const pool = this.getNumbers();
    const now = Date.now();
    const formatted = entries.map((e, idx) => ({
      ...e,
      id: `num_${now}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      used: false,
      createdAt: new Date().toISOString(),
    }));
    this.setItem(STORAGE_KEYS.NUMBERS_POOL, [...pool, ...formatted]);
  }

  public deleteNumber(id: string): void {
    this.setItem(STORAGE_KEYS.NUMBERS_POOL, this.getNumbers().filter(n => n.id !== id));
  }

  public deleteUsedNumbers(): number {
    const pool = this.getNumbers();
    const kept = pool.filter(n => !n.used);
    this.setItem(STORAGE_KEYS.NUMBERS_POOL, kept);
    return pool.length - kept.length;
  }

  public deleteAllNumbers(): void {
    this.setItem(STORAGE_KEYS.NUMBERS_POOL, []);
  }

  public consumeNumbers(
    userId: string,
    country: string,
    quantity: number
  ): { results: string[]; fromPoolCount: number; generatedCount: number; error?: string } {
    const pool = this.getNumbers();
    const availablePool = pool.filter(n => !n.used);
    if (availablePool.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No Phone Numbers available in the Database Pool. Please upload Numbers in the Admin Panel first.',
      };
    }

    const matching: NumberEntry[] = [];
    const remaining: NumberEntry[] = [];
    const targetQty = Math.max(1, Math.min(100, quantity));

    const isGlobalCountry = !country || country === 'Any' || country === 'All Countries';

    for (const item of pool) {
      if (matching.length < targetQty && !item.used && (isGlobalCountry || item.country === country)) {
        item.used = true;
        item.usedBy = userId;
        item.usedAt = new Date().toISOString();
        matching.push(item);
        continue;
      }
      remaining.push(item);
    }

    // If exact country match didn't yield enough, pick from any remaining unused numbers in the pool
    if (matching.length < targetQty) {
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (!item.used && matching.length < targetQty) {
          item.used = true;
          item.usedBy = userId;
          item.usedAt = new Date().toISOString();
          matching.push(item);
          remaining.splice(i, 1);
          i--;
        }
      }
    }

    if (matching.length > 0) {
      this.setItem(STORAGE_KEYS.NUMBERS_POOL, [...matching, ...remaining]);
    }

    if (matching.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No matching Phone Numbers available in the Database Pool. Please upload more in Admin Panel.',
      };
    }

    const results = matching.map(m => m.phoneNumber);
    return { results, fromPoolCount: matching.length, generatedCount: 0 };
  }

  // 4. Mails Pool
  public getMails(): MailEntry[] {
    return this.getItem<MailEntry[]>(STORAGE_KEYS.MAILS_POOL, []);
  }

  public addMail(mail: Omit<MailEntry, 'id' | 'used' | 'createdAt'>): void {
    const pool = this.getMails();
    pool.push({
      ...mail,
      id: 'ml_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      used: false,
      createdAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.MAILS_POOL, pool);
  }

  public addMultipleMails(entries: Array<Omit<MailEntry, 'id' | 'used' | 'createdAt'>>): void {
    const pool = this.getMails();
    const now = Date.now();
    const formatted = entries.map((e, idx) => ({
      ...e,
      id: `ml_${now}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      used: false,
      createdAt: new Date().toISOString(),
    }));
    this.setItem(STORAGE_KEYS.MAILS_POOL, [...pool, ...formatted]);
  }

  public deleteMail(id: string): void {
    this.setItem(STORAGE_KEYS.MAILS_POOL, this.getMails().filter(m => m.id !== id));
  }

  public deleteUsedMails(): number {
    const pool = this.getMails();
    const kept = pool.filter(m => !m.used);
    this.setItem(STORAGE_KEYS.MAILS_POOL, kept);
    return pool.length - kept.length;
  }

  public deleteAllMails(): void {
    this.setItem(STORAGE_KEYS.MAILS_POOL, []);
  }

  public consumeMails(
    userId: string,
    country: string,
    quantity: number
  ): { results: string[]; fromPoolCount: number; generatedCount: number; error?: string } {
    const pool = this.getMails();
    const availablePool = pool.filter(m => !m.used);
    if (availablePool.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No Emails available in the Database Pool. Please upload Emails in the Admin Panel first.',
      };
    }

    const matching: MailEntry[] = [];
    const remaining: MailEntry[] = [];
    const targetQty = Math.max(1, Math.min(100, quantity));

    const isGlobalCountry = !country || country === 'Any' || country === 'All Countries';

    for (const item of pool) {
      if (matching.length < targetQty && !item.used && (isGlobalCountry || item.country === country)) {
        item.used = true;
        item.usedBy = userId;
        item.usedAt = new Date().toISOString();
        matching.push(item);
        continue;
      }
      remaining.push(item);
    }

    // If exact country match didn't yield enough, pick from any remaining unused emails in the pool
    if (matching.length < targetQty) {
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (!item.used && matching.length < targetQty) {
          item.used = true;
          item.usedBy = userId;
          item.usedAt = new Date().toISOString();
          matching.push(item);
          remaining.splice(i, 1);
          i--;
        }
      }
    }

    if (matching.length > 0) {
      this.setItem(STORAGE_KEYS.MAILS_POOL, [...matching, ...remaining]);
    }

    if (matching.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: 'No matching Emails available in the Database Pool. Please upload more in Admin Panel.',
      };
    }

    const results = matching.map(m => m.email);
    return { results, fromPoolCount: matching.length, generatedCount: 0 };
  }

  // --- Real-time Pool Statistics across all tools ---
  public getPoolStats() {
    const uas = this.getUserAgents();
    const leads = this.getLeads();
    const numbers = this.getNumbers();
    const mails = this.getMails();
    return {
      ua: {
        total: uas.length,
        used: uas.filter(u => u.used).length,
        available: uas.filter(u => !u.used).length,
      },
      leads: {
        total: leads.length,
        used: leads.filter(l => l.used).length,
        available: leads.filter(l => !l.used).length,
      },
      numbers: {
        total: numbers.length,
        used: numbers.filter(n => n.used).length,
        available: numbers.filter(n => !n.used).length,
      },
      mails: {
        total: mails.length,
        used: mails.filter(m => m.used).length,
        available: mails.filter(m => !m.used).length,
      },
    };
  }

  // --- Seed Curated Data for Testing/Demo (Admin Action) ---
  public seedCuratedDemoData(): { cpaCount: number; proxyCount: number; browserCount: number; poolTotal: number } {
    // 10 CPA Networks
    const cpaNetworks: CpaNetwork[] = [
      {
        id: 'cpa_1',
        name: 'MaxBounty',
        type: 'CPA / CPL / CPS Network',
        minPayment: '$100 (Weekly / Net-15)',
        description: 'Industry-leading performance marketing network with thousands of exclusive sweepstakes, survey, and finance campaigns.',
        joinUrl: 'https://www.maxbounty.com',
      },
      {
        id: 'cpa_2',
        name: 'Perform[cb]',
        type: 'Outcome-Based CPA Network',
        minPayment: '$50 (Weekly / Monthly)',
        description: 'Ranked top CPA network worldwide for 7 consecutive years. Strong verticals in finance, dating, software, and e-commerce.',
        joinUrl: 'https://www.performcb.com',
      },
      {
        id: 'cpa_3',
        name: 'AdCombo',
        type: 'CPA / COD (Cash-On-Delivery)',
        minPayment: '$50 (Twice a week)',
        description: 'Specializes in Tier-2 and Tier-3 GEOs with proprietary COD offers, high conversion rates, and localized landing pages.',
        joinUrl: 'https://adcombo.com',
      },
      {
        id: 'cpa_4',
        name: 'ClickDealer',
        type: 'Global Affiliate Network',
        minPayment: '$100 (Monthly / Bi-weekly)',
        description: 'Giga-scale network offering smartlink technology, direct advertiser relationships, and top Tier-1 payouts.',
        joinUrl: 'https://www.clickdealer.com',
      },
      {
        id: 'cpa_5',
        name: 'Monetag',
        type: 'Popunder, Direct Link & Push',
        minPayment: '$5 (Weekly)',
        description: 'Instant monetization platform for worldwide web and social traffic with high eCPMs and low minimum withdrawal threshold.',
        joinUrl: 'https://monetag.com',
      },
      {
        id: 'cpa_6',
        name: 'Adsterra',
        type: 'Smart Direct Link & CPA Network',
        minPayment: '$5 (Bi-monthly)',
        description: 'Premier ad network & CPA hub with multi-vertical smartlinks, automated fraud protection, and rapid publisher onboarding.',
        joinUrl: 'https://adsterra.com',
      },
      {
        id: 'cpa_7',
        name: 'CPAlead',
        type: 'Content Locking & Mobile CPA',
        minPayment: '$10 (Daily / Weekly)',
        description: 'Pioneer of daily payouts and CPI/CPA content lockers. Great for gaming, tools, and entertainment traffic.',
        joinUrl: 'https://www.cpalead.com',
      },
      {
        id: 'cpa_8',
        name: 'MyLead',
        type: 'Multi-Vertical Global Affiliate',
        minPayment: '$20 (Within 48 hours)',
        description: 'Over 4,000 affiliate programs across smartlinks, sweepstakes, adult, and mainstream niches with built-in mentor support.',
        joinUrl: 'https://mylead.global',
      },
      {
        id: 'cpa_9',
        name: 'CrakRevenue',
        type: 'High-Volume CPA Network',
        minPayment: '$100 (Bi-weekly)',
        description: 'The heavyweight in dating and adult entertainment marketing with in-house creatives, high-converting pre-landers, and VIP bonuses.',
        joinUrl: 'https://www.crakrevenue.com',
      },
      {
        id: 'cpa_10',
        name: 'Toro Advertising',
        type: 'International Performance Hub',
        minPayment: '$200 (Monthly / Net-7)',
        description: 'Spanish performance network with high converting apps, surveys, crypto, and nutra campaigns in over 90 countries.',
        joinUrl: 'https://toroadvertising.com',
      },
    ];

    // 10 Proxy Sites
    const proxySites: ProxySite[] = [
      {
        id: 'prx_1',
        name: 'Bright Data',
        validity: 'Pay-As-You-Go / 30 Days',
        traffic: '72M+ Residential IPs (Unlimited Concurrency)',
        price: 'From $8.40 / GB',
        buyUrl: 'https://brightdata.com',
      },
      {
        id: 'prx_2',
        name: 'Oxylabs',
        validity: '30 Days / Custom Contract',
        traffic: '100M+ Global Residential & Datacenter IPs',
        price: 'From $8.00 / GB',
        buyUrl: 'https://oxylabs.io',
      },
      {
        id: 'prx_3',
        name: 'Smartproxy',
        validity: 'Monthly / Instant Renewal',
        traffic: '65M+ Rotating Residential & Mobile IPs',
        price: 'From $4.50 / GB',
        buyUrl: 'https://smartproxy.com',
      },
      {
        id: 'prx_4',
        name: 'IPRoyal',
        validity: 'Lifetime (Traffic Never Expires)',
        traffic: '32M+ Ethically Sourced Residential IPs',
        price: 'From $1.75 / GB',
        buyUrl: 'https://iproyal.com',
      },
      {
        id: 'prx_5',
        name: 'Webshare',
        validity: 'Monthly Subscription',
        traffic: 'Static Residential & Dedicated Datacenter',
        price: 'From $2.99 / Month (100 proxies)',
        buyUrl: 'https://www.webshare.io',
      },
      {
        id: 'prx_6',
        name: 'Proxy-Cheap',
        validity: 'Non-Expiring Bandwidth',
        traffic: '7M+ Residential & 4G/5G Mobile Proxies',
        price: 'From $2.50 / GB',
        buyUrl: 'https://proxy-cheap.com',
      },
      {
        id: 'prx_7',
        name: 'Rayobyte',
        validity: 'Monthly Billing',
        traffic: 'Enterprise ISP & Dedicated Residential Proxies',
        price: 'From $3.00 / Proxy',
        buyUrl: 'https://rayobyte.com',
      },
      {
        id: 'prx_8',
        name: 'NetNut',
        validity: '30 Days Cycle',
        traffic: 'Direct ISP-Connected Residential Proxies',
        price: 'From $7.00 / GB',
        buyUrl: 'https://netnut.io',
      },
      {
        id: 'prx_9',
        name: 'Decidata',
        validity: 'Flexible Daily / Monthly',
        traffic: 'High-speed rotating mobile and residential pools',
        price: 'From $3.50 / GB',
        buyUrl: 'https://www.decidata.com',
      },
      {
        id: 'prx_10',
        name: 'ProxyEmpire',
        validity: 'Rollover Unused Bandwidth',
        traffic: 'Over 25M Residential & Mobile rotating nodes',
        price: 'From $3.00 / GB',
        buyUrl: 'https://proxyempire.io',
      },
    ];

    // 6 Antidetect Browsers
    const antidetectBrowsers: AntidetectBrowser[] = [
      {
        id: 'adb_1',
        name: 'AdsPower',
        description: 'Multi-account management browser with advanced SunBrowser and FlowerBrowser engines, robotic automation (RPA), and browser fingerprint masking.',
        downloadUrl: 'https://www.adspower.com',
      },
      {
        id: 'adb_2',
        name: 'Dolphin Anty',
        description: 'Designed specifically for affiliate marketing, Facebook ads, Google Ads, and TikTok multi-accounting with bulk proxy check and teamwork features.',
        downloadUrl: 'https://dolphin-anty.com',
      },
      {
        id: 'adb_3',
        name: 'Multilogin',
        description: 'Pioneer antidetect technology with custom Mimic and Stealthfox browser engines, virtual hardware profiles, and enterprise cloud sync.',
        downloadUrl: 'https://multilogin.com',
      },
      {
        id: 'adb_4',
        name: 'GoLogin',
        description: 'Cost-effective antidetect browser powered by the Orbita browser engine, built-in free proxy pool, and Android fingerprint emulation.',
        downloadUrl: 'https://gologin.com',
      },
      {
        id: 'adb_5',
        name: 'Octo Browser',
        description: 'High-speed Chromium-based antidetect browser optimized for crypto airdrops, marketing multi-accounts, and pass-through spoofing.',
        downloadUrl: 'https://octobrowser.net',
      },
      {
        id: 'adb_6',
        name: 'Incogniton',
        description: 'User-friendly anti-detect browser supporting Selenium & Puppeteer integrations, cookie collectors, and flexible profile sharing.',
        downloadUrl: 'https://incogniton.com',
      },
    ];

    this.setItem(STORAGE_KEYS.CPA_NETWORKS, cpaNetworks);
    this.setItem(STORAGE_KEYS.PROXY_SITES, proxySites);
    this.setItem(STORAGE_KEYS.ANTIDETECT_BROWSERS, antidetectBrowsers);

    // Also seed initial sample pool records for admin generator databases
    const sampleUAs: Array<Omit<UserAgentEntry, 'id' | 'used' | 'createdAt'>> = [
      {
        device: 'iPhone',
        browser: 'Safari',
        inAppBrowser: 'None',
        country: 'United States',
        userAgentString: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      },
      {
        device: 'iPhone',
        browser: 'None',
        inAppBrowser: 'Facebook',
        country: 'United States',
        userAgentString: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone15,2;FBMD/Apple;FBSN/iOS;FBSV/17.4.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]',
      },
      {
        device: 'Android',
        browser: 'Chrome',
        inAppBrowser: 'None',
        country: 'United Kingdom',
        userAgentString: 'Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 Mobile Safari/537.36',
      },
      {
        device: 'Windows',
        browser: 'Chrome',
        inAppBrowser: 'None',
        country: 'Germany',
        userAgentString: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      {
        device: 'Windows',
        browser: 'Edge',
        inAppBrowser: 'None',
        country: 'Canada',
        userAgentString: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.65',
      },
      {
        device: 'macOS',
        browser: 'Safari',
        inAppBrowser: 'None',
        country: 'Australia',
        userAgentString: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
      },
    ];
    this.addMultipleUserAgents(sampleUAs);

    const sampleLeads: Array<Omit<LeadEntry, 'id' | 'used' | 'createdAt'>> = [
      {
        fullName: 'Alexander Wright',
        gender: 'Male',
        gmail: 'alexander.wright82@gmail.com',
        phoneNumber: '+1 (555) 018-9321',
        country: 'United States',
      },
      {
        fullName: 'Emily Bennett',
        gender: 'Female',
        gmail: 'emily.bennett44@gmail.com',
        phoneNumber: '+44 7700 900482',
        country: 'United Kingdom',
      },
      {
        fullName: 'Lucas Weber',
        gender: 'Male',
        gmail: 'lucas.weber99@gmail.com',
        phoneNumber: '+49 151 2938475',
        country: 'Germany',
      },
      {
        fullName: 'Chloe Dupont',
        gender: 'Female',
        gmail: 'chloe.dupont19@gmail.com',
        phoneNumber: '+33 6 82 91 03 44',
        country: 'France',
      },
    ];
    this.addMultipleLeads(sampleLeads);

    const sampleNumbers: Array<Omit<NumberEntry, 'id' | 'used' | 'createdAt'>> = [
      { country: 'United States', phoneNumber: '+1 (555) 019-3829' },
      { country: 'United Kingdom', phoneNumber: '+44 7700 900128' },
      { country: 'Canada', phoneNumber: '+1 (555) 014-9923' },
      { country: 'Germany', phoneNumber: '+49 151 2849102' },
      { country: 'Australia', phoneNumber: '+61 412 839 201' },
    ];
    this.addMultipleNumbers(sampleNumbers);

    const sampleMails: Array<Omit<MailEntry, 'id' | 'used' | 'createdAt'>> = [
      { country: 'United States', email: 'verified.marketing@example.com' },
      { country: 'United Kingdom', email: 'digital.traffic@example.co.uk' },
      { country: 'Germany', email: 'campaign.lead@example.de' },
      { country: 'Canada', email: 'client.test@example.ca' },
    ];
    this.addMultipleMails(sampleMails);

    return {
      cpaCount: cpaNetworks.length,
      proxyCount: proxySites.length,
      browserCount: antidetectBrowsers.length,
      poolTotal: sampleUAs.length + sampleLeads.length + sampleNumbers.length + sampleMails.length,
    };
  }

  // --- Resources API ---
  public getCpaNetworks(): CpaNetwork[] {
    return this.getItem<CpaNetwork[]>(STORAGE_KEYS.CPA_NETWORKS, []);
  }

  public saveCpaNetwork(item: CpaNetwork): void {
    const list = this.getCpaNetworks();
    const idx = list.findIndex(c => c.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.push({ ...item, id: item.id || 'cpa_' + Date.now() });
    }
    this.setItem(STORAGE_KEYS.CPA_NETWORKS, list);
  }

  public deleteCpaNetwork(id: string): void {
    this.setItem(STORAGE_KEYS.CPA_NETWORKS, this.getCpaNetworks().filter(c => c.id !== id));
  }

  public getProxySites(): ProxySite[] {
    return this.getItem<ProxySite[]>(STORAGE_KEYS.PROXY_SITES, []);
  }

  public saveProxySite(item: ProxySite): void {
    const list = this.getProxySites();
    const idx = list.findIndex(p => p.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.push({ ...item, id: item.id || 'prx_' + Date.now() });
    }
    this.setItem(STORAGE_KEYS.PROXY_SITES, list);
  }

  public deleteProxySite(id: string): void {
    this.setItem(STORAGE_KEYS.PROXY_SITES, this.getProxySites().filter(p => p.id !== id));
  }

  public getAntidetectBrowsers(): AntidetectBrowser[] {
    return this.getItem<AntidetectBrowser[]>(STORAGE_KEYS.ANTIDETECT_BROWSERS, []);
  }

  public saveAntidetectBrowser(item: AntidetectBrowser): void {
    const list = this.getAntidetectBrowsers();
    const idx = list.findIndex(b => b.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.push({ ...item, id: item.id || 'adb_' + Date.now() });
    }
    this.setItem(STORAGE_KEYS.ANTIDETECT_BROWSERS, list);
  }

  public deleteAntidetectBrowser(id: string): void {
    this.setItem(STORAGE_KEYS.ANTIDETECT_BROWSERS, this.getAntidetectBrowsers().filter(b => b.id !== id));
  }

  // --- Usage History ---
  public getUsageHistory(userId?: string): UsageHistoryEntry[] {
    const history = this.getItem<UsageHistoryEntry[]>(STORAGE_KEYS.USAGE_HISTORY, []);
    if (!userId) return history;
    return history.filter(h => h.userId === userId);
  }

  public recordUsage(
    userId: string,
    toolSlug: string,
    toolName: string,
    resultCount: number,
    status: 'Success' | 'Failed' = 'Success',
    summary?: string
  ): void {
    const history = this.getItem<UsageHistoryEntry[]>(STORAGE_KEYS.USAGE_HISTORY, []);
    const now = new Date();
    const entry: UsageHistoryEntry = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId,
      toolSlug,
      toolName,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resultCount,
      status,
      summary,
    };
    history.unshift(entry);
    this.setItem(STORAGE_KEYS.USAGE_HISTORY, history);
  }

  public clearUsageHistory(userId: string): void {
    const history = this.getItem<UsageHistoryEntry[]>(STORAGE_KEYS.USAGE_HISTORY, []);
    const filtered = history.filter(h => h.userId !== userId);
    this.setItem(STORAGE_KEYS.USAGE_HISTORY, filtered);
  }

  // --- Saved Results (Separated Per User) ---
  public getSavedResults(userId: string): SavedResult[] {
    const all = this.getItem<SavedResult[]>(STORAGE_KEYS.SAVED_RESULTS, []);
    return all.filter(s => s.userId === userId);
  }

  public saveResult(userId: string, toolSlug: string, toolName: string, title: string, resultsText: string, count: number): SavedResult {
    const all = this.getItem<SavedResult[]>(STORAGE_KEYS.SAVED_RESULTS, []);
    const newEntry: SavedResult = {
      id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId,
      toolSlug,
      toolName,
      title: title || `${toolName} Export - ${new Date().toLocaleDateString()}`,
      resultsText,
      count,
      savedDate: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    all.unshift(newEntry);
    this.setItem(STORAGE_KEYS.SAVED_RESULTS, all);
    return newEntry;
  }

  public deleteSavedResult(id: string, userId: string): void {
    const all = this.getItem<SavedResult[]>(STORAGE_KEYS.SAVED_RESULTS, []);
    const filtered = all.filter(s => !(s.id === id && s.userId === userId));
    this.setItem(STORAGE_KEYS.SAVED_RESULTS, filtered);
  }

  // --- Support Messaging ---
  public getSupportTickets(userId?: string): SupportTicket[] {
    const tickets = this.getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, []);
    if (!userId) return tickets;
    return tickets.filter(t => t.userId === userId);
  }

  public createSupportTicket(user: User, subject: string, messageText: string): SupportTicket {
    const tickets = this.getSupportTickets();
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      id: 'ticket_' + Date.now(),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.gmail,
      subject: subject.trim(),
      status: 'open',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'msg_' + Date.now(),
          sender: 'user',
          senderName: user.fullName,
          text: messageText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        },
      ],
    };
    tickets.unshift(newTicket);
    this.setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return newTicket;
  }

  public replyToTicket(ticketId: string, sender: 'user' | 'admin', senderName: string, text: string): void {
    const tickets = this.getSupportTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].messages.push({
        id: 'msg_' + Date.now(),
        sender,
        senderName,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      });
      tickets[idx].status = sender === 'admin' ? 'replied' : 'open';
      tickets[idx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    }
  }

  public updateTicketStatus(ticketId: string, status: 'open' | 'replied' | 'closed'): void {
    const tickets = this.getSupportTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].status = status;
      tickets[idx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    }
  }

  // --- Website Content Management ---
  public getWebsiteContent(): WebsiteContent {
    return this.getItem<WebsiteContent>(STORAGE_KEYS.WEBSITE_CONTENT, DEFAULT_WEBSITE_CONTENT);
  }

  public updateWebsiteContent(content: Partial<WebsiteContent>): void {
    const current = this.getWebsiteContent();
    const updated = { ...current, ...content };
    this.setItem(STORAGE_KEYS.WEBSITE_CONTENT, updated);
  }

  // --- Payment System (bKash, Nagad, Rocket, Binance + Admin Approval / Decline) ---
  public getPaymentGateways(): PaymentGatewaySettings {
    return this.getItem<PaymentGatewaySettings>(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_GATEWAYS);
  }

  public updatePaymentGateways(settings: Partial<PaymentGatewaySettings>): void {
    const current = this.getPaymentGateways();
    this.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, { ...current, ...settings });
  }

  public getPaymentPackages(): PaymentPackage[] {
    return DEFAULT_PAYMENT_PACKAGES;
  }

  public getPaymentRequests(userId?: string): PaymentRequest[] {
    const list = this.getItem<PaymentRequest[]>(STORAGE_KEYS.PAYMENT_REQUESTS, []);
    if (!userId) return list;
    return list.filter(r => r.userId === userId);
  }

  public submitPaymentRequest(
    user: User,
    data: {
      packageId: string;
      packageName: string;
      method: PaymentMethod;
      currency: 'BDT' | 'USDT';
      amount: number;
      senderAccount: string;
      transactionId: string;
      note?: string;
    }
  ): { success: boolean; request?: PaymentRequest; error?: string } {
    const cleanTrx = data.transactionId.trim();
    const cleanSender = data.senderAccount.trim();
    if (!cleanSender) {
      return { success: false, error: 'Please enter your Sender Number / Binance ID.' };
    }
    if (!cleanTrx || cleanTrx.length < 4) {
      return { success: false, error: 'Please enter a valid Transaction ID (TrxID).' };
    }
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0.' };
    }

    const requests = this.getPaymentRequests();
    const duplicate = requests.find(
      r => r.transactionId.toLowerCase() === cleanTrx.toLowerCase() && r.status !== 'declined'
    );
    if (duplicate) {
      return { success: false, error: 'This Transaction ID has already been submitted and is pending or approved.' };
    }

    const newReq: PaymentRequest = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.gmail,
      packageId: data.packageId,
      packageName: data.packageName,
      method: data.method,
      currency: data.currency,
      amount: Number(data.amount),
      senderAccount: cleanSender,
      transactionId: cleanTrx,
      note: data.note?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newReq);
    this.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, requests);

    // Update user planStatus to pending if not currently active
    const users = this.getUsers();
    const uIdx = users.findIndex(u => u.id === user.id);
    if (uIdx !== -1 && users[uIdx].planStatus !== 'active') {
      users[uIdx].planStatus = 'pending';
      users[uIdx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.USERS, users);
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        this.setCurrentUser(users[uIdx]);
      }
    }

    return { success: true, request: newReq };
  }

  public approvePaymentRequest(
    requestId: string,
    adminEmail: string,
    adminNote?: string
  ): { success: boolean; error?: string } {
    const requests = this.getPaymentRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Payment request not found.' };

    const req = requests[idx];
    req.status = 'approved';
    req.adminNote = adminNote?.trim() || 'Payment verified and approved.';
    req.reviewedBy = adminEmail;
    req.reviewedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, requests);

    // Activate plan on the user record
    const users = this.getUsers();
    const uIdx = users.findIndex(u => u.id === req.userId);
    if (uIdx !== -1) {
      users[uIdx].plan = req.packageName;
      users[uIdx].planStatus = 'active';
      users[uIdx].planUpdatedAt = new Date().toISOString();
      users[uIdx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.USERS, users);

      const current = this.getCurrentUser();
      if (current && current.id === req.userId) {
        this.setCurrentUser(users[uIdx]);
      }
    }

    return { success: true };
  }

  public declinePaymentRequest(
    requestId: string,
    adminEmail: string,
    reason?: string
  ): { success: boolean; error?: string } {
    const requests = this.getPaymentRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Payment request not found.' };

    const req = requests[idx];
    req.status = 'declined';
    req.adminNote = reason?.trim() || 'Transaction could not be verified. Please check your TrxID and resubmit.';
    req.reviewedBy = adminEmail;
    req.reviewedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, requests);

    // Update user planStatus if they don't have an active plan
    const users = this.getUsers();
    const uIdx = users.findIndex(u => u.id === req.userId);
    if (uIdx !== -1 && users[uIdx].planStatus !== 'active') {
      const hasOtherPending = requests.some(r => r.userId === req.userId && r.status === 'pending');
      users[uIdx].planStatus = hasOtherPending ? 'pending' : 'none';
      users[uIdx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.USERS, users);

      const current = this.getCurrentUser();
      if (current && current.id === req.userId) {
        this.setCurrentUser(users[uIdx]);
      }
    }

    return { success: true };
  }
}

export const db = new DatabaseService();
