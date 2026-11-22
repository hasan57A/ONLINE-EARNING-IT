import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { authApi, ApiAuthResponse } from '../services/authApi';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (
    gmail: string,
    pass: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (
    fullName: string,
    mobile: string,
    gmail: string,
    pass: string
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


      // Preserve compatibility for pre-existing local-only users/admins not yet in backend store
      if (apiRes.code === 'USER_NOT_FOUND' || apiRes.code === 'NETWORK_ERROR') {
        const localRes = await db.authenticate(cleanEmail, pass);
        if (localRes.success && localRes.user) {
          setUser(localRes.user);
          return { success: true, user: localRes.user };
        }
        return {
          success: false,
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
        // Keep the local registry in sync with the newly created account.
        await db.registerUser(fullName, mobile, cleanEmail, pass);
      }

      return apiRes;
    } catch {
      return {
        success: false,
        error: 'An unexpected error occurred during registration.',
      };
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
