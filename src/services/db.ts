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
  SupportChannel,
  AnnouncementPost,
  UserPreferences,
} from '../types';
import { findCountryGeo } from '../data/countries';

// Helper for cryptographic hashing
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt + 'oe_salt_pepper_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  SUPPORT_CHANNELS: 'oe_support_channels_v2',
  ANNOUNCEMENTS: 'oe_announcements_v2',
  USER_PREFERENCES: 'oe_user_preferences_v2',
};

const DEFAULT_SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'ch_tg_1',
    type: 'telegram',
    name: 'Official Support',
    handleOrNumber: '@OnlineEarningIT_Official',
    isPrimary: true,
    status: 'active',
    visibleToUsers: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_tg_2',
    type: 'telegram',
    name: 'Marketing Support',
    handleOrNumber: '@OEIT_MarketingDesk',
    isPrimary: false,
    status: 'active',
    visibleToUsers: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_wa_1',
    type: 'whatsapp',
    name: 'Support WhatsApp 1',
    handleOrNumber: '+880 1712-345678',
    isPrimary: true,
    status: 'active',
    visibleToUsers: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_wa_2',
    type: 'whatsapp',
    name: 'Support WhatsApp 2',
    handleOrNumber: '+880 1812-345679',
    isPrimary: false,
    status: 'active',
    visibleToUsers: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ch_wa_3',
    type: 'whatsapp',
    name: 'Sales WhatsApp',
    handleOrNumber: '+880 1912-345680',
    isPrimary: false,
    status: 'active',
    visibleToUsers: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_ANNOUNCEMENTS: AnnouncementPost[] = [
  {
    id: 'ann_1',
    title: 'New Feature: Multi-Device UA Forge & Batch Exports',
    message: 'Generate realistic User Agents across iPhone, iPad, Android, Windows, and macOS with instant TXT/CSV export and in-app webview versioning.',
    type: 'Update',
    audience: 'All Users',
    status: 'Published',
    recipientsCount: 0,
    thumbnailVariant: 'tool',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'ann_2',
    title: 'Special Offer: 20% Bonus Credits on Pro & Agency Plans',
    message: 'Upgrade or top up your credit package this week to unlock priority pool allocation and bonus campaign credits.',
    type: 'Announcement',
    audience: 'All Users',
    status: 'Published',
    recipientsCount: 0,
    thumbnailVariant: 'bonus',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ann_3',
    title: 'Global Phone Number & GEO Lead Pool Refreshed',
    message: 'Fresh US, UK, CA, DE, BD, and AU phone numbers and formatted lead datasets have been added to the synchronized pools.',
    type: 'Notice',
    audience: 'Premium Users',
    status: 'Published',
    recipientsCount: 0,
    thumbnailVariant: 'maintenance',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'English',
  timeZone: '(UTC+06:00) Dhaka, Bangladesh',
  dateFormat: 'DD MMM YYYY',
  themeMode: 'dark',
  rgbEffects: true,
  animations: true,
  sidebarStyle: 'full',
  fontStyle: 'Plus Jakarta Sans',
  soundEnabled: true,
  buttonClickSound: true,
  generateSound: true,
  copySound: true,
  notificationSound: true,
  soundVolume: 30,
  emailNotifications: true,
  toolUpdatesNotif: true,
  announcementsNotif: true,
  securityAlertsNotif: true,
  marketingEmailsNotif: false,
  defaultQuantity: 20,
  defaultCountry: 'All Countries',
  defaultOutputFormat: 'TXT',
  autoCopyAfterGenerate: false,
  showToolTips: true,
  loginAlerts: true,
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

export const TOOL_CREDIT_COSTS = {
  UA: 1,
  LEAD: 5,
  NUMBER: 2,
  MAIL: 3,
  TEXT_SHUFFLER: 0,
  DUPLICATE_REMOVER: 0,
} as const;

const DEFAULT_PAYMENT_PACKAGES: PaymentPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter Pass',
    priceBdt: 500,
    priceUsdt: 5,
    credits: 500,
    durationLabel: '30 Days',
    description: 'Essential package with 500 credits for User Agent, Number, Mail & Lead tools.',
    features: ['500 Tool Credits Included', 'All Generator Tools Access', 'Global GEO & Language Targeting'],
  },
  {
    id: 'pkg_pro',
    name: 'Pro Marketer',
    priceBdt: 1200,
    priceUsdt: 12,
    credits: 1500,
    durationLabel: '90 Days',
    description: 'Extended campaign toolkit with 1,500 credits for active media buyers and CPA marketers.',
    features: ['1,500 Tool Credits Included', 'Priority Pool Allocation', 'Multi-Device UA Batching & Exports'],
  },
  {
    id: 'pkg_agency',
    name: 'Agency Lifetime',
    priceBdt: 2500,
    priceUsdt: 25,
    credits: 10000,
    durationLabel: '1 Year',
    description: 'Maximum operational scale with 10,000 credits for affiliate teams and high-volume traffic.',
    features: ['10,000 Tool Credits Included', 'High-Volume Batch Generations', 'Dedicated Support Channel'],
  },
];

