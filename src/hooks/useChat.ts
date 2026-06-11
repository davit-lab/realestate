import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string | null;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  last_message: string | null;
  last_sent_at: string;
}

interface UseChatOptions {
  chatId: string;
  currentUserId: string;
}

export function useChat({ chatId, currentUserId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const pendingIds = useRef<Set<string>>(new Set());

  // ── Load historical messages ──
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      console.error('[useChat] fetch error:', error.message);
    } else if (data) {
      setMessages(data);
    }
    setIsLoading(false);
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ── Realtime: listen for new / updated messages ──
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;

          setMessages((prev) => {
            // Deduplicate: if we already have this exact id, skip
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            // If this is a confirmation for one of our optimistic messages,
            // replace the pending version instead of appending
            const pendingIdx = prev.findIndex(
              (m) =>
                m.status === 'pending' &&
                m.sender_id === newMsg.sender_id &&
                m.content === newMsg.content &&
                m.image_url === newMsg.image_url
            );

            if (pendingIdx !== -1) {
              const next = [...prev];
              next[pendingIdx] = newMsg;
              pendingIds.current.delete(newMsg.id);
              return next;
            }

            return [...prev, newMsg];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe((status) => {
        console.log(`[useChat] realtime status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // ── Presence: typing indicators ──
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const presenceChannel = supabase.channel(`presence:${chatId}`, {
      config: { presence: { key: currentUserId } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        // Count peers other than self who are typing
        const peersTyping = Object.entries(state).filter(
          ([key]) => key !== currentUserId
        );
        setIsTyping(peersTyping.length > 0);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ typing: false });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [chatId, currentUserId]);

  const broadcastTyping = useCallback(
    async (typing: boolean) => {
      const channel = supabase.channel(`presence:${chatId}`);
      await channel.track({ typing });
    },
    [chatId]
  );

  // ── Upload image to Supabase Storage ──
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${chatId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upError } = await supabase.storage
        .from('chat-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upError) throw upError;
      const { data: pubData } = supabase.storage.from('chat-images').getPublicUrl(path);
      return pubData.publicUrl;
    },
    [chatId]
  );

  // ── Optimistic send ──
  const sendMessage = useCallback(
    async (content: string, imageUrl?: string | null) => {
      const tempId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

      const optimistic: ChatMessage = {
        id: tempId,
        chat_id: chatId,
        sender_id: currentUserId,
        content: content.trim(),
        image_url: imageUrl || null,
        is_read: false,
        status: 'pending',
        created_at: now,
      };

      pendingIds.current.add(tempId);
      setMessages((prev) => [...prev, optimistic]);

      try {
        const insertPayload: Record<string, unknown> = {
          chat_id: chatId,
          sender_id: currentUserId,
          content: content.trim(),
          status: 'sent',
        };
        if (imageUrl) insertPayload.image_url = imageUrl;

        const { data, error } = await supabase
          .from('messages')
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;

        // Swap optimistic with confirmed server row
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data : m))
        );
        pendingIds.current.delete(tempId);

        return data as ChatMessage;
      } catch (err) {
        // Mark optimistic as failed → user can retry
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, status: 'failed' as const } : m
          )
        );
        pendingIds.current.delete(tempId);
        throw err;
      }
    },
    [chatId, currentUserId]
  );

  const retryMessage = useCallback(
    async (failedMsg: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === failedMsg.id ? { ...m, status: 'pending' as const } : m
        )
      );

      try {
        const insertPayload: Record<string, unknown> = {
          chat_id: failedMsg.chat_id,
          sender_id: failedMsg.sender_id,
          content: failedMsg.content,
          status: 'sent',
        };
        if (failedMsg.image_url) insertPayload.image_url = failedMsg.image_url;

        const { data, error } = await supabase
          .from('messages')
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;

        setMessages((prev) =>
          prev.map((m) => (m.id === failedMsg.id ? data : m))
        );

        return data as ChatMessage;
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === failedMsg.id ? { ...m, status: 'failed' as const } : m
          )
        );
        throw err;
      }
    },
    []
  );

  const markRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length) return;
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m.id) ? { ...m, is_read: true } : m
        )
      );
    },
    []
  );

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    retryMessage,
    markRead,
    broadcastTyping,
    uploadImage,
  };
}
