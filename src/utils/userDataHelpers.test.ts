import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeUniqueIds,
  mergeUniqueShops,
  mergeUniqueMenuItems,
  applyFollowStateToShops,
  applySaveStateToMenuItems,
  filterFollowedShops,
  filterFollowedMenuItems,
  filterSavedMenuItems,
} from './userDataHelpers.ts';
import { MenuItem, Shop } from '../types';

const shops: Shop[] = [
  {
    id: 'shop_mm_1',
    ownerId: 'o1',
    name: 'Yangon Kitchen',
    bio: 'Curries',
    coverImage: '/c1.jpg',
    avatarImage: '/a1.jpg',
    status: 'APPROVED',
    cuisineType: 'Burmese',
    locationArea: 'Yangon',
    country: 'Myanmar',
    createdAt: '2026-01-01T00:00:00.000Z',
    isFollowed: true,
  },
  {
    id: 'shop_jp_1',
    ownerId: 'o2',
    name: 'Tokyo Yangon Diner',
    bio: 'Mohinga',
    coverImage: '/c2.jpg',
    avatarImage: '/a2.jpg',
    status: 'APPROVED',
    cuisineType: 'Burmese',
    locationArea: 'Tokyo',
    country: 'Japan',
    createdAt: '2026-01-01T00:00:00.000Z',
    isFollowed: false,
  },
];

const items: MenuItem[] = [
  {
    id: 'item_1',
    shopId: 'shop_mm_1',
    shopName: 'Yangon Kitchen',
    title: 'Catfish Mohinga',
    description: 'Traditional noodle soup',
    image: '/m1.jpg',
    price: 5000,
    category: 'Noodles & Broth',
    menuType: 'SPECIAL',
    isVegetarian: false,
    isHalal: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    isSaved: true,
  },
  {
    id: 'item_2',
    shopId: 'shop_jp_1',
    shopName: 'Tokyo Yangon Diner',
    title: 'Tea Leaf Salad',
    description: 'Fresh laphet',
    image: '/m2.jpg',
    price: 1100,
    category: 'Salads & Snacks',
    menuType: 'PERMANENT',
    isVegetarian: true,
    isHalal: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    isSaved: false,
  },
];

test('mergeUniqueIds combines and deduplicates IDs cleanly', () => {
  assert.deepEqual(mergeUniqueIds(['a', 'b'], ['b', 'c'], undefined, ['']), ['a', 'b', 'c']);
});

test('mergeUniqueShops and mergeUniqueMenuItems deduplicate across backend and Firestore caches', () => {
  const mergedShops = mergeUniqueShops(shops, [{ ...shops[1], name: 'Tokyo Updated' }]);
  assert.equal(mergedShops.length, 2);
  assert.equal(mergedShops[1].name, 'Tokyo Updated');

  const mergedItems = mergeUniqueMenuItems(items, [{ ...items[0], price: 5500 }]);
  assert.equal(mergedItems.length, 2);
  assert.equal(mergedItems[0].price, 5500);
});

test('applyFollowStateToShops and filterFollowedShops reflect authoritative follow state including unfollows', () => {
  const followedSet = new Set(['shop_jp_1']);
  const updated = applyFollowStateToShops(shops, followedSet);
  assert.equal(updated[0].isFollowed, false);
  assert.equal(updated[1].isFollowed, true);

  const followedOnly = filterFollowedShops(shops, followedSet);
  assert.equal(followedOnly.length, 1);
  assert.equal(followedOnly[0].id, 'shop_jp_1');
  assert.equal(followedOnly[0].isFollowed, true);
});

test('filterFollowedMenuItems strictly includes followed shops and respects dietary/search filters', () => {
  const followedSet = new Set(['shop_jp_1']);
  const savedSet = new Set(['item_2']);
  const feed = filterFollowedMenuItems(items, followedSet, savedSet, { isVegetarian: true });
  assert.equal(feed.length, 1);
  assert.equal(feed[0].id, 'item_2');
  assert.equal(feed[0].isSaved, true);

  const emptyFeed = filterFollowedMenuItems(items, followedSet, savedSet, { isVegetarian: true, query: 'mohinga' });
  assert.equal(emptyFeed.length, 0);
});

test('applySaveStateToMenuItems and filterSavedMenuItems preserve saved items and support unsaving cleanly', () => {
  const savedSet = new Set(['item_2']);
  const updated = applySaveStateToMenuItems(items, savedSet);
  assert.equal(updated[0].isSaved, false);
  assert.equal(updated[1].isSaved, true);

  const savedList = filterSavedMenuItems(items, savedSet, shops);
  assert.equal(savedList.length, 1);
  assert.equal(savedList[0].id, 'item_2');
  assert.equal(savedList[0].shopCountry, 'Japan');
  assert.equal(savedList[0].isSaved, true);
});