class DatabaseService {
  private listeners: Set<() => void> = new Set();
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initDefaults();
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
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // Initialize essential schema
  private async initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.TOOLS)) {
      this.setItem(STORAGE_KEYS.TOOLS, DEFAULT_TOOLS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WEBSITE_CONTENT)) {
      this.setItem(STORAGE_KEYS.WEBSITE_CONTENT, DEFAULT_WEBSITE_CONTENT);
    }
    // Per requirements: "All public resource cards and database sections should remain empty until the admin adds information."
    if (!localStorage.getItem(STORAGE_KEYS.CPA_NETWORKS)) {
      this.setItem(STORAGE_KEYS.CPA_NETWORKS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROXY_SITES)) {
      this.setItem(STORAGE_KEYS.PROXY_SITES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANTIDETECT_BROWSERS)) {
      this.setItem(STORAGE_KEYS.ANTIDETECT_BROWSERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.UA_POOL)) {
      this.setItem(STORAGE_KEYS.UA_POOL, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS_POOL)) {
      this.setItem(STORAGE_KEYS.LEADS_POOL, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NUMBERS_POOL)) {
      this.setItem(STORAGE_KEYS.NUMBERS_POOL, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MAILS_POOL)) {
      this.setItem(STORAGE_KEYS.MAILS_POOL, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS)) {
      this.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, DEFAULT_PAYMENT_GATEWAYS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_REQUESTS)) {
      this.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPORT_CHANNELS)) {
      this.setItem(STORAGE_KEYS.SUPPORT_CHANNELS, DEFAULT_SUPPORT_CHANNELS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)) {
      this.setItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
    }
    this.applyUserPreferencesToDom(this.getUserPreferences());

    const existingUsers = this.getItem<User[]>(STORAGE_KEYS.USERS, []);
    let usersUpdated = false;

    if (!localStorage.getItem(STORAGE_KEYS.USERS) || existingUsers.length === 0) {
      const adminSalt = generateSalt();
      const adminHash = await hashPassword('Admin@OEIT2026!', adminSalt);
      const defaultAdmin: User = {
        id: 'admin_master_001',
        fullName: 'Master Administrator',
        mobile: '+1 (555) 019-2026',
        gmail: 'admin@onlineearningit.com',
        passwordHash: adminHash,
        salt: adminSalt,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const ownerSalt = generateSalt();
      const ownerHash = await hashPassword('Admin@OEIT2026!', ownerSalt);
      const ownerAdmin: User = {
        id: 'admin_owner_002',
        fullName: 'Platform Owner',
        mobile: '+1 (555) 019-2834',
        gmail: 'mybusinessforunitedstates@gmail.com',
        passwordHash: ownerHash,
        salt: ownerSalt,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      existingUsers.push(defaultAdmin, ownerAdmin);
      usersUpdated = true;
    }

    // Ensure the primary owner admin account (arittechofficial@gmail.com) is always provisioned & active
    const arittechEmail = 'arittechofficial@gmail.com';
    const arittechIdx = existingUsers.findIndex(u => u.gmail.toLowerCase() === arittechEmail);

    if (arittechIdx === -1) {
      const arittechSalt = generateSalt();
      const arittechHash = await hashPassword('Arifinazad99@#@', arittechSalt);
      existingUsers.push({
        id: 'admin_arittech_003',
        fullName: 'Arittech Official',
        mobile: '+8801700000000',
        gmail: arittechEmail,
        passwordHash: arittechHash,
        salt: arittechSalt,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      usersUpdated = true;
    } else if (existingUsers[arittechIdx].role !== 'admin' || existingUsers[arittechIdx].status !== 'active') {
      const arittechSalt = generateSalt();
      const arittechHash = await hashPassword('Arifinazad99@#@', arittechSalt);
      existingUsers[arittechIdx].salt = arittechSalt;
      existingUsers[arittechIdx].passwordHash = arittechHash;
      existingUsers[arittechIdx].role = 'admin';
      existingUsers[arittechIdx].status = 'active';
      usersUpdated = true;
    }

    if (usersUpdated) {
      this.setItem(STORAGE_KEYS.USERS, existingUsers);
    }

    // Keep current logged-in session role synced with ADMIN_EMAILS whitelist
    const current = this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (current && this.ADMIN_EMAILS.includes(current.gmail.toLowerCase()) && current.role !== 'admin') {
      this.setItem(STORAGE_KEYS.CURRENT_USER, { ...current, role: 'admin', status: 'active' });
    }
  }

  // Master Admin Whitelist (Strict Access: Only designated site owner accounts have admin privileges)
  private readonly ADMIN_EMAILS = [
    'arittechofficial@gmail.com',
    'mybusinessforunitedstates@gmail.com',
    'admin@onlineearningit.com',
  ];

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  public async registerUser(fullName: string, mobile: string, gmail: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> {
    await this.initPromise;
    const users = this.getUsers();
    const cleanEmail = gmail.trim().toLowerCase();

    if (!cleanEmail.endsWith('@gmail.com')) {
      return { success: false, error: 'Registration requires a valid Gmail address (@gmail.com).' };
    }
    if (users.some(u => u.gmail.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'This Gmail address is already registered. Please sign in.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(pass, salt);

    // Only the verified owner email gets admin; all regular users strictly get 'user' role
    const isOwnerAdmin = this.ADMIN_EMAILS.includes(cleanEmail);

    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      gmail: cleanEmail,
      passwordHash,
      salt,
      role: isOwnerAdmin ? 'admin' : 'user',
      status: 'active',
      planStatus: 'none',
      credits: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    return { success: true, user: newUser };
  }

  public async authenticate(gmail: string, pass: string): Promise<{ success: boolean; error?: string; user?: User }> {
    await this.initPromise;
    const users = this.getUsers();
    const cleanEmail = gmail.trim().toLowerCase();
    const user = users.find(u => u.gmail.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this Gmail address.' };
    }

    if (user.status === 'deactivated') {
      return { success: false, error: 'Your account has been deactivated by the administrator. Please contact support.' };
    }

    const computedHash = await hashPassword(pass, user.salt);
    if (computedHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Strict security guarantee: Only whitelisted owner email addresses can hold admin privileges
    if (this.ADMIN_EMAILS.includes(cleanEmail)) {
      user.role = 'admin';
    } else {
      user.role = 'user';
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  public getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public setCurrentUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
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

  public async updateUserProfile(
    userId: string,
    data: {
      fullName?: string;
      username?: string;
      mobile?: string;
      telegramUsername?: string;
      twoFactorEnabled?: boolean;
      newPassword?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };

    if (data.fullName !== undefined) users[idx].fullName = data.fullName.trim();
    if (data.username !== undefined) users[idx].username = data.username.trim().replace(/^@/, '');
    if (data.mobile !== undefined) users[idx].mobile = data.mobile.trim();
    if (data.telegramUsername !== undefined) {
      const cleanTg = data.telegramUsername.trim();
      users[idx].telegramUsername = cleanTg ? (cleanTg.startsWith('@') ? cleanTg : `@${cleanTg}`) : '';
      users[idx].telegramVerified = Boolean(cleanTg);
    }
    if (data.twoFactorEnabled !== undefined) {
      users[idx].twoFactorEnabled = data.twoFactorEnabled;
    }
    if (data.newPassword) {
      if (data.newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      const newSalt = generateSalt();
      users[idx].salt = newSalt;
      users[idx].passwordHash = await hashPassword(data.newPassword, newSalt);
    }
    users[idx].updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.USERS, users);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(users[idx]);
    }
    return { success: true };
  }

  public adminUpdateUserDetails(
    userId: string,
    patch: {
      fullName?: string;
      role?: 'user' | 'admin';
      status?: 'active' | 'deactivated';
      adminNote?: string;
    }
  ): { success: boolean; error?: string } {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found.' };
    if (patch.fullName !== undefined) users[idx].fullName = patch.fullName.trim();
    if (patch.role !== undefined) users[idx].role = patch.role;
    if (patch.status !== undefined) users[idx].status = patch.status;
    if (patch.adminNote !== undefined) users[idx].adminNote = patch.adminNote;
    users[idx].updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.USERS, users);
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(users[idx]);
    }
    return { success: true };
  }

  public adminDeleteUser(userId: string): { success: boolean; error?: string } {
    const target = this.getUserById(userId);
    if (!target) return { success: false, error: 'User not found.' };
    if (this.ADMIN_EMAILS.includes(target.gmail.toLowerCase())) {
      return { success: false, error: 'Master owner accounts cannot be deleted.' };
    }
    const next = this.getUsers().filter(u => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, next);
    return { success: true };
  }

  // --- Package & Credit Access Enforcement ---
  public canUseTool(
    userId?: string,
    requiredCredits: number = 1
  ): {
    allowed: boolean;
    isAdmin: boolean;
    hasActivePackage: boolean;
    hasUsablePackage: boolean;
    packageCredits?: number;
    remainingCredits: number;
    planName?: string;
    planStatus: 'none' | 'pending' | 'active';
    reason?: string;
  } {
    const user = (userId ? this.getUserById(userId) : null) || this.getCurrentUser();
    if (!user) {
      return {
        allowed: false,
        isAdmin: false,
        hasActivePackage: false,
        hasUsablePackage: false,
        remainingCredits: 0,
        planStatus: 'none',
        reason: 'Please sign in to access marketing tools.',
      };
    }

    if (user.role === 'admin') {
      return {
        allowed: true,
        isAdmin: true,
        hasActivePackage: true,
        hasUsablePackage: true,
        remainingCredits: 999999,
        planName: 'Admin Unlimited',
        planStatus: 'active',
      };
    }

    const planStatus: 'none' | 'pending' | 'active' = user.planStatus || 'none';
    const remainingCredits = Math.max(0, Math.floor(Number(user.credits ?? 0)));
    const matchedPkg = DEFAULT_PAYMENT_PACKAGES.find(
      p => p.name === user.plan || p.id === user.plan
    );
    const packageCredits = matchedPkg?.credits;

    if (planStatus !== 'active') {
      return {
        allowed: false,
        isAdmin: false,
        hasActivePackage: false,
        hasUsablePackage: false,
        packageCredits,
        remainingCredits,
        planName: user.plan,
        planStatus,
        reason:
          planStatus === 'pending'
            ? 'Your package payment is pending admin approval. Tools will unlock as soon as it is approved.'
            : 'Active Package Required! Without an active package and credits, tools cannot generate.',
      };
    }

    if (remainingCredits <= 0) {
      return {
        allowed: false,
        isAdmin: false,
        hasActivePackage: true,
        hasUsablePackage: false,
        packageCredits,
        remainingCredits: 0,
        planName: user.plan,
        planStatus,
        reason: 'Your package credits are finished (0 Credits remaining). Please purchase a package to continue generating.',
      };
    }

    if (remainingCredits < requiredCredits) {
      return {
        allowed: false,
        isAdmin: false,
        hasActivePackage: true,
        hasUsablePackage: true,
        packageCredits,
        remainingCredits,
        planName: user.plan,
        planStatus,
        reason: `Insufficient credits: ${requiredCredits} required, but only ${remainingCredits} credits remaining. Lower your quantity or buy another package.`,
      };
    }

    return {
      allowed: true,
      isAdmin: false,
      hasActivePackage: true,
      hasUsablePackage: true,
      packageCredits,
      remainingCredits,
      planName: user.plan,
      planStatus,
    };
  }

  public deductUserCredits(
    userId: string,
    amount: number
  ): { success: boolean; remainingCredits: number; error?: string } {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    const current = this.getCurrentUser();
    const targetUser = idx !== -1 ? users[idx] : current && current.id === userId ? current : null;

    if (!targetUser) {
      return { success: false, remainingCredits: 0, error: 'User account not found.' };
    }
    if (targetUser.role === 'admin') {
      return { success: true, remainingCredits: 999999 };
    }
    if (targetUser.planStatus !== 'active') {
      return { success: false, remainingCredits: 0, error: 'Active package required.' };
    }

    const cleanAmount = Math.max(1, Math.floor(amount));
    const currentCredits = Math.max(0, Math.floor(Number(targetUser.credits ?? 0)));
    if (currentCredits < cleanAmount) {
      return {
        success: false,
        remainingCredits: currentCredits,
        error: `Insufficient credits (${currentCredits} available, ${cleanAmount} needed).`,
      };
    }

    const nextCredits = currentCredits - cleanAmount;
    const nextUsedCredits = Math.max(0, Math.floor(Number(targetUser.usedCredits ?? 0))) + cleanAmount;
    const nowIso = new Date().toISOString();

    if (idx !== -1) {
      users[idx].credits = nextCredits;
      users[idx].usedCredits = nextUsedCredits;
      users[idx].updatedAt = nowIso;
      this.setItem(STORAGE_KEYS.USERS, users);
    }
    if (current && current.id === userId) {
      this.setCurrentUser({ ...current, credits: nextCredits, usedCredits: nextUsedCredits, updatedAt: nowIso });
    }

    return { success: true, remainingCredits: nextCredits };
  }

  public adminUpdateUserPackageAndCredits(
    userId: string,
    credits: number,
    planName?: string,
    planStatus?: 'none' | 'pending' | 'active'
  ): { success: boolean; error?: string } {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found.' };

    const cleanCredits = Math.max(0, Math.min(10000000, Math.floor(Number(credits) || 0)));
    const nextPlanStatus = planStatus ?? (cleanCredits > 0 ? 'active' : users[idx].planStatus || 'none');
    const nextPlan = planName !== undefined ? planName.trim() : users[idx].plan || (nextPlanStatus === 'active' ? 'Starter Pass' : undefined);
    const nowIso = new Date().toISOString();

    users[idx].credits = cleanCredits;
    users[idx].planStatus = nextPlanStatus;
    if (nextPlan !== undefined) {
      users[idx].plan = nextPlan;
      users[idx].planUpdatedAt = nowIso;
    }
    users[idx].updatedAt = nowIso;
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
    const formatted: UserAgentEntry[] = entries.map((e, idx) => ({
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
    const access = this.canUseTool(userId, Math.max(1, Math.min(1000, filters.quantity || 1)));
    if (!access.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: access.reason || 'Active package and credits are required to generate User Agents.',
      };
    }

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

    // Strict device, browser, and in-app browser isolation:
    // NEVER return another device's, browser's, or in-app browser's UA.
    const strictDevice = filters.device && filters.device !== 'Any' ? filters.device : undefined;
    const strictBrowser = filters.browser && filters.browser !== 'Any' ? filters.browser : undefined;
    const strictInApp =
      filters.inAppBrowser === 'Any'
        ? undefined
        : filters.inAppBrowser && filters.inAppBrowser !== ''
        ? filters.inAppBrowser
        : 'None';

    const matchesStrictCriteria = (item: UserAgentEntry): boolean => {
      if (item.used) return false;
      if (strictDevice && (item.device as string) !== strictDevice) return false;
      if (strictBrowser && (item.browser || 'None') !== strictBrowser) return false;
      if (strictInApp !== undefined && (item.inAppBrowser || 'None') !== strictInApp) return false;
      return true;
    };

    const strictPool = pool.filter(matchesStrictCriteria);

    if (strictPool.length === 0) {
      const filterDesc = [
        strictDevice,
        strictBrowser === 'None' ? 'No Browser' : strictBrowser,
        strictInApp && strictInApp !== 'None' ? strictInApp : undefined,
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: `No unused ${filterDesc || 'matching'} User Agents in the Database Pool. Please upload ${
          filterDesc || 'matching'
        } User Agents in the Admin Panel first.`,
      };
    }

    const matching: UserAgentEntry[] = [];
    const sameFilterCountryFallback: UserAgentEntry[] = [];
    const targetQty = Math.max(1, Math.min(1000, filters.quantity));
    const isGlobalCountry =
      !filters.country ||
      filters.country === 'Any' ||
      filters.country === 'All Countries' ||
      filters.country === 'No Language System';

    // First pass: match exact device + browser + inAppBrowser + country (or global entries)
    for (const item of strictPool) {
      if (matching.length < targetQty) {
        const countryMatches =
          isGlobalCountry ||
          !item.country ||
          item.country === 'Any' ||
          item.country === 'All Countries' ||
          item.country === 'No Language System' ||
          item.country === filters.country;

        if (countryMatches) {
          item.used = true;
          item.usedBy = userId;
          item.usedAt = new Date().toISOString();
          matching.push(item);
          continue;
        }
      }

      // Keep same device + same browser + same inAppBrowser entries for country fallback only
      sameFilterCountryFallback.push(item);
    }

    // Second pass: if fewer than targetQty matched the specific country,
    // relax country ONLY within the EXACT SAME device + browser + inAppBrowser.
    if (matching.length < targetQty) {
      for (let i = 0; i < sameFilterCountryFallback.length && matching.length < targetQty; i++) {
        const candidate = sameFilterCountryFallback[i];
        if (!candidate.used) {
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
        error: `No available ${strictDevice || ''} ${strictBrowser || ''} User Agents found in database pool. Please upload more in the Admin Panel.`,
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
          const b = filters.browser && filters.browser !== 'None' ? filters.browser : undefined;
          if (b === 'Opera') {
            if (/(OPR|Opera)\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/(OPR|Opera)\/[0-9]+(\.[0-9]+)*/g, `OPR/${v}`);
            }
          } else if (b === 'Edge') {
            if (/(Edg|EdgA|EdgiOS|Edge)\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/(Edg|EdgA|EdgiOS|Edge)\/[0-9]+(\.[0-9]+)*/g, `$1/${v}`);
            }
          } else if (b === 'Firefox') {
            if (/(Firefox|FxiOS)\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/(Firefox|FxiOS)\/[0-9]+(\.[0-9]+)*/g, `$1/${v}`);
            }
          } else if (b === 'Safari') {
            if (/Version\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/Version\/[0-9]+(\.[0-9]+)*/g, `Version/${v}`);
            }
          } else if (b === 'Chrome') {
            if (/(Chrome|CriOS)\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/(Chrome|CriOS)\/[0-9]+(\.[0-9]+)*/g, `$1/${v}`);
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
          } else if (iab === 'WeChat') {
            if (/MicroMessenger\/[0-9]+(\.[0-9]+)*/.test(updated)) {
              updated = updated.replace(/MicroMessenger\/[0-9]+(\.[0-9]+)*/g, `MicroMessenger/${iv}`);
            } else {
              updated += ` MicroMessenger/${iv}`;
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

    this.deductUserCredits(userId, results.length);
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
    const formatted: LeadEntry[] = entries.map((e, idx) => ({
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
    const targetQty = Math.max(1, Math.min(100, filters.quantity || 1));
    const minAccess = this.canUseTool(userId, TOOL_CREDIT_COSTS.LEAD);
    if (!minAccess.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: minAccess.reason || 'Active package and credits (5 Credits/Lead) are required to generate Leads.',
      };
    }

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

    const effectiveQty = Math.min(targetQty, availablePool.length);
    const batchAccess = this.canUseTool(userId, effectiveQty * TOOL_CREDIT_COSTS.LEAD);
    if (!batchAccess.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: batchAccess.reason || `Insufficient credits: ${effectiveQty * TOOL_CREDIT_COSTS.LEAD} Credits required.`,
      };
    }

    const matching: LeadEntry[] = [];
    const remaining: LeadEntry[] = [];

    const isGlobalCountry = !filters.country || filters.country === 'Any' || filters.country === 'All Countries';

    for (const item of pool) {
      if (matching.length < effectiveQty && !item.used) {
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
    if (matching.length < effectiveQty) {
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (!item.used && matching.length < effectiveQty) {
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

    this.deductUserCredits(userId, results.length * TOOL_CREDIT_COSTS.LEAD);
    return { results, fromPoolCount: matching.length, generatedCount: 0 };
  }

  // 3. Numbers Pool
  public getNumbers(): NumberEntry[] {
    return this.getItem<NumberEntry[]>(STORAGE_KEYS.NUMBERS_POOL, []);
  }

  public addNumber(num: Omit<NumberEntry, 'id' | 'used' | 'createdAt'>): void {
    const pool = this.getNumbers();
    const newEntry: NumberEntry = {
      ...num,
      id: 'num_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      used: false,
      createdAt: new Date().toISOString(),
    };
    pool.push(newEntry);
    this.setItem(STORAGE_KEYS.NUMBERS_POOL, pool);
  }

  public addMultipleNumbers(entries: Array<Omit<NumberEntry, 'id' | 'used' | 'createdAt'>>): void {
    const pool = this.getNumbers();
    const now = Date.now();
    const formatted: NumberEntry[] = entries.map((e, idx) => ({
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
    const targetQty = Math.max(1, Math.min(100, quantity || 1));
    const minAccess = this.canUseTool(userId, TOOL_CREDIT_COSTS.NUMBER);
    if (!minAccess.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: minAccess.reason || 'Active package and credits (2 Credits/Number) are required to generate Numbers.',
      };
    }

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

    const effectiveQty = Math.min(targetQty, availablePool.length);
    const batchAccess = this.canUseTool(userId, effectiveQty * TOOL_CREDIT_COSTS.NUMBER);
    if (!batchAccess.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: batchAccess.reason || `Insufficient credits: ${effectiveQty * TOOL_CREDIT_COSTS.NUMBER} Credits required.`,
      };
    }

    const matching: NumberEntry[] = [];
    const remaining: NumberEntry[] = [];

    const isGlobalCountry = !country || country === 'Any' || country === 'All Countries';

    for (const item of pool) {
      if (matching.length < effectiveQty && !item.used && (isGlobalCountry || item.country === country)) {
        item.used = true;
        item.usedBy = userId;
        item.usedAt = new Date().toISOString();
        matching.push(item);
        continue;
      }
      remaining.push(item);
    }

    // If exact country match didn't yield enough, pick from any remaining unused numbers in the pool
    if (matching.length < effectiveQty) {
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (!item.used && matching.length < effectiveQty) {
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
    this.deductUserCredits(userId, results.length * TOOL_CREDIT_COSTS.NUMBER);
    return { results, fromPoolCount: matching.length, generatedCount: 0 };
  }

  // 4. Mails Pool
  public getMails(): MailEntry[] {
    return this.getItem<MailEntry[]>(STORAGE_KEYS.MAILS_POOL, []);
  }

  public addMail(mail: Omit<MailEntry, 'id' | 'used' | 'createdAt'>): void {
    const pool = this.getMails();
    const newEntry: MailEntry = {
      ...mail,
      id: 'ml_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      used: false,
      createdAt: new Date().toISOString(),
    };
    pool.push(newEntry);
    this.setItem(STORAGE_KEYS.MAILS_POOL, pool);
  }

  public addMultipleMails(entries: Array<Omit<MailEntry, 'id' | 'used' | 'createdAt'>>): void {
    const pool = this.getMails();
    const now = Date.now();
    const formatted: MailEntry[] = entries.map((e, idx) => ({
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
    quantity: number,
    domain?: string
  ): { results: string[]; fromPoolCount: number; generatedCount: number; error?: string } {
    const targetQty = Math.max(1, Math.min(100, quantity || 1));
    const minAccess = this.canUseTool(userId, TOOL_CREDIT_COSTS.MAIL);
    if (!minAccess.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: minAccess.reason || 'Active package and credits (3 Credits/Email) are required to generate Emails.',
      };
    }

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

    const normalizedDomain =
      domain && domain !== 'all' ? domain.trim().toLowerCase().replace(/^@/, '') : '';
    const matchesDomain = (email: string) =>
      !normalizedDomain || email.toLowerCase().endsWith(`@${normalizedDomain}`);

    const domainAvailablePool = normalizedDomain
      ? availablePool.filter(m => matchesDomain(m.email))
      : availablePool;

    if (domainAvailablePool.length === 0) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: `No @${normalizedDomain} emails available in the Database Pool. Upload @${normalizedDomain} emails in Admin Panel or switch to All Domains.`,
      };
    }

    const effectiveQty = Math.min(targetQty, domainAvailablePool.length);
    const batchAccess = this.canUseTool(userId, effectiveQty * TOOL_CREDIT_COSTS.MAIL);
    if (!batchAccess.allowed) {
      return {
        results: [],
        fromPoolCount: 0,
        generatedCount: 0,
        error: batchAccess.reason || `Insufficient credits: ${effectiveQty * TOOL_CREDIT_COSTS.MAIL} Credits required.`,
      };
    }

    const matching: MailEntry[] = [];
    const remaining: MailEntry[] = [];

    const isGlobalCountry = !country || country === 'Any' || country === 'All Countries';

    for (const item of pool) {
      if (
        matching.length < effectiveQty &&
        !item.used &&
        matchesDomain(item.email) &&
        (isGlobalCountry || item.country === country)
      ) {
        item.used = true;
        item.usedBy = userId;
        item.usedAt = new Date().toISOString();
        matching.push(item);
        continue;
      }
      remaining.push(item);
    }

    // If exact country match didn't yield enough, pick from any remaining unused emails matching the selected domain
    if (matching.length < effectiveQty) {
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (!item.used && matchesDomain(item.email) && matching.length < effectiveQty) {
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
    this.deductUserCredits(userId, results.length * TOOL_CREDIT_COSTS.MAIL);
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
      { country: 'United States', email: 'alex.morgan.us@gmail.com' },
      { country: 'United States', email: 'sarah.jenkins.cpa@gmail.com' },
      { country: 'United Kingdom', email: 'oliver.clark.uk@gmail.com' },
      { country: 'Canada', email: 'liam.hudson.ca@gmail.com' },
      { country: 'Germany', email: 'max.schmidt.de@gmail.com' },
      { country: 'Bangladesh', email: 'rafiq.islam.bd@gmail.com' },
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
    const saved = { ...item, id: item.id || 'cpa_' + Date.now() };
    const idx = list.findIndex(c => c.id === saved.id);
    if (idx !== -1) {
      list[idx] = saved;
    } else {
      list.push(saved);
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
    const saved = { ...item, id: item.id || 'prx_' + Date.now() };
    const idx = list.findIndex(p => p.id === saved.id);
    if (idx !== -1) {
      list[idx] = saved;
    } else {
      list.push(saved);
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
    const saved = { ...item, id: item.id || 'adb_' + Date.now() };
    const idx = list.findIndex(b => b.id === saved.id);
    if (idx !== -1) {
      list[idx] = saved;
    } else {
      list.push(saved);
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
      const msg = {
        id: 'msg_' + Date.now(),
        sender,
        senderName,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      };
      tickets[idx].messages.push(msg);
      const nextStatus: 'open' | 'replied' | 'closed' = sender === 'admin' ? 'replied' : 'open';
      tickets[idx].status = nextStatus;
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
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
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

    const matchedPkg = DEFAULT_PAYMENT_PACKAGES.find(p => p.id === data.packageId);
    const packageCredits = matchedPkg?.credits ?? 500;

    const newReq: PaymentRequest = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.gmail,
      packageId: data.packageId,
      packageName: data.packageName,
      packageCredits,
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
    if (req.status === 'approved') {
      return { success: false, error: 'This payment request has already been approved.' };
    }

    const matchedPkg = DEFAULT_PAYMENT_PACKAGES.find(p => p.id === req.packageId || p.name === req.packageName);
    const grantedCredits = req.packageCredits ?? matchedPkg?.credits ?? 500;

    req.status = 'approved';
    req.packageCredits = grantedCredits;
    req.adminNote = adminNote?.trim() || `Approved (+${grantedCredits.toLocaleString()} Credits added).`;
    req.reviewedBy = adminEmail;
    req.reviewedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, requests);

    const users = this.getUsers();
    const uIdx = users.findIndex(u => u.id === req.userId);
    if (uIdx !== -1) {
      const nextCredits = Math.max(0, Math.floor(Number(users[uIdx].credits ?? 0))) + grantedCredits;
      users[uIdx].plan = req.packageName;
      users[uIdx].planStatus = 'active';
      users[uIdx].credits = nextCredits;
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

  // --- Support Ticket Admin Notes ---
  public updateTicketAdminNote(ticketId: string, adminNote: string): void {
    const tickets = this.getSupportTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].adminNote = adminNote;
      tickets[idx].updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    }
  }

  // --- Support Channels Management (Telegram & WhatsApp) ---
  public getSupportChannels(): SupportChannel[] {
    const list = this.getItem<SupportChannel[]>(STORAGE_KEYS.SUPPORT_CHANNELS, DEFAULT_SUPPORT_CHANNELS);
    return [...list].sort((a, b) => a.order - b.order);
  }

  public saveSupportChannel(channel: Omit<SupportChannel, 'createdAt'> & { createdAt?: string }): void {
    const list = this.getSupportChannels();
    const idx = list.findIndex(c => c.id === channel.id);
    const fullItem: SupportChannel = {
      ...channel,
      createdAt: channel.createdAt || new Date().toISOString(),
    };
    if (fullItem.isPrimary) {
      list.forEach(c => {
        if (c.type === fullItem.type && c.id !== fullItem.id) {
          c.isPrimary = false;
        }
      });
    }
    if (idx !== -1) {
      list[idx] = fullItem;
    } else {
      list.push(fullItem);
    }
    this.setItem(STORAGE_KEYS.SUPPORT_CHANNELS, list);
  }

  public deleteSupportChannel(id: string): void {
    const list = this.getSupportChannels().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.SUPPORT_CHANNELS, list);
  }

  // --- Announcements & Notifications Management ---
  public getAnnouncements(): AnnouncementPost[] {
    const list = this.getItem<AnnouncementPost[]>(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveAnnouncement(post: Omit<AnnouncementPost, 'createdAt'> & { createdAt?: string }): void {
    const list = this.getAnnouncements();
    const idx = list.findIndex(p => p.id === post.id);
    const fullItem: AnnouncementPost = {
      ...post,
      createdAt: post.createdAt || new Date().toISOString(),
    };
    if (idx !== -1) {
      list[idx] = fullItem;
    } else {
      list.unshift(fullItem);
    }
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  public deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  // --- User Settings & Preferences ---
  public applyUserPreferencesToDom(prefs: UserPreferences): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.font = prefs.fontStyle || 'Plus Jakarta Sans';
    root.classList.toggle('oe-no-rgb', prefs.rgbEffects === false);
    root.classList.toggle('oe-reduced-motion', prefs.animations === false);

    const mode = prefs.themeMode || 'dark';
    const isLight =
      mode === 'light' ||
      (mode === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: light)').matches);
    root.classList.toggle('dark', !isLight);
    root.classList.toggle('oe-light', isLight);
    root.dataset.colorMode = isLight ? 'light' : 'dark';

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('oe-prefs-changed'));
      window.dispatchEvent(new CustomEvent('oe-theme-changed'));
    }
  }

  public getUserPreferences(): UserPreferences {
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...this.getItem<Partial<UserPreferences>>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES),
    };
  }

  public updateUserPreferences(patch: Partial<UserPreferences>): UserPreferences {
    const next = { ...this.getUserPreferences(), ...patch };
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, next);
    this.applyUserPreferencesToDom(next);
    return next;
  }

  public resetUserPreferences(): UserPreferences {
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES);
    this.applyUserPreferencesToDom(DEFAULT_USER_PREFERENCES);
    return DEFAULT_USER_PREFERENCES;
  }

  public rotateUserSession(userId?: string): string {
    const now = new Date().toISOString();
    try {
      localStorage.setItem('oe_session_rotated_at', now);
      if (userId) {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
          users[idx].lastLoginAt = now;
          users[idx].updatedAt = now;
          this.setItem(STORAGE_KEYS.USERS, users);
          const current = this.getCurrentUser();
          if (current && current.id === userId) {
            this.setCurrentUser(users[idx]);
          }
        }
      }
    } catch {
      // Ignore storage quota errors
    }
    return now;
  }

  public submitContactInquiry(data: {
    name: string;
    email: string;
    message: string;
    user?: User | null;
  }): { ticketId?: string; saved: boolean } {
    if (data.user) {
      const ticket = this.createSupportTicket(
        data.user,
        `Website Inquiry (${data.name.trim()})`,
        data.message.trim()
      );
      return { ticketId: ticket.id, saved: true };
    }
    try {
      const key = 'oe_contact_inquiries';
      const existing = this.getItem<Array<{ id: string; name: string; email: string; message: string; createdAt: string }>>(key, []);
      existing.unshift({
        id: 'inq_' + Date.now(),
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
        createdAt: new Date().toISOString(),
      });
      this.setItem(key, existing.slice(0, 50));
      return { saved: true };
    } catch {
      return { saved: false };
    }
  }
}

export const db = new DatabaseService();
