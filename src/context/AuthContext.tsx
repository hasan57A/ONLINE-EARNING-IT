import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthReady: boolean;
  cloudConnected: boolean;
  loading: boolean;
  signIn: (gmail: string, pass: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (fullName: string, mobile: string, gmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
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
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(() => db.isCloudConnected());

  const refreshUser = useCallback(() => {
    setUser(db.getCurrentUser());
    setCloudConnected(db.isCloudConnected());
  }, []);

  useEffect(() => {
    const unsubDb = db.subscribe(() => {
      refreshUser();
    });

    if (!isSupabaseConfigured || !supabase) {
      setCloudConnected(false);
      setIsAuthReady(true);
      return () => {
        unsubDb();
      };
    }

    const syncSessionUser = async (sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (sbUser && sbUser.email) {
        try {
          const displayName =
            (sbUser.user_metadata?.full_name as string | undefined) ||
            (sbUser.user_metadata?.name as string | undefined) ||
            sbUser.email.split('@')[0];
          const res = await db.authenticateWithSupabaseUser(sbUser.id, sbUser.email, displayName);
          if (res.success && res.user) {
            setUser(res.user);
            setCloudConnected(true);
          } else {
            await supabase?.auth.signOut();
            db.stopCloudUserSync();
            setCloudConnected(false);
          }
        } catch (err) {
          console.error('Supabase user sync failed:', err);
          setCloudConnected(false);
        }
      } else {
        db.stopCloudUserSync();
        setCloudConnected(false);
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => syncSessionUser(data.session?.user ?? null))
      .finally(() => setIsAuthReady(true));

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        db.stopCloudUserSync();
        setCloudConnected(false);
      } else if (session?.user) {
        void syncSessionUser(session.user);
      }
      setIsAuthReady(true);
    });

    return () => {
      unsubDb();
      authListener.subscription.unsubscribe();
    };
  }, [refreshUser]);

  const signIn = async (gmail: string, pass: string) => {
    setLoading(true);
    try {
      const res = await db.authenticate(gmail, pass);
      if (res.success && res.user) {
        setUser(res.user);
        if (isSupabaseConfigured && supabase) {
          void supabase.auth.signInWithPassword({ email: gmail.trim(), password: pass });
        }
        return { success: true, user: res.user };
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: gmail.trim(),
          password: pass,
        });
        if (!error && data.user?.email) {
          const displayName =
            (data.user.user_metadata?.full_name as string | undefined) ||
            data.user.email.split('@')[0];
          const synced = await db.authenticateWithSupabaseUser(data.user.id, data.user.email, displayName);
          if (synced.success && synced.user) {
            setUser(synced.user);
            setCloudConnected(true);
            return { success: true, user: synced.user };
          }
        }
      }

      return { success: false, error: res.error || 'Authentication failed' };
    } catch {
      return { success: false, error: 'An unexpected error occurred during sign in.' };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
      };
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (fullName: string, mobile: string, gmail: string, pass: string) => {
    setLoading(true);
    try {
      const res = await db.registerUser(fullName, mobile, gmail, pass);
      if (res.success && res.user) {
        if (isSupabaseConfigured && supabase) {
          void supabase.auth.signUp({
            email: gmail.trim().toLowerCase(),
            password: pass,
            options: { data: { full_name: fullName.trim(), mobile: mobile.trim() } },
          });
        }
        db.setCurrentUser(res.user);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'An unexpected error occurred during registration.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    db.stopCloudUserSync();
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut();
    }
    db.setCurrentUser(null);
    setUser(null);
    setCloudConnected(false);
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
        isAuthReady,
        cloudConnected,
        loading,
        signIn,
        signInWithGoogle,
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
