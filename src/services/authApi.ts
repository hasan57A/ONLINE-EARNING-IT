import {
  getEdgeFunctionUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';

export type OtpPurpose = 'email_verification' | 'password_reset';

export interface AuthUserProfilePayload {
  id: string;
  fullName?: string;
  full_name?: string;
  username?: string;
  mobile?: string;
  gmail?: string;
  email?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'deactivated';
  plan?: string;
  planStatus?: 'none' | 'pending' | 'active';
  plan_status?: 'none' | 'pending' | 'active';
  credits?: number;
  usedCredits?: number;
  used_credits?: number;
  emailVerified?: boolean;
  email_verified?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface ApiAuthResponse {
  success: boolean;
  error?: string;
  code?: string;
  message?: string;
  email?: string;
  requiresVerification?: boolean;
  verified?: boolean;
  emailNotVerified?: boolean;
  cooldownSeconds?: number;
  expiresInSeconds?: number;
  remainingAttempts?: number;
  lockedUntil?: string;
  retryAfterSeconds?: number;
  resetToken?: string;
  previewUrl?: string;
  profile?: AuthUserProfilePayload;
  session?: {
    access_token: string;
    refresh_token: string;
  };
}

let useLocalBackendFallback = false;

async function postJson(
  url: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>
): Promise<{
  ok: boolean;
  status: number;
  isJson: boolean;
  data?: ApiAuthResponse;
  networkError?: boolean;
}> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, isJson: false };
    }

    const data = (await res.json()) as ApiAuthResponse;
    if (!res.ok && data.success !== false) {
      data.success = false;
    }

    return { ok: res.ok, status: res.status, isJson: true, data };
  } catch {
    return { ok: false, status: 0, isJson: false, networkError: true };
  }
}

async function callAuthEndpoint(
  edgeFunctionName: string,
  localPath: string,
  payload: Record<string, unknown>
): Promise<ApiAuthResponse> {
  if (isSupabaseConfigured && !useLocalBackendFallback) {
    const anonKey = getSupabaseAnonKey();
    const edgeResult = await postJson(
      getEdgeFunctionUrl(edgeFunctionName),
      {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      payload
    );

    // If Edge Function is deployed and returned a valid JSON payload (and not 404 NOT_FOUND), return it
    if (edgeResult.isJson && edgeResult.data && edgeResult.status !== 404) {
      return edgeResult.data;
    }

    // Edge Function unreachable (CORS / not deployed yet / network error) -> try same-origin /api/auth/* backend
    const localResult = await postJson(
      localPath,
      { 'Content-Type': 'application/json' },
      payload
    );

    if (localResult.isJson && localResult.data) {
      useLocalBackendFallback = true;
      console.info(
        `Supabase Edge Function "${edgeFunctionName}" unavailable; switched to local auth API (${localPath}).`
      );
      return localResult.data;
    }

    return {
      success: false,
      code: 'EDGE_FUNCTION_UNREACHABLE',
      error:
        'Authentication service is unreachable. If deploying with Supabase, ensure Edge Functions are deployed and ALLOWED_ORIGIN permits this site.',
    };
  }

  const localResult = await postJson(
    localPath,
    { 'Content-Type': 'application/json' },
    payload
  );

  if (localResult.isJson && localResult.data) {
    return localResult.data;
  }

  return {
    success: false,
    code: 'NETWORK_ERROR',
    error: 'Unable to reach authentication server. Please check your connection and try again.',
  };
}

export const authApi = {
  async register(input: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
  }): Promise<ApiAuthResponse> {
    return callAuthEndpoint('auth-register', '/api/auth/register', input);
  },

  async verifyOtp(input: {
    email: string;
    otp: string;
    purpose: OtpPurpose;
  }): Promise<ApiAuthResponse> {
    return callAuthEndpoint('auth-verify-otp', '/api/auth/verify-otp', input);
  },

  async resendOtp(input: {
    email: string;
    purpose: OtpPurpose;
  }): Promise<ApiAuthResponse> {
    return callAuthEndpoint('auth-resend-otp', '/api/auth/resend-otp', input);
  },

  async login(input: { email: string; password: string }): Promise<ApiAuthResponse> {
    const res = await callAuthEndpoint('auth-login', '/api/auth/login', input);
    if (res.success && res.session && supabase) {
      try {
        await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
      } catch (err) {
        console.warn('Could not persist Supabase client session:', err);
      }
    }
    return res;
  },

  async forgotPassword(input: { email: string }): Promise<ApiAuthResponse> {
    return callAuthEndpoint('auth-forgot-password', '/api/auth/forgot-password', input);
  },

  async resetPassword(input: {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiAuthResponse> {
    return callAuthEndpoint('auth-reset-password', '/api/auth/reset-password', input);
  },
};
