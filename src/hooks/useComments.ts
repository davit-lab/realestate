import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Comment } from '../types';

function mapRow(row: any): Comment {
  return {
    id: row.id,
    property_id: row.property_id,
    user_id: row.user_id,
    author: row.author_name || 'მომხმარებელი',
    avatar: row.author_avatar,
    text: row.text,
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'ახლახან',
  };
}

export function useComments(propertyId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!isSupabaseConfigured || !propertyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data.map(mapRow));
    }
    setLoading(false);
  }, [propertyId]);

  const addComment = useCallback(async (text: string, authorName: string, authorAvatar?: string) => {
    if (!isSupabaseConfigured || !propertyId || !text.trim()) return null;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        property_id: propertyId,
        text: text.trim(),
        author_name: authorName,
        author_avatar: authorAvatar,
      })
      .select()
      .single();

    if (error || !data) return null;
    return mapRow(data);
  }, [propertyId]);

  useEffect(() => {
    fetchComments();

    if (!isSupabaseConfigured || !propertyId) return;
    const channel = supabase
      .channel(`comments-${propertyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `property_id=eq.${propertyId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchComments, propertyId]);

  return { comments, loading, refetch: fetchComments, addComment };
}
