import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useProfile(userId: string | undefined) {
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const updateProfile = useCallback(async (fields: {
    name?: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
  }): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { error: 'Not configured' };
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId);
    setSaving(false);
    return { error: error?.message ?? null };
  }, [userId]);

  const uploadAvatar = useCallback(async (file: File): Promise<{ url: string | null; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { url: null, error: 'Not configured' };
    setUploadingAvatar(true);

    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploadingAvatar(false);
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl + `?t=${Date.now()}`;

    await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);

    setUploadingAvatar(false);
    return { url, error: null };
  }, [userId]);

  const uploadPropertyImage = useCallback(async (file: File): Promise<{ url: string | null; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { url: null, error: 'Not configured' };

    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) return { url: null, error: uploadError.message };

    const { data } = supabase.storage.from('property-images').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }, [userId]);

  return { updateProfile, uploadAvatar, uploadPropertyImage, saving, uploadingAvatar };
}
