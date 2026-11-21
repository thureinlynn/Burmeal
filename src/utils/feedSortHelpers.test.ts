import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedSortSeed, hashToUnitFloat, sortHomeFeedMenuItems } from './feedSortHelpers.ts';
import { buildDisplayedMenuItems } from './userDataHelpers.ts';
import { MenuItem, Shop } from '../types';

const sampleShops: Shop[] = [
  {
    id: 'shop_a',
    ownerId: 'o1',
    name: 'Kitchen Alpha',
    bio: 'Authentic food',
    coverImage: '/c1.jpg',
    avatarImage: '/a1.jpg',
    status: 'APPROVED',
    cuisineType: 'Burmese',
    locationArea: 'Yangon',
    country: 'Myanmar',
    createdAt: '2026-01-01T00:00:00.000Z',
    followerCount: 12,
  },
  {
    id: 'shop_b',
    ownerId: 'o2',
    name: 'Kitchen Beta',
    bio: 'Noodles & snacks',
    coverImage: '/c2.jpg',
    avatarImage: '/a2.jpg',
    status: 'APPROVED',
    cuisineType: 'Burmese',
    locationArea: 'Yangon',
    country: 'Myanmar',
    createdAt: '2026-01-02T00:00:00.000Z',
    followerCount: 4,
  },
  {
    id: 'shop_c',
    ownerId: 'o3',
    name: 'Kitchen Gamma',
    bio: 'Daily curries',
    coverImage: '/c3.jpg',
    avatarImage: '/a3.jpg',
    status: 'APPROVED',
    cuisineType: 'Burmese',
    locationArea: 'Yangon',
    country: 'Myanmar',
    createdAt: '2026-01-03T00:00:00.000Z',
    followerCount: 25,
  },
];

const sampleItems: MenuItem[] = [
  {
    id: 'a1',
    shopId: 'shop_a',
    shopName: 'Kitchen Alpha',
    title: 'Alpha Dish 1',
    description: 'Dish a1',
    image: '/a1.jpg',
    price: 10,
    category: 'Curries',
    menuType: 'PERMANENT',
    isVegetarian: false,
    isHalal: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'a2',
    shopId: 'shop_a',
    shopName: 'Kitchen Alpha',
    title: 'Alpha Dish 2',
    description: 'Dish a2',
    image: '/a2.jpg',
    price: 11,
    category: 'Curries',
    menuType: 'WEEKLY',
    isVegetarian: false,
    isHalal: false,
    createdAt: '2026-01-01T01:00:00.000Z',
  },
  {
    id: 'a3',
    shopId: 'shop_a',
    shopName: 'Kitchen Alpha',
    title: 'Alpha Dish 3',
    description: 'Dish a3',
    image: '/a3.jpg',
    price: 12,
    category: 'Noodles & Broth',
    menuType: 'PERMANENT',
    isVegetarian: true,
    isHalal: true,
    createdAt: '2026-01-01T02:00:00.000Z',
  },
  {
    id: 'b1',
    shopId: 'shop_b',
    shopName: 'Kitchen Beta',
    title: 'Beta Dish 1',
    description: 'Dish b1',
    image: '/b1.jpg',
    price: 9,
    category: 'Noodles & Broth',
    menuType: 'PERMANENT',
    isVegetarian: false,
    isHalal: true,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'b2',
    shopId: 'shop_b',
    shopName: 'Kitchen Beta',
    title: 'Beta Dish 2',
    description: 'Dish b2',
    image: '/b2.jpg',
    price: 13,
    category: 'Salads & Snacks',
    menuType: 'SPECIAL',
    isVegetarian: true,
    isHalal: true,
    createdAt: '2026-01-02T01:00:00.000Z',
  },
  {
    id: 'c1',
    shopId: 'shop_c',
    shopName: 'Kitchen Gamma',
    title: 'Gamma Dish 1',
    description: 'Dish c1',
    image: '/c1.jpg',
    price: 14,
    category: 'Curries',
    menuType: 'PERMANENT',
    isVegetarian: false,
    isHalal: false,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'c2',
    shopId: 'shop_c',
    shopName: 'Kitchen Gamma',
    title: 'Gamma Dish 2',
    description: 'Dish c2',
    image: '/c2.jpg',
    price: 15,
    category: 'Drinks & Desserts',
    menuType: 'WEEKLY',
    isVegetarian: true,
    isHalal: true,
    createdAt: '2026-01-03T01:00:00.000Z',
  },
];

