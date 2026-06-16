import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const VIEWED_LISTINGS_KEY = 'newlife_viewed_listings';

export function useViewTracker(listingId: string) {
  useEffect(() => {
    try {
      const viewedListings = JSON.parse(localStorage.getItem(VIEWED_LISTINGS_KEY) || '[]');
      if (!viewedListings.includes(listingId)) {
        viewedListings.push(listingId);
        localStorage.setItem(VIEWED_LISTINGS_KEY, JSON.stringify(viewedListings));
      }
    } catch (e) {
      console.warn('[useViewTracker] localStorage quota exceeded', e);
    }

    // Track in Supabase (fire-and-forget)
    if (isSupabaseConfigured) {
      void supabase.rpc('upsert_listing_view', { p_listing_id: listingId });
    }
  }, [listingId]);
}

export function getViewCount(_listingId: string): number {
  // Views are tracked in Supabase listing_views table, not localStorage
  return 0;
}
