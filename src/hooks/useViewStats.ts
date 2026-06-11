import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ViewStats, ProfileViewEntry, ProfileActivity } from '../types';

export function useViewStats(userId: string | undefined) {
  const [stats, setStats] = useState<ViewStats>({
    totalProfileViews: 0,
    totalListingViews: 0,
    todayProfileViews: 0,
    todayListingViews: 0,
    recentViewers: [],
    activityData: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;
    setLoading(true);

    try {
      // Total profile views from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_profile_views')
        .eq('id', userId)
        .single();

      // Recent profile viewers (joined with profiles for name/avatar)
      const { data: viewers } = await supabase
        .from('profile_views')
        .select(`
          id,
          viewed_profile_id,
          viewer_id,
          viewer_ip_hash,
          viewed_at,
          viewer:profiles!profile_views_viewer_id_fkey(name, avatar_url)
        `)
        .eq('viewed_profile_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(20);

      // Today's profile views count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayProfileViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_profile_id', userId)
        .gte('viewed_at', `${today}T00:00:00`);

      // Total listing views for user's listings
      const { data: myListings } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', userId);

      let totalListingViews = 0;
      let todayListingViews = 0;

      if (myListings && myListings.length > 0) {
        const listingIds = myListings.map(l => l.id);
        const { count: lvCount } = await supabase
          .from('listing_views')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', listingIds);
        totalListingViews = lvCount || 0;

        const { count: lvToday } = await supabase
          .from('listing_views')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', listingIds)
          .gte('viewed_at', `${today}T00:00:00`);
        todayListingViews = lvToday || 0;
      }

      // Activity data (last 30 days)
      const { data: activity } = await supabase
        .from('profile_activity')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      const formattedViewers: ProfileViewEntry[] = (viewers || []).map((v: any) => ({
        id: v.id,
        viewed_profile_id: v.viewed_profile_id,
        viewer_id: v.viewer_id,
        viewer_ip_hash: v.viewer_ip_hash,
        viewed_at: v.viewed_at,
        viewer_name: v.viewer?.name || 'უცნობი',
        viewer_avatar: v.viewer?.avatar_url || '',
      }));

      setStats({
        totalProfileViews: profileData?.total_profile_views || 0,
        totalListingViews,
        todayProfileViews: todayProfileViews || 0,
        todayListingViews,
        recentViewers: formattedViewers,
        activityData: (activity || []) as ProfileActivity[],
      });
    } catch (e) {
      console.error('useViewStats error:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Track a profile view (fire-and-forget)
  const trackProfileView = useCallback(async (targetProfileId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.rpc('upsert_profile_view', {
        p_viewed_profile_id: targetProfileId,
      });
    } catch (e) {
      console.error('trackProfileView error:', e);
    }
  }, []);

  // Track a listing view
  const trackListingView = useCallback(async (listingId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.rpc('upsert_listing_view', {
        p_listing_id: listingId,
      });
    } catch (e) {
      console.error('trackListingView error:', e);
    }
  }, []);

  return { stats, loading, refetch: fetchStats, trackProfileView, trackListingView };
}
