import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  phone: string;
  balance: number;
  is_admin: boolean;
  is_agent: boolean;
  is_verified: boolean;
  verification_status: string;
  bio: string;
  total_profile_views: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  generatePasswordResetLink: (email: string) => Promise<{ error: AuthError | null; data?: any }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, profile: null, loading: true,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const timeout = new Promise<null>((res) => setTimeout(() => res(null), 4000));
      const query = Promise.resolve(
        supabase.from('profiles')
          .select('id, name, avatar_url, phone, balance, is_admin, is_agent, is_verified, verification_status, bio, total_profile_views')
          .eq('id', userId).single()
      ).then(({ data }) => data as UserProfile | null).catch(() => null);
      return await Promise.race([query, timeout]);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({ ...s, user: session?.user ?? null, session, loading: false }));
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => setState(s => ({ ...s, profile })));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(s => ({ ...s, user: session?.user ?? null, session, loading: false }));
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => setState(s => ({ ...s, profile })));
      } else {
        setState(s => ({ ...s, profile: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, name: string, phone: string): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError };
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } });
    if (error) return { error };
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, phone, avatar_url: '', balance: 0, is_admin: false, is_verified: false, verification_status: '', bio: '', total_profile_views: 0 });
    }
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return { error: signInError };
    }
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError };
    
    console.log('SignIn attempt:', email);
    
    // Admin logins from env (build-time only — NOT secure for production; use Supabase custom claims instead)
    const adminAccounts: Record<string, { password: string; name: string }> = {
      [import.meta.env.VITE_ADMIN_EMAIL_1 || '']: { password: import.meta.env.VITE_ADMIN_PASS_1 || '', name: 'Admin' },
      [import.meta.env.VITE_ADMIN_EMAIL_2 || '']: { password: import.meta.env.VITE_ADMIN_PASS_2 || '', name: 'Super Admin' },
    };

    const adminAccount = adminAccounts[email];
    if (adminAccount && password === adminAccount.password) {
      console.log('Admin login detected:', email);
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.log('Sign in failed, creating user:', signInError);
        // If user doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: adminAccount.name, phone: '' } }
        });
        if (signUpError) return { error: signUpError };
        if (signUpData.user) {
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            name: adminAccount.name,
            phone: '',
            avatar_url: '',
            balance: 0,
            is_admin: true,
            is_agent: false,
            is_verified: false,
            verification_status: '',
            bio: '',
            total_profile_views: 0,
          });
        }
        // Sign in after creating
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (retryError) return { error: retryError };
        // Refresh profile after sign in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profile = await fetchProfile(user.id);
          console.log('Profile after creation:', profile);
          setState(s => ({ ...s, user, profile }));
        }
        return { error: null };
      }
      console.log('Sign in successful:', signInData.user);
      // Ensure admin status after successful sign in
      if (signInData.user) {
        await supabase.from('profiles').upsert({
          id: signInData.user.id,
          name: adminAccount.name,
          phone: '',
          avatar_url: '',
          balance: 0,
          is_admin: true,
          is_agent: false,
          is_verified: false,
          verification_status: '',
          bio: '',
          total_profile_views: 0,
        });
        // Refresh profile to get admin status
        const profile = await fetchProfile(signInData.user.id);
        console.log('Profile after admin set:', profile);
        setState(s => ({ ...s, profile }));
      }
      return { error: null };
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState(s => ({ ...s, profile }));
  }, [state.user, fetchProfile]);

  const generatePasswordResetLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError };
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    return { data, error };
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated: !!state.user,
      isAdmin: state.profile?.is_admin ?? false,
      isAgent: state.profile?.is_agent ?? false,
      signUp, signIn, signOut, refreshProfile, generatePasswordResetLink,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
