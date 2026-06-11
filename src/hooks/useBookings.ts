import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Booking } from '../types';

export function useBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        item_id: row.item_id,
        item_type: row.item_type,
        item_name: row.item_name,
        item_image: row.item_image,
        guest_name: row.guest_name,
        email: row.email,
        phone: row.phone,
        check_in: row.check_in,
        check_out: row.check_out,
        guests: row.guests ?? 1,
        details: row.details,
        status: row.status,
        created_at: row.created_at,
      })));
    }
    setLoading(false);
  }, [userId]);

  const createBooking = useCallback(async (payload: Omit<Booking, 'id' | 'created_at' | 'status'> & { status?: Booking['status'] }): Promise<{ data: Booking | null; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { data: null, error: 'Not configured' };
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        item_id: payload.item_id,
        item_type: payload.item_type,
        item_name: payload.item_name,
        item_image: payload.item_image,
        guest_name: payload.guest_name,
        email: payload.email,
        phone: payload.phone,
        check_in: payload.check_in,
        check_out: payload.check_out,
        guests: payload.guests ?? 1,
        details: payload.details,
        status: payload.status ?? 'pending',
      })
      .select()
      .single();

    setLoading(false);
    if (!error && data) {
      const b: Booking = {
        id: data.id,
        user_id: data.user_id,
        item_id: data.item_id,
        item_type: data.item_type,
        item_name: data.item_name,
        item_image: data.item_image,
        guest_name: data.guest_name,
        email: data.email,
        phone: data.phone,
        check_in: data.check_in,
        check_out: data.check_out,
        guests: data.guests ?? 1,
        details: data.details,
        status: data.status,
        created_at: data.created_at,
      };
      setBookings(prev => [b, ...prev]);
      return { data: b, error: null };
    }
    return { data: null, error: error?.message ?? null };
  }, [userId]);

  const cancelBooking = useCallback(async (bookingId: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { error: 'Not configured' };
    setLoading(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', userId);

    setLoading(false);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
    }
    return { error: error?.message ?? null };
  }, [userId]);

  useEffect(() => {
    fetchBookings();
    if (!isSupabaseConfigured || !userId) return;
    const channel = supabase
      .channel('bookings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchBookings, userId]);

  return { bookings, loading, fetchBookings, createBooking, cancelBooking };
}
