import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  phone: string;
  balance: number;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const timeout = new Promise<null>((res) => setTimeout(() => res(null), 4000));
      const query = Promise.resolve(
        supabase.from('profiles').select('*').eq('id', userId).single()
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

    // Get session immediately — don't block on profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({ ...s, user: session?.user ?? null, session, loading: false }));
      // Fetch profile in background
      if (session?.user) {
        fetchProfile(session.user.id).then(profile =>
          setState(s => ({ ...s, profile }))
        );
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(s => ({ ...s, user: session?.user ?? null, session, loading: false }));
      if (session?.user) {
        fetchProfile(session.user.id).then(profile =>
          setState(s => ({ ...s, profile }))
        );
      } else {
        setState(s => ({ ...s, profile: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) return { error };

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        phone,
        avatar_url: '',
        balance: 0,
        is_admin: false,
      });
    }

    // Auto sign-in right after signup (skips waiting for email confirmation)
    if (data.session) {
      const profile = data.user ? await fetchProfile(data.user.id) : null;
      setState({ user: data.user ?? null, session: data.session, profile, loading: false });
    } else {
      // Email confirmation required — sign in explicitly
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return { error: signInError };
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured', name: 'AuthError', status: 500 } as AuthError };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState(s => ({ ...s, profile }));
  }, [state.user, fetchProfile]);

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAdmin: state.profile?.is_admin ?? false,
    isAuthenticated: !!state.user,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
}
