// Shared types for the sign-up / OTP / password-reset screens.
// (All real work is done by Supabase Auth inside services/db.ts)

export type OtpPurpose = 'email_verification' | 'password_reset';

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
}
