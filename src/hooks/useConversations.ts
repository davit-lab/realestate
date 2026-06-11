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

    // Get all chat_ids where this user has sent or received messages
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('chat_id')
      .or(`sender_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (msgError || !msgData) {
      setLoading(false);
      return;
    }

    const chatIds = [...new Set(msgData.map((m) => m.chat_id))];
    if (chatIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get conversation details + unread counts
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', chatIds)
      .order('last_sent_at', { ascending: false });

    if (convError || !convData) {
      setLoading(false);
      return;
    }

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
    async (title: string) => {
      if (!isSupabaseConfigured || !userId) return null;
      const { data, error } = await supabase
        .from('conversations')
        .insert({ title })
        .select()
        .single();
      if (error) return null;
      await fetchConversations();
      return data?.id || null;
    },
    [userId, fetchConversations]
  );

  return { conversations, loading, refresh: fetchConversations, createConversation };
}
