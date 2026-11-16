import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  buildSupabaseProfilePath,
  extractSupabaseStoragePath,
  validateProfileImageFile,
} from '../utils/shopLocationHelpers';

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

import { buildSupabaseDailySpecialPath } from '../utils/dailySpecialHelpers';

export async function removeShopProfilePicture(url?: string | null): Promise<void> {
  const path = extractSupabaseStoragePath(url, SHOP_PROFILES_BUCKET);
  if (!path) return;

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.storage.from(SHOP_PROFILES_BUCKET).remove([path]);
  } catch (err) {
    // Non-fatal: bucket RLS may forbid public client delete, still allow clearing profile URL in DB
    console.warn('Supabase storage remove notice:', err);
  }
}

export async function uploadDailySpecialImage(
  file: File,
  shopOrOwnerId: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const validation = validateProfileImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid Daily Special image file.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase storage is not configured yet. Please check your Supabase configuration to upload Daily Special photos.'
    );
  }

  const storagePath = buildSupabaseDailySpecialPath(
    shopOrOwnerId,
    file.name,
    Date.now(),
    file.type
  );

  const { error: uploadError } = await client.storage
    .from(SHOP_PROFILES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(
      uploadError.message ||
        `Failed to upload photo to Supabase bucket "${SHOP_PROFILES_BUCKET}".`
    );
  }

  const { data } = client.storage.from(SHOP_PROFILES_BUCKET).getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error('Photo uploaded, but Supabase did not return a public URL.');
  }

  return { publicUrl: data.publicUrl, storagePath };
}

export async function removeDailySpecialImage(
  urlOrPath?: string | null
): Promise<void> {
  if (!urlOrPath || !urlOrPath.trim()) return;
  const trimmed = urlOrPath.trim();
  const resolvedPath =
    extractSupabaseStoragePath(trimmed, SHOP_PROFILES_BUCKET) ||
    (trimmed.startsWith('public/daily-special-') ? trimmed : null);

  if (!resolvedPath) return;

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.storage.from(SHOP_PROFILES_BUCKET).remove([resolvedPath]);
  } catch (err) {
    console.warn('Supabase Daily Special image remove notice:', err);
  }
}

export async function deleteSupabaseStorageObjects(urlsOrPaths: Array<string | null | undefined>): Promise<void> {
  const paths = Array.from(
    new Set(
      urlsOrPaths
        .map((val) => {
          if (!val || !val.trim()) return null;
          const trimmed = val.trim();
          return (
            extractSupabaseStoragePath(trimmed, SHOP_PROFILES_BUCKET) ||
            (trimmed.startsWith('public/daily-special-') ? trimmed : null)
          );
        })
        .filter((p): p is string => Boolean(p))
    )
  );

  if (paths.length === 0) return;

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.storage.from(SHOP_PROFILES_BUCKET).remove(paths);
  } catch (err) {
    console.warn('Supabase batch remove notice:', err);
  }
}

