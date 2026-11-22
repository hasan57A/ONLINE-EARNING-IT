import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const hasValidUrl =
  Boolean(rawUrl) &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('YOUR_PROJECT_REF');

const hasValidAnonKey =
  Boolean(rawAnonKey) &&
  rawAnonKey.length > 20 &&
  !rawAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = hasValidUrl && hasValidAnonKey;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function getEdgeFunctionUrl(functionName: string): string {
  const base = rawUrl.replace(/\/+$/, '');
  return `${base}/functions/v1/${functionName}`;
}

export function getSupabaseAnonKey(): string {
  return rawAnonKey;
}
