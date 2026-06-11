import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFavorites(data.map((row) => row.property_id));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!isSupabaseConfigured || !userId) return;

    const isFav = favorites.includes(propertyId);
    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, property_id: propertyId })
        .select()
        .single();
      setFavorites((prev) => [propertyId, ...prev]);
    }
  }, [favorites, userId]);

  return { favorites, loading, toggleFavorite, refresh: fetchFavorites };
}
