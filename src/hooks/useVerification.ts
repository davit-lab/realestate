import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProfileVerification, DocType } from '../types';

export function useVerification(userId: string | undefined) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const getVerification = useCallback(async (): Promise<{ data: ProfileVerification | null; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { data: null, error: 'Not configured' };
    setLoading(true);
    const { data, error } = await supabase
      .from('profile_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLoading(false);
    return { data: data as ProfileVerification | null, error: error?.message ?? null };
  }, [userId]);

  const uploadDoc = useCallback(async (
    docType: DocType,
    frontFile: File,
    backFile?: File
  ): Promise<{ data: ProfileVerification | null; error: string | null }> => {
    if (!isSupabaseConfigured || !userId) return { data: null, error: 'Not configured' };
    setUploading(true);

    try {
      const ext = frontFile.name.split('.').pop();
      const frontPath = `${userId}/front-${Date.now()}.${ext}`;
      const { error: up1 } = await supabase.storage
        .from('verification-docs')
        .upload(frontPath, frontFile, { upsert: true, contentType: frontFile.type });
      if (up1) return { data: null, error: up1.message };

      const { data: frontUrl } = supabase.storage.from('verification-docs').getPublicUrl(frontPath);
      const frontImageUrl = frontUrl.publicUrl;

      let backImageUrl = '';
      if (backFile) {
        const backExt = backFile.name.split('.').pop();
        const backPath = `${userId}/back-${Date.now()}.${backExt}`;
        const { error: up2 } = await supabase.storage
          .from('verification-docs')
          .upload(backPath, backFile, { upsert: true, contentType: backFile.type });
        if (up2) return { data: null, error: up2.message };
        const { data: backUrl } = supabase.storage.from('verification-docs').getPublicUrl(backPath);
        backImageUrl = backUrl.publicUrl;
      }

      const { data, error } = await supabase
        .from('profile_verifications')
        .upsert({
          user_id: userId,
          doc_type: docType,
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (!error && data) {
        await supabase.from('profiles').update({ verification_status: 'pending', is_verified: false }).eq('id', userId);
      }

      return { data: data as ProfileVerification | null, error: error?.message ?? null };
    } catch (e: any) {
      return { data: null, error: e.message };
    } finally {
      setUploading(false);
    }
  }, [userId]);

  return { getVerification, uploadDoc, uploading, loading };
}
