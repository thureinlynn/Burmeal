import { MenuItem, MenuType, Shop } from '../types';
import { filterMenuItems, matchesRegionFilter } from './filter';
import { filterOutSeededMockMenuItems, filterOutSeededMockShops } from './mockCleanup';

export function mergeUniqueIds(...lists: Array<Iterable<string> | undefined | null>): string[] {
  const seen = new Set<string>();
  for (const list of lists) {
    if (!list) continue;
    for (const id of list) {
      if (id && typeof id === 'string') {
        seen.add(id);
      }
    }
  }
  return Array.from(seen);
}

export function mergeUniqueShops(...shopLists: Array<Shop[] | undefined | null>): Shop[] {
  const map = new Map<string, Shop>();
  for (const list of shopLists) {
    if (!list) continue;
    for (const shop of list) {
      if (!shop?.id) continue;
      const prev = map.get(shop.id);
      map.set(shop.id, prev ? { ...prev, ...shop } : shop);
    }
  }
  return Array.from(map.values());
}

export function mergeUniqueMenuItems(...itemLists: Array<MenuItem[] | undefined | null>): MenuItem[] {
  const map = new Map<string, MenuItem>();
  for (const list of itemLists) {
    if (!list) continue;
    for (const item of list) {
      if (!item?.id) continue;
      const prev = map.get(item.id);
      map.set(item.id, prev ? { ...prev, ...item } : item);
    }
  }
  return Array.from(map.values());
}

export function applyFollowStateToShops(shops: Shop[], followedIds: Set<string>): Shop[] {
  return shops.map((s) => ({
    ...s,
    isFollowed: followedIds.has(s.id),
  }));
}

export function applySaveStateToMenuItems(items: MenuItem[], savedIds: Set<string>): MenuItem[] {
  return items.map((item) => ({
    ...item,
    isSaved: savedIds.has(item.id),
  }));
}

export function buildDisplayedShops(
  backendShops: Shop[],
  firestoreShops: Shop[],
  followedIds: Set<string>,
  regionFilter?: { country?: string; regionId?: string },
  allItems: MenuItem[] = []
): Shop[] {
  const fsInRegion = firestoreShops.filter((s) => {
    if (s.status && s.status !== 'APPROVED') return false;
    if (!regionFilter?.country && !regionFilter?.regionId) return true;
    return matchesRegionFilter(s, regionFilter?.regionId, regionFilter?.country);
  });

  // Firestore overrides matching SQLite shop records so online edits always take precedence
  const merged = filterOutSeededMockShops(mergeUniqueShops(backendShops, fsInRegion));
  const itemCounts = new Map<string, number>();
  for (const item of allItems) {
    if (item?.shopId) {
      itemCounts.set(item.shopId, (itemCounts.get(item.shopId) || 0) + 1);
    }
  }
  const withCounts = merged.map((s) => {
    const dynamicCount = itemCounts.get(s.id);
    return dynamicCount !== undefined ? { ...s, itemCount: dynamicCount } : s;
  });
  return applyFollowStateToShops(withCounts, followedIds);
}

export function buildDisplayedMenuItems(
  backendItems: MenuItem[],
  firestoreItems: MenuItem[],
  allShops: Shop[],
  savedIds: Set<string>,
  filters: {
    shopId?: string | null;
    country?: string;
    regionId?: string;
    menuType?: MenuType | 'ALL';
    category?: string;
    isVegetarian?: boolean;
    isHalal?: boolean;
    query?: string;
  }
): MenuItem[] {
  const shopMap = new Map(allShops.map((s) => [s.id, s]));

  // Enrich Firestore items with shop metadata and filter to active region/shop/filters
  const enrichedFsItems = firestoreItems
    .map((item) => {
      const shop = shopMap.get(item.shopId);
      const shopCountry = item.shopCountry || item.country || shop?.country;
      const shopRegion = item.shopRegion || shop?.region;
      const shopCity = item.shopCity || shop?.city;
      const shopName = item.shopName || shop?.name || 'Local Kitchen';
      return {
        ...item,
        shopName,
        shopCountry,
        shopRegion,
        shopCity,
        country: shopCountry,
        contactLinks: item.contactLinks || (shop
          ? {
              whatsappPhone: shop.whatsappPhone,
              viberPhone: shop.viberPhone,
              lineId: shop.lineId,
              facebookUrl: shop.facebookUrl,
              phoneNumber: shop.phoneNumber,
            }
          : undefined),
      };
    })
    .filter((item) => {
      const shop = shopMap.get(item.shopId);
      if (shop && shop.status && shop.status !== 'APPROVED' && !filters.shopId) {
        return false;
      }
      if (!filters.shopId && (filters.country || filters.regionId)) {
        const regionCandidate = {
          name: item.shopName || shop?.name || '',
          country: item.shopCountry || item.country || shop?.country,
          region: item.shopRegion || shop?.region,
          city: item.shopCity || shop?.city,
          locationArea: shop?.locationArea || '',
          address: shop?.address || '',
        };
        if (!matchesRegionFilter(regionCandidate, filters.regionId, filters.country)) {
          return false;
        }
      }
      return true;
    });

  const filteredFsItems = filterMenuItems(enrichedFsItems, {
    shopId: filters.shopId || undefined,
    menuType: filters.menuType,
    category: filters.category,
    isVegetarian: filters.isVegetarian,
    isHalal: filters.isHalal,
    query: filters.query,
  });

  // Firestore overrides SQLite items for same ID so online edits win across all devices
  const merged = filterOutSeededMockMenuItems(mergeUniqueMenuItems(backendItems, filteredFsItems));
  return applySaveStateToMenuItems(merged, savedIds);
}

export function filterFollowedShops(allShops: Shop[], followedIds: Set<string>): Shop[] {
  const map = new Map<string, Shop>();
  for (const shop of allShops) {
    if (followedIds.has(shop.id)) {
      map.set(shop.id, { ...shop, isFollowed: true });
    }
  }
  return Array.from(map.values());
}

export function filterFollowedMenuItems(
  allItems: MenuItem[],
  followedIds: Set<string>,
  savedIds: Set<string>,
  filters?: {
    menuType?: string;
    category?: string;
    isVegetarian?: boolean;
    isHalal?: boolean;
    query?: string;
  }
): MenuItem[] {
  const q = filters?.query?.trim().toLowerCase() || '';
  return allItems
    .filter((item) => {
      if (!followedIds.has(item.shopId)) return false;
      if (filters?.menuType && filters.menuType !== 'ALL' && item.menuType !== filters.menuType) {
        return false;
      }
      if (filters?.category && filters.category !== 'ALL' && item.category !== filters.category) {
        return false;
      }
      if (filters?.isVegetarian && !item.isVegetarian) return false;
      if (filters?.isHalal && !item.isHalal) return false;
      if (q) {
        const hay = `${item.title} ${item.description || ''} ${item.shopName || ''} ${item.category || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .map((item) => ({
      ...item,
      isSaved: savedIds.has(item.id),
    }));
}

export function filterSavedMenuItems(
  allItems: MenuItem[],
  savedIds: Set<string>,
  shopsLookup: Shop[] = []
): MenuItem[] {
  const shopMap = new Map(shopsLookup.map((s) => [s.id, s]));
  const result = new Map<string, MenuItem>();

  for (const item of allItems) {
    if (savedIds.has(item.id)) {
      const shop = shopMap.get(item.shopId);
      result.set(item.id, {
        ...item,
        shopCountry: item.shopCountry || item.country || shop?.country,
        shopName: item.shopName || shop?.name,
        isSaved: true,
      });
    }
  }
  return Array.from(result.values());
}
