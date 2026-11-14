export type Role = 'user' | 'admin';
export type UserStatus = 'active' | 'deactivated';

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  gmail: string;
  passwordHash: string;
  salt: string;
  role: Role;
  status: UserStatus;
  plan?: string;
  planStatus?: 'none' | 'pending' | 'active';
  planUpdatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Binance';
export type PaymentStatus = 'pending' | 'approved' | 'declined';

export interface PaymentPackage {
  id: string;
  name: string;
  priceBdt: number;
  priceUsdt: number;
  durationLabel: string;
  description: string;
  features: string[];
}

export interface PaymentGatewaySettings {
  bkashNumber: string;
  bkashType: string;
  nagadNumber: string;
  nagadType: string;
  rocketNumber: string;
  rocketType: string;
  binancePayId: string;
  binanceTrc20Address: string;
  binanceBep20Address: string;
  instructionsNote: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  method: PaymentMethod;
  currency: 'BDT' | 'USDT';
  amount: number;
  senderAccount: string;
  transactionId: string;
  note?: string;
  status: PaymentStatus;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  enabled: boolean;
  iconName: string;
}

export interface UserAgentEntry {
  id: string;
  device: 'iPhone' | 'iPad' | 'Android' | 'Windows' | 'macOS';
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'None';
  inAppBrowser: 'Facebook' | 'Facebook Lite' | 'Instagram' | 'Twitter' | 'LinkedIn' | 'Snapchat' | 'TikTok' | 'None';
  country: string;
  userAgentString: string;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface LeadEntry {
  id: string;
  fullName: string;
  gender: 'Male' | 'Female';
  gmail: string;
  phoneNumber: string;
  country: string;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface NumberEntry {
  id: string;
  country: string;
  phoneNumber: string;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface MailEntry {
  id: string;
  country: string;
  email: string;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface CpaNetwork {
  id: string;
  name: string;
  type: string;
  minPayment: string;
  description: string;
  joinUrl: string;
}

export interface ProxySite {
  id: string;
  name: string;
  validity: string;
  traffic: string;
  price: string;
  buyUrl: string;
}

export interface AntidetectBrowser {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportChatMessage[];
}

export interface UsageHistoryEntry {
  id: string;
  userId: string;
  toolSlug: string;
  toolName: string;
  date: string;
  time: string;
  resultCount: number;
  status: 'Success' | 'Failed';
  summary?: string;
}

export interface SavedResult {
  id: string;
  userId: string;
  toolSlug: string;
  toolName: string;
  title: string;
  resultsText: string;
  count: number;
  savedDate: string;
}

export interface WebsiteContent {
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  aboutTitle: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  contactTelegram: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    tiktok: string;
    telegram: string;
  };
  footerDescription: string;
}
