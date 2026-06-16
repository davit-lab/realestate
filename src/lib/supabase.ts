import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    auth: { autoRefreshToken: true, persistSession: true },
    global: { headers: { 'x-client-info': 'newlife' } },
  }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
