import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import type { ApiAuthResponse, OtpPurpose } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (
    gmail: string,
    pass: string
  ) => Promise<{ success: boolean; user?: User; emailNotVerified?: boolean; error?: string }>;
  signUp: (fullName: string, mobile: string, gmail: string, pass: string) => Promise<ApiAuthResponse>;
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
      const res = await db.authenticate(gmail, pass);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return {
        success: false,
        emailNotVerified: res.emailNotVerified,
        error: res.error || 'Authentication failed',
      };
    } catch {
      return { success: false, error: 'An unexpected error occurred during sign in.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (fullName: string, mobile: string, gmail: string, pass: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      const res = await db.registerUser(fullName, mobile, gmail, pass);
      if (res.success && res.user) {
        // confirmation is switched off: the user is already signed in
        setUser(res.user);
        return { success: true, verified: true };
      }
      if (res.success) {
        return {
          success: true,
          requiresVerification: true,
          cooldownSeconds: res.cooldownSeconds ?? 60,
          expiresInSeconds: res.expiresInSeconds ?? 3600,
        };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'An unexpected error occurred during registration.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email: string, otp: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      const res = await db.verifySignupOtp(email, otp);
      if (res.success) {
        // sign in screen asks for the password again, so end the temporary session
        db.setCurrentUser(null);
        setUser(null);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string, purpose: OtpPurpose): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      return purpose === 'password_reset'
        ? await db.requestPasswordResetOtp(email)
        : await db.resendSignupOtp(email);
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      return await db.requestPasswordResetOtp(email);
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOtp = async (email: string, otp: string): Promise<ApiAuthResponse> => {
    setLoading(true);
    try {
      return await db.verifyRecoveryOtp(email, otp);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    _email: string,
    _resetToken: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiAuthResponse> => {
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Password and Confirm Password do not match.' };
    }
    setLoading(true);
    try {
      const res = await db.setPasswordAfterRecovery(newPassword);
      if (res.success) setUser(null);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
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
