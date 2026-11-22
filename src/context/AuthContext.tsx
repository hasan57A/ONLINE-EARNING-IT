import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (gmail: string, pass: string) => Promise<{ success: boolean; user?: User; error?: string }>;
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
      return { success: false, error: res.error || 'Authentication failed' };
    } catch {
      return { success: false, error: 'An unexpected error occurred during sign in.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (fullName: string, mobile: string, gmail: string, pass: string) => {
    setLoading(true);
    try {
      const res = await db.registerUser(fullName, mobile, gmail, pass);
      if (res.success && res.user) {
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
