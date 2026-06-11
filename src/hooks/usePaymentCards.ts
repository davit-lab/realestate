import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PaymentCardDB } from '../types';

export function usePaymentCards(userId: string | undefined) {
  const [loading, setLoading] = useState(false);

  const fetchCards = useCallback(async (): Promise<{ data: PaymentCardDB[]; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { data: [], error: 'Not configured' };
    const { data, error } = await supabase
      .from('payment_cards')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    return { data: (data || []) as PaymentCardDB[], error: error?.message ?? null };
  }, [userId]);

  const addCard = useCallback(async (card: {
    last4: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'standard_pay';
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
  }): Promise<{ data: PaymentCardDB | null; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { data: null, error: 'Not configured' };
    setLoading(true);

    const { data: existing } = await supabase
      .from('payment_cards')
      .select('id')
      .eq('user_id', userId);
    const isFirst = !existing || existing.length === 0;

    const { data, error } = await supabase
      .from('payment_cards')
      .insert({
        user_id: userId,
        last4: card.last4,
        brand: card.brand,
        expiry_month: card.expiryMonth,
        expiry_year: card.expiryYear,
        cardholder_name: card.cardholderName,
        is_default: isFirst,
      })
      .select()
      .single();

    setLoading(false);
    return { data: data as PaymentCardDB | null, error: error?.message ?? null };
  }, [userId]);

  const deleteCard = useCallback(async (cardId: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: 'Not configured' };
    setLoading(true);
    const { error } = await supabase
      .from('payment_cards')
      .delete()
      .eq('id', cardId);
    setLoading(false);
    return { error: error?.message ?? null };
  }, []);

  const setDefaultCard = useCallback(async (cardId: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { error: 'Not configured' };
    setLoading(true);
    // Unset all defaults first
    await supabase.from('payment_cards').update({ is_default: false }).eq('user_id', userId);
    // Set new default
    const { error } = await supabase.from('payment_cards').update({ is_default: true }).eq('id', cardId);
    setLoading(false);
    return { error: error?.message ?? null };
  }, [userId]);

  return { fetchCards, addCard, deleteCard, setDefaultCard, loading };
}
