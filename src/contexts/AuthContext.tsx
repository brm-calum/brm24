import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AUTH_ERRORS, AuthError } from '../lib/errors';
import { signIn as authSignIn, signOut as authSignOut } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  userRoles: string[];
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setUserRoles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRoles(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', userId);

    if (error) {
      setError('Failed to fetch user roles');
      return;
    }

    setUserRoles(data.map((role) => role.roles.name));
    setIsLoading(false);
  }

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    setError(null);
    await authSignIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new AuthError(AUTH_ERRORS.INVALID_EMAIL);
    }

    if (password.length < 8) {
      throw new AuthError(AUTH_ERRORS.WEAK_PASSWORD);
    }

    setError(null);
    const { data: authData, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      if (error.message.includes('already registered')) {
        throw new AuthError(AUTH_ERRORS.EMAIL_IN_USE);
      }
      throw new AuthError(error.message);
    }

    // Get all non-admin roles
    const { data: roles } = await supabase
      .from('roles')
      .select('id, name')
      .neq('name', 'administrator');

    if (roles && authData.user) {
      // Assign all non-admin roles to the new user
      const userRoles = roles.map(role => ({
        user_id: authData.user.id,
        role_id: role.id,
      }));

      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(userRoles);

      if (rolesError) {
        console.error('Failed to assign roles:', rolesError);
      }
    }
  };

  const signOut = async () => {
    setError(null);
    await authSignOut();
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return userRoles.includes(role);
  };

  const clearError = () => setError(null);

  const value = {
    user,
    userRoles,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    hasRole,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}