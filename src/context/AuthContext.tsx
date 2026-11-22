import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { authApi, ApiAuthResponse, OtpPurpose } from '../services/authApi';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (
    gmail: string,
    pass: string
  ) => Promise<{ success: boolean; user?: User; emailNotVerified?: boolean; error?: string }>;
  signUp: (
    fullName: string,
    mobile: string,
    gmail: string,
    pass: string
  ) => Promise<ApiAuthResponse>;
  verifyEmailOtp: (email: string, otp: string) => Promise<ApiAuthResponse>;
  resendOtp: (email: string, purpose: OtpPurpose) => Promise<ApiAuthResponse>;
  requestPasswordReset: (email: string) => Promise<ApiAuthResponse>;
  verifyResetOtp: (email: string, otp: string) => Promise<ApiAuthResponse>;
  resetPassword: (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<ApiAuthResponse>;
  signOut: () => void;
  updateProfile: (data: {
    fullName?: string;
    username?: string;
    mobile?: string;
    telegramUsername?: string;
    twoFactorEnabled?: boolean;
    newPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const refreshUser = useCallback(() => {
    setUser(db.getCurrentUser());
  }, []);

  useEffect(() => {
    const unsubDb = db.subscribe(() => {
      refreshUser();
    });
    return () => {
      unsubDb();
    };
  }, [refreshUser]);

  const signIn = async (gmail: string, pass: string) => {
    setLoading(true);
    try {
      const cleanEmail = gmail.trim().toLowerCase();
      const apiRes = await authApi.login({ email: cleanEmail, password: pass });

      if (apiRes.success && apiRes.profile) {
        const synced = await db.syncAuthProfile(apiRes.profile);
        db.setCurrentUser(synced);
        setUser(synced);
        return { success: true, user: synced };
      }

      if (apiRes.emailNotVerified || apiRes.code === 'EMAIL_NOT_VERIFIED') {
        return {
          success: false,
          emailNotVerified: true,
          error:
            apiRes.error ||
            'Your email is not verified yet. Please verify your 6-digit OTP before signing in.',
        };
      }

      // Preserve compatibility for pre-existing local-only users/admins not yet in backend store
      if (apiRes.code === 'USER_NOT_FOUND' || apiRes.code === 'NETWORK_ERROR') {
        const localRes = await db.authenticate(cleanEmail, pass);
        if (localRes.success && localRes.user) {
          setUser(localRes.user);
          return { success: true, user: localRes.user };
        }
        return {
          success: false,
          emailNotVerified: localRes.emailNotVerified,
          error: localRes.error || apiRes.error || 'Authentication failed',
        };
      }

      return { success: false, error: apiRes.error || 'Authentication failed' };
    } catch {
      return { success: false, error: 'An unexpected error occurred during sign in.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    fullName: string,
    mobile: string,
    gmail: string,
    pass: string
  ): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      const cleanEmail = gmail.trim().toLowerCase();
      const apiRes = await authApi.register({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: cleanEmail,
        password: pass,
      });

      if (apiRes.success) {
        // Email verification is disabled; create a locally verified account record.
        const localResult = await db.registerUser(fullName, mobile, cleanEmail, pass);
        if (localResult.user) {
          localResult.user.emailVerified = true;
        }
      }

      return { ...apiRes, requiresVerification: false, verified: Boolean(apiRes.success) };
    } catch {
      return {
        success: false,
        error: 'An unexpected error occurred during registration.',
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email: string, otp: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await authApi.verifyOtp({
        email: cleanEmail,
        otp: otp.trim(),
        purpose: 'email_verification',
      });
      if (res.success) {
        await db.markEmailVerified(cleanEmail);
        if (res.profile) {
          await db.syncAuthProfile(res.profile);
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string, purpose: OtpPurpose): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      return await authApi.resendOtp({ email: email.trim().toLowerCase(), purpose });
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      return await authApi.forgotPassword({ email: email.trim().toLowerCase() });
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOtp = async (email: string, otp: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      return await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose: 'password_reset',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await authApi.resetPassword({
        email: cleanEmail,
        resetToken,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        await db.syncResetPassword(cleanEmail, newPassword);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    db.setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = async (data: {
    fullName?: string;
    username?: string;
    mobile?: string;
    telegramUsername?: string;
    twoFactorEnabled?: boolean;
    newPassword?: string;
  }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const res = await db.updateUserProfile(user.id, data);
    if (res.success) {
      refreshUser();
    }
    return res;
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        signIn,
        signUp,
        verifyEmailOtp,
        resendOtp,
        requestPasswordReset,
        verifyResetOtp,
        resetPassword,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
