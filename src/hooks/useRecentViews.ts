import { useCallback, useEffect, useState } from 'react';
import { Listing } from '../types';

const STORAGE_KEY = 'newlife_recent_views';
const MAX_ITEMS = 12;

export interface RecentViewItem {
  id: string;
  title: string;
  image: string;
  priceLari: number;
  priceUsd: number;
  city: string;
  viewedAt: string;
}

export function useRecentViews() {
  const [recentViews, setRecentViews] = useState<RecentViewItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentViews));
    } catch { /* noop */ }
  }, [recentViews]);

  const addRecentView = useCallback((listing: Listing) => {
    setRecentViews(prev => {
      const filtered = prev.filter(item => item.id !== listing.id);
      const newItem: RecentViewItem = {
        id: listing.id,
        title: listing.title,
        image: listing.image,
        priceLari: listing.priceLari,
        priceUsd: listing.priceUsd,
        city: listing.city,
        viewedAt: new Date().toISOString(),
      };
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentViews = useCallback(() => {
    setRecentViews([]);
  }, []);

  const removeRecentView = useCallback((id: string) => {
    setRecentViews(prev => prev.filter(item => item.id !== id));
  }, []);

  return { recentViews, addRecentView, clearRecentViews, removeRecentView };
}
