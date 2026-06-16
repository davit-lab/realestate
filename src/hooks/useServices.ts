import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Hotel } from '../components/HotelDetailModal';
import type { TourismItem } from '../components/TourismDetailModal';

function mapHotel(row: any): Hotel {
  return {
    id: row.id,
    name: row.name || '',
    stars: (row.stars || 3) as any,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    pricePerNight: Number(row.price_per_night) || 0,
    city: row.city || '',
    district: row.district || '',
    image: row.image || '',
    images: row.images || [],
    amenities: row.amenities || [],
    description: row.description || '',
    phone: row.phone || '',
    tags: row.tags || [],
    featured: row.featured || false,
  };
}

function mapTourism(row: any): TourismItem {
  return {
    id: row.id,
    category: row.category || 'attractions',
    title: row.title || '',
    subtitle: row.subtitle || '',
    image: row.image || '',
    city: row.city || '',
    price: Number(row.price) || 0,
    currency: row.currency || '₾',
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    date: row.date_info || undefined,
    time: row.time_info || undefined,
    duration: row.duration || undefined,
    tags: row.tags || [],
    featured: row.featured || false,
    badge: row.badge || undefined,
  };
}

export function useServices() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [tourismItems, setTourismItems] = useState<TourismItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);

    const [{ data: hData }, { data: tData }] = await Promise.all([
      supabase.from('hotels').select('*').eq('is_active', true).order('featured', { ascending: false }).order('rating', { ascending: false }).limit(200),
      supabase.from('tourism_items').select('*').eq('is_active', true).order('featured', { ascending: false }).order('rating', { ascending: false }).limit(200),
    ]);

    setHotels((hData || []).map(mapHotel));
    setTourismItems((tData || []).map(mapTourism));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();

    if (!isSupabaseConfigured) return;
    const hChannel = supabase
      .channel('hotels-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, () => fetchServices())
      .subscribe();
    const tChannel = supabase
      .channel('tourism-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tourism_items' }, () => fetchServices())
      .subscribe();

    return () => {
      supabase.removeChannel(hChannel);
      supabase.removeChannel(tChannel);
    };
  }, [fetchServices]);

  return { hotels, tourismItems, loading, refetch: fetchServices };
}
