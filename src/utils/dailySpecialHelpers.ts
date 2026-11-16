import { DailySpecialPost, Shop } from '../types';
import { matchesRegionFilter } from './filter';
import { sanitizeFileExtension } from './shopLocationHelpers';

export const DAILY_SPECIAL_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export function computeDailySpecialExpiry(createdAtIso: string): string {
  const createdMs = Date.parse(createdAtIso);
  const baseMs = Number.isFinite(createdMs) ? createdMs : Date.now();
  return new Date(baseMs + DAILY_SPECIAL_TTL_MS).toISOString();
}

export function getDailySpecialExpiryMs(post: { createdAt: string; expiresAt?: string }): number {
  if (post.expiresAt) {
    const expMs = Date.parse(post.expiresAt);
    if (Number.isFinite(expMs)) {
      return expMs;
    }
  }
  const createdMs = Date.parse(post.createdAt);
  if (Number.isFinite(createdMs)) {
    return createdMs + DAILY_SPECIAL_TTL_MS;
  }
  return 0;
}

export function isDailySpecialExpired(
  post: { createdAt: string; expiresAt?: string },
  nowMs: number = Date.now()
): boolean {
  const expiryMs = getDailySpecialExpiryMs(post);
  if (!expiryMs) return true;
  return nowMs >= expiryMs;
}

export function partitionDailySpecialPosts<T extends { id: string; createdAt: string; expiresAt?: string }>(
  posts: T[],
  nowMs: number = Date.now()
): { active: T[]; expired: T[] } {
  const active: T[] = [];
  const expired: T[] = [];

  for (const post of posts) {
    if (!post?.id) continue;
    if (isDailySpecialExpired(post, nowMs)) {
      expired.push(post);
    } else {
      active.push(post);
    }
  }

  active.sort((a, b) => {
    const tA = Date.parse(a.createdAt) || 0;
    const tB = Date.parse(b.createdAt) || 0;
    return tB - tA;
  });

  return { active, expired };
}

export function mergeUniqueDailySpecialPosts(
  ...postLists: Array<DailySpecialPost[] | undefined | null>
): DailySpecialPost[] {
  const map = new Map<string, DailySpecialPost>();
  for (const list of postLists) {
    if (!list) continue;
    for (const p of list) {
      if (!p?.id) continue;
      const prev = map.get(p.id);
      map.set(p.id, prev ? { ...prev, ...p } : p);
    }
  }
  return Array.from(map.values());
}

export function filterDailySpecialPosts(
  posts: DailySpecialPost[],
  options: {
    shopId?: string | null;
    followedShopIds?: Set<string>;
    country?: string;
    regionId?: string;
    query?: string;
    shopsLookup?: Shop[];
    nowMs?: number;
  } = {}
): DailySpecialPost[] {
  const nowMs = options.nowMs ?? Date.now();
  const shopMap = new Map((options.shopsLookup || []).map((s) => [s.id, s]));
  const q = options.query?.trim().toLowerCase() || '';

  const enriched = posts.map((post) => {
    const shop = shopMap.get(post.shopId);
    return {
      ...post,
      shopName: post.shopName || shop?.name || 'Local Kitchen',
      shopCountry: post.shopCountry || shop?.country,
      shopRegion: post.shopRegion || shop?.region,
      shopCity: post.shopCity || shop?.city,
      shopAvatarImage: post.shopAvatarImage || shop?.profileImageUrl || shop?.avatarImage,
      expiresAt: post.expiresAt || computeDailySpecialExpiry(post.createdAt),
    };
  });

  const { active } = partitionDailySpecialPosts(enriched, nowMs);

  return active.filter((post) => {
    const shop = shopMap.get(post.shopId);
    if (shop && shop.status && shop.status !== 'APPROVED' && !options.shopId) {
      return false;
    }

    if (options.shopId && post.shopId !== options.shopId) {
      return false;
    }

    if (options.followedShopIds && !options.followedShopIds.has(post.shopId)) {
      return false;
    }

    if (!options.shopId && !options.followedShopIds && (options.country || options.regionId)) {
      const candidate = {
        name: post.shopName || shop?.name || '',
        country: post.shopCountry || shop?.country,
        region: post.shopRegion || shop?.region,
        city: post.shopCity || shop?.city,
        locationArea: shop?.locationArea || '',
        address: shop?.address || '',
      };
      if (!matchesRegionFilter(candidate, options.regionId, options.country)) {
        return false;
      }
    }

    if (q) {
      const hay = `${post.title} ${post.post} ${post.shopName || ''} ${post.shopCity || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

export function validateDailySpecialInput(input: {
  title?: string;
  post?: string;
}): { valid: boolean; error?: string } {
  const title = (input.title || '').trim();
  const post = (input.post || '').trim();

  if (!title) {
    return { valid: false, error: 'Please enter a title for your Daily Special post.' };
  }
  if (title.length > 160) {
    return { valid: false, error: 'Title must be 160 characters or fewer.' };
  }
  if (!post) {
    return { valid: false, error: 'Please write your Daily Special post details.' };
  }
  return { valid: true };
}

export function formatDailySpecialTimestamp(createdAtIso: string): string {
  const parsed = new Date(createdAtIso);
  if (Number.isNaN(parsed.getTime())) {
    return createdAtIso || '';
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsed);
  } catch {
    return parsed.toLocaleString();
  }
}

export function formatRemainingTime(
  post: { createdAt: string; expiresAt?: string },
  nowMs: number = Date.now()
): string {
  const expiryMs = getDailySpecialExpiryMs(post);
  const diffMs = Math.max(0, expiryMs - nowMs);
  if (diffMs === 0) return 'Expired';

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 1) {
    return `${hours}h ${minutes}m left`;
  }
  return `${Math.max(1, minutes)}m left`;
}

export function buildSupabaseDailySpecialPath(
  shopOrOwnerId: string,
  fileName: string,
  timestamp: number = Date.now(),
  mimeType?: string
): string {
  const safeId = (shopOrOwnerId || 'shop').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = sanitizeFileExtension(fileName, mimeType);
  return `public/daily-special-${safeId}-${timestamp}.${ext}`;
}
