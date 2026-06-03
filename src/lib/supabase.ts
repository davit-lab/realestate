import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    auth: { autoRefreshToken: true, persistSession: true },
    global: { headers: { 'x-client-info': 'adjarahome' } },
  }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