test('hashToUnitFloat returns deterministic values within [0, 1) and createFeedSortSeed returns non-empty strings', () => {
  const h1 = hashToUnitFloat('seed-1:item:a1');
  const h2 = hashToUnitFloat('seed-1:item:a1');
  const h3 = hashToUnitFloat('seed-2:item:a1');
  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
  assert.ok(h1 >= 0 && h1 < 1);
  assert.ok(createFeedSortSeed().length > 5);
});

test('sortHomeFeedMenuItems ranks dishes from followed shops ahead of unfollowed discovery shops', () => {
  const followed = new Set(['shop_b']);
  const sorted = sortHomeFeedMenuItems(sampleItems, {
    followedIds: followed,
    shopsLookup: sampleShops,
    seed: 'session-follow-1',
    nowMs: Date.parse('2026-01-10T00:00:00.000Z'),
  });

  // Both shop_b dishes must lead before any shop_a or shop_c dish
  assert.deepEqual(sorted.slice(0, 2).map((i) => i.shopId), ['shop_b', 'shop_b']);
  const remainingShopIds = new Set(sorted.slice(2).map((i) => i.shopId));
  assert.deepEqual(remainingShopIds, new Set(['shop_a', 'shop_c']));
});

test('sortHomeFeedMenuItems produces different orders across different seeds instead of always static order', () => {
  const observedOrders = new Set<string>();
  const fixedNow = Date.parse('2026-01-10T00:00:00.000Z');
  for (let i = 0; i < 8; i++) {
    const sorted = sortHomeFeedMenuItems(sampleItems, {
      followedIds: new Set(),
      shopsLookup: sampleShops,
      seed: `visit-seed-${i}`,
      nowMs: fixedNow,
    });
    observedOrders.add(sorted.map((item) => item.id).join(','));
  }
  assert.ok(observedOrders.size >= 4, `Expected varied orders across seeds, got ${observedOrders.size}`);
});

test('sortHomeFeedMenuItems is deterministic for a fixed seed so mid-session pagination & bookmarks stay stable', () => {
  const fixedNow = Date.parse('2026-01-10T00:00:00.000Z');
  const firstRun = sortHomeFeedMenuItems(sampleItems, {
    followedIds: new Set(['shop_a', 'shop_c']),
    shopsLookup: sampleShops,
    seed: 'stable-session-xyz',
    nowMs: fixedNow,
  });
  const secondRun = sortHomeFeedMenuItems(sampleItems, {
    followedIds: new Set(['shop_a', 'shop_c']),
    shopsLookup: sampleShops,
    seed: 'stable-session-xyz',
    nowMs: fixedNow,
  });
  assert.deepEqual(
    firstRun.map((i) => i.id),
    secondRun.map((i) => i.id)
  );
});

test('sortHomeFeedMenuItems interleaves multiple followed shops wave-by-wave instead of clustering one shop first', () => {
  const sorted = sortHomeFeedMenuItems(sampleItems, {
    followedIds: new Set(['shop_a', 'shop_b', 'shop_c']),
    shopsLookup: sampleShops,
    seed: 'multi-follow-wave',
    nowMs: Date.parse('2026-01-10T00:00:00.000Z'),
  });

  // First 3 slots (Wave 0) should showcase all 3 followed kitchens (one dish each)
  const wave0Shops = new Set(sorted.slice(0, 3).map((i) => i.shopId));
  assert.deepEqual(wave0Shops, new Set(['shop_a', 'shop_b', 'shop_c']));
});

test('buildDisplayedMenuItems applies follow+seed sorting for Home Feed and skips it when viewing a single shopId', () => {
  const feedRun = buildDisplayedMenuItems(sampleItems, [], sampleShops, new Set(['b2']), {
    followedIds: new Set(['shop_b']),
    sortSeed: 'home-seed-99',
  });
  assert.deepEqual(feedRun.slice(0, 2).map((i) => i.shopId), ['shop_b', 'shop_b']);
  assert.equal(feedRun.find((i) => i.id === 'b2')?.isSaved, true);

  // Single-shop detail menu preserves source order cleanly
  const singleShopRun = buildDisplayedMenuItems(sampleItems, [], sampleShops, new Set(), {
    shopId: 'shop_a',
    followedIds: new Set(['shop_b']),
    sortSeed: 'home-seed-99',
  });
  assert.deepEqual(singleShopRun.map((i) => i.id), ['a1', 'a2', 'a3']);
});
