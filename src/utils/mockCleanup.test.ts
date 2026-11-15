import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSeededMockShopId,
  isSeededMockItemId,
  isSeededMockUserId,
  filterOutSeededMockShops,
  filterOutSeededMockMenuItems,
} from './mockCleanup';

test('identifies legacy seeded mock shop IDs while preserving real user shops', () => {
  assert.equal(isSeededMockShopId('shop_01'), true);
  assert.equal(isSeededMockShopId('shop_04'), true);
  assert.equal(isSeededMockShopId('shop_r12_11'), true);

  assert.equal(isSeededMockShopId('shop_1794666546622_3j0y'), false);
  assert.equal(isSeededMockShopId('shop_9f8a7b6c'), false);
  assert.equal(isSeededMockShopId(null), false);
});

test('identifies legacy seeded mock item IDs while preserving real user dishes', () => {
  assert.equal(isSeededMockItemId('item_10'), true);
  assert.equal(isSeededMockItemId('item_13'), true);
  assert.equal(isSeededMockItemId('item_shop_02_2'), true);
  assert.equal(isSeededMockItemId('item_shop_r1_2_1'), true);

  assert.equal(isSeededMockItemId('item_1794668262639'), false);
  assert.equal(isSeededMockItemId('item_1794668343784'), false);
});

test('identifies legacy seeded mock user IDs while preserving real users', () => {
  assert.equal(isSeededMockUserId('usr_admin_01'), true);
  assert.equal(isSeededMockUserId('usr_cust_01'), true);
  assert.equal(isSeededMockUserId('usr_owner_04'), true);
  assert.equal(isSeededMockUserId('usr_owner_r3_7'), true);

  assert.equal(isSeededMockUserId('CNCFZ5LU16Uo0menRq7fYEHE9Sx2'), false);
  assert.equal(isSeededMockUserId('usr_1794506088115'), false);
});

test('filters out legacy mock shops and items while retaining real user records', () => {
  const mixedShops = [
    { id: 'shop_04', name: 'Siam Burmese Street Food & Sweets' },
    { id: 'shop_r1_1', name: 'Generated Region Shop' },
    { id: 'shop_1794666546622_3j0y', name: 'Little Myanmar' },
  ];
  const realShops = filterOutSeededMockShops(mixedShops);
  assert.deepEqual(realShops, [{ id: 'shop_1794666546622_3j0y', name: 'Little Myanmar' }]);

  const mixedItems = [
    { id: 'item_shop_04_1', shopId: 'shop_04', title: 'Mock Dish' },
    { id: 'item_11', shopId: 'shop_04', title: 'Mock Tofu' },
    { id: 'item_1794668262639', shopId: 'shop_1794666546622_3j0y', title: 'Real Dish 1' },
    { id: 'item_1794668343784', shopId: 'shop_1794666546622_3j0y', title: 'Real Dish 2' },
  ];
  const realItems = filterOutSeededMockMenuItems(mixedItems);
  assert.equal(realItems.length, 2);
  assert.equal(realItems[0].id, 'item_1794668262639');
  assert.equal(realItems[1].id, 'item_1794668343784');
});
