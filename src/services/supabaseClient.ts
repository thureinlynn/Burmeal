import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { buildSupabaseProfilePath, validateProfileImageFile } from '../utils/shopLocationHelpers';

export const DEFAULT_SUPABASE_URL = 'https://oiyejybkorjvxsispjkg.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SC_QZXfTRt-ifQ1DCyT2TQ_hXsQe32t';
export const SHOP_PROFILES_BUCKET = 'shop-profiles';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
).trim();

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseKey) return false;
  if (
    supabaseKey.includes('...') ||
    supabaseKey.includes('MY_SUPABASE') ||
    supabaseKey.includes('ထည့်ပါ')
  ) {
    return false;
  }
  return true;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey);
  }
  return cachedClient;
}

export async function uploadShopProfilePicture(file: File, uid: string): Promise<string> {
  const validation = validateProfileImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid profile image file.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase Publishable/Anon key is not configured yet. Add your full key to VITE_SUPABASE_ANON_KEY in your environment settings to enable profile picture uploads.'
    );
  }

  const filePath = buildSupabaseProfilePath(uid, file.name, Date.now(), file.type);

  const { error: uploadError } = await client.storage
    .from(SHOP_PROFILES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(
      uploadError.message ||
        `Failed to upload image to Supabase bucket "${SHOP_PROFILES_BUCKET}". Verify the bucket exists and allows public uploads.`
    );
  }

  const { data } = client.storage.from(SHOP_PROFILES_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Image uploaded, but Supabase did not return a public URL.');
  }

  return data.publicUrl;
}
