import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserPackage {
  id: string;
  package_type: 'vip' | 'vip_plus' | 'super_vip';
  listings_remaining: number;
  total_listings: number;
  expires_at: string;
  created_at: string;
}

export function useUserPackages(userId: string | undefined) {
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('user_packages')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const hasActivePackage = packages.length > 0;
  const activePackage = packages[0];

  return { packages, loading, hasActivePackage, activePackage, refresh: fetchPackages };
}
