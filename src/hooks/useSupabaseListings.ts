import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Listing, ListingType } from '../types';

function mapRow(row: any): Listing {
  return {
    id: row.id,
    title: row.title || 'განცხადება',
    type: (row.deal_type as ListingType) || 'sale',
    priceLari: Number(row.price) || 0,
    priceUsd: Math.round((Number(row.price) || 0) / 2.7),
    location: row.location || '',
    district: row.district || '',
    city: row.city || 'თბილისი',
    rooms: row.rooms ? String(row.rooms) : '—',
    beds: Number(row.rooms) || 1,
    area: Number(row.area_sqm) || 0,
    vipStatus: (row.vip_status as any) || 'standard',
    image: row.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    images: row.images?.length ? row.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    time: row.created_at ? new Date(row.created_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'ახლახან',
    author: {
      name: row.author_name || 'მომხმარებელი',
      phone: row.phone || '',
      avatar: row.author_avatar || '',
      isAgent: false,
      listingCount: 1,
    },
    condition: row.property_type || 'apartment',
    status: row.status || 'live',
    descriptions: {
      ka: row.description || '',
      en: row.description || '',
      ru: row.description || '',
    },
    priceLevel: Number(row.price) > 1500000 ? 'high' : Number(row.price) < 300000 ? 'cheap' : 'average',
    comments: [],
    coordinates: { x: 50, y: 50 },
    lat: row.lat  != null ? Number(row.lat)  : undefined,
    lng: row.lng != null ? Number(row.lng) : undefined,
  };
}

export function useSupabaseListings() {
  const [dbListings, setDbListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDbListings(data.map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchListings();

    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('properties-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchListings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchListings]);

  return { dbListings, loading, refetch: fetchListings };
}
