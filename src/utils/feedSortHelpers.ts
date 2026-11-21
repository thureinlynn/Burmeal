import { MenuItem, Shop } from '../types';

/**
 * Generates a fresh per-session / per-visit seed so the Home feed
 * never falls back to the exact same static default ordering on every load,
 * while remaining stable during active filtering, saving, and scrolling.
 */
export function createFeedSortSeed(): string {
  const timePart = Date.now().toString(36);
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(2);
    globalThis.crypto.getRandomValues(buf);
    return `${timePart}_${buf[0].toString(36)}_${buf[1].toString(36)}`;
  }
  const randPart = Math.random().toString(36).slice(2, 10);
  return `${timePart}_${randPart}`;
}

/**
 * Deterministic 32-bit FNV-1a + finalizer hash mapped uniformly into [0, 1).
 */
export function hashToUnitFloat(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // Avalanche mix
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function getMenuTypeBonus(menuType: MenuItem['menuType']): number {
  if (menuType === 'SPECIAL') return 0.12;
  if (menuType === 'WEEKLY') return 0.08;
  return 0;
}

function getRecencyBonus(createdAt: string | undefined, nowMs: number): number {
  if (!createdAt) return 0;
  const createdMs = Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) return 0;
  const ageDays = Math.max(0, (nowMs - createdMs) / (1000 * 60 * 60 * 24));
  if (ageDays <= 1) return 0.08;
  if (ageDays <= 7) return 0.04;
  return 0;
}

function getShopPopularityBonus(shop?: Shop): number {
  const followers = Math.max(0, Number(shop?.followerCount || 0));
  if (followers <= 0) return 0;
  return Math.min(0.14, Math.log1p(followers) * 0.04);
}

function rankAndInterleaveTier(
  tierItems: MenuItem[],
  shopMap: Map<string, Shop>,
  seed: string,
  tierPrefix: string,
  nowMs: number
): MenuItem[] {
  if (tierItems.length <= 1) return [...tierItems];

  const groupedByShop = new Map<string, MenuItem[]>();
  for (const item of tierItems) {
    const key = item.shopId || '__unknown__';
    const bucket = groupedByShop.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      groupedByShop.set(key, [item]);
    }
  }

  // Sort items within each shop dynamically using seeded hash + subtle freshness nudge
  const sortedQueues = new Map<string, MenuItem[]>();
  for (const [shopId, shopItems] of groupedByShop.entries()) {
    const shop = shopMap.get(shopId);
    const popularityBonus = getShopPopularityBonus(shop);
    const scored = shopItems.map((item) => {
      const jitter = hashToUnitFloat(`${seed}:${tierPrefix}:item:${item.id}`);
      const score =
        jitter +
        getMenuTypeBonus(item.menuType) +
        getRecencyBonus(item.createdAt, nowMs) +
        popularityBonus * 0.5;
      return { item, score };
    });
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.id.localeCompare(b.item.id);
    });
    sortedQueues.set(
      shopId,
      scored.map((entry) => entry.item)
    );
  }

  // Interleave items across shops wave-by-wave so multiple shops rotate at the top
  // instead of one kitchen monopolizing consecutive cards in the grid.
  const result: MenuItem[] = [];
  const shopIds = Array.from(sortedQueues.keys());
  let wave = 0;

  while (true) {
    const activeShops = shopIds.filter((sId) => {
      const q = sortedQueues.get(sId);
      return q && q.length > wave;
    });
    if (activeShops.length === 0) break;

    const scoredShops = activeShops.map((sId) => {
      const shop = shopMap.get(sId);
      const jitter = hashToUnitFloat(`${seed}:${tierPrefix}:wave:${wave}:shop:${sId}`);
      const score = jitter + getShopPopularityBonus(shop);
      return { sId, score };
    });
    scoredShops.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.sId.localeCompare(b.sId);
    });

    for (const { sId } of scoredShops) {
      const queue = sortedQueues.get(sId);
      if (queue && queue[wave]) {
        result.push(queue[wave]);
      }
    }
    wave += 1;
  }

  return result;
}

/**
 * Customer Following + Dynamic Discovery Home Feed Sort:
 * 1. Prioritizes dishes from kitchens the customer follows ahead of unfollowed kitchens.
 * 2. Interleaves multiple shops wave-by-wave so followed and discovery kitchens showcase variety.
 * 3. Uses a deterministic per-session seed so every load/visit feels fresh rather than frozen
 *    in static SQLite insertion order, while remaining stable mid-session.
 */
export function sortHomeFeedMenuItems(
  items: MenuItem[],
  options: {
    followedIds: Set<string>;
    shopsLookup?: Shop[];
    seed: string;
    nowMs?: number;
  }
): MenuItem[] {
  if (items.length <= 1) return [...items];

  const shopMap = new Map((options.shopsLookup || []).map((s) => [s.id, s]));
  const nowMs = options.nowMs ?? Date.now();
  const followedItems: MenuItem[] = [];
  const discoveryItems: MenuItem[] = [];

  for (const item of items) {
    if (options.followedIds.has(item.shopId)) {
      followedItems.push(item);
    } else {
      discoveryItems.push(item);
    }
  }

  const rankedFollowed = rankAndInterleaveTier(followedItems, shopMap, options.seed, 'followed', nowMs);
  const rankedDiscovery = rankAndInterleaveTier(discoveryItems, shopMap, options.seed, 'discovery', nowMs);

  return [...rankedFollowed, ...rankedDiscovery];
}
