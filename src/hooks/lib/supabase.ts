import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

const isValidHttpUrl = (val: string) =>
  val.startsWith('https://') || val.startsWith('http://');

const isPlaceholder = (val: string) =>
  !val ||
  val.includes('your-project-id') ||
  val.includes('your-supabase-anon-key') ||
  val.startsWith('MY_');

export const isSupabaseConfigured: boolean =
  isValidHttpUrl(rawUrl) &&
  !isPlaceholder(rawUrl) &&
  !isPlaceholder(rawAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function clampStr(val: unknown, max: number): string {
  if (typeof val !== 'string') return '';
  return val.length > max ? val.slice(0, max) : val;
}

export function sanitizeId(id: string): string {
  return String(id || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
}
