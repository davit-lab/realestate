import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ConversationItem {
  id: string;
  title: string;
  last_message: string | null;
  last_sent_at: string;
  unread_count: number;
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Directly query conversations where user is buyer or agent
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${userId},agent_id.eq.${userId}`)
      .order('last_sent_at', { ascending: false })
      .limit(100);

    if (convError || !convData) {
      console.error('[useConversations] fetch error:', convError?.message);
      setConversations([]);
      setLoading(false);
      return;
    }

    if (convData.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const chatIds = convData.map((c) => c.id);

    // Get unread count for each conversation
    const { data: unreadData } = await supabase
      .from('messages')
      .select('chat_id')
      .in('chat_id', chatIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    const unreadMap = new Map<string, number>();
    (unreadData || []).forEach((row) => {
      unreadMap.set(row.chat_id, (unreadMap.get(row.chat_id) || 0) + 1);
    });

    setConversations(
      convData.map((c) => ({
        id: c.id,
        title: c.title || 'უცნობი',
        last_message: c.last_message,
        last_sent_at: c.last_sent_at,
        unread_count: unreadMap.get(c.id) || 0,
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = useCallback(
    async (title: string, buyerId?: string, agentId?: string) => {
      if (!isSupabaseConfigured || !userId) return null;
      const payload: Record<string, unknown> = { title };
      if (buyerId) payload.buyer_id = buyerId;
      if (agentId) payload.agent_id = agentId;
      const { data, error } = await supabase
        .from('conversations')
        .insert(payload)
        .select()
        .single();
      if (error) {
        console.error('[useConversations] create error:', error.message);
        return null;
      }
      await fetchConversations();
      return data?.id || null;
    },
    [userId, fetchConversations]
  );

  return { conversations, loading, refresh: fetchConversations, createConversation };
}
