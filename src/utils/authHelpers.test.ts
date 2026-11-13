import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEffectiveUserRole, buildNewShopForOwner, stripUndefined } from './authHelpers';
import { Shop, User } from '../types';

const baseUser: User = {
  id: 'usr_123',
  email: 'chef@example.com',
  name: 'Daw Mya',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const baseShop: Shop = {
  id: 'shop_999',
  ownerId: 'usr_123',
  name: 'Mya Kitchen',
  bio: 'Home cooking',
  coverImage: '/img.jpg',
  avatarImage: '/avatar.jpg',
  status: 'APPROVED',
  cuisineType: 'Burmese',
  locationArea: 'Yangon',
  createdAt: '2026-01-01T00:00:00.000Z',
};

test('resolveEffectiveUserRole promotes user to SHOP_OWNER when ownedShop exists', () => {
  const result = resolveEffectiveUserRole(baseUser, baseShop, 'SHOP_OWNER');
  assert.equal(result.role, 'SHOP_OWNER');
  assert.equal(result.shopId, 'shop_999');
  assert.equal(result.error, undefined);
});

test('resolveEffectiveUserRole returns error when Customer tries to log in on Shop tab without a shop', () => {
  const result = resolveEffectiveUserRole(baseUser, null, 'SHOP_OWNER');
  assert.equal(result.role, 'CUSTOMER');
  assert.equal(result.shopId, null);
  assert.ok(result.error?.includes('Customer account'));
});

test('resolveEffectiveUserRole allows normal Customer login', () => {
  const result = resolveEffectiveUserRole(baseUser, null, 'CUSTOMER');
  assert.equal(result.role, 'CUSTOMER');
  assert.equal(result.shopId, null);
  assert.equal(result.error, undefined);
});

test('buildNewShopForOwner creates APPROVED shop with owner metadata', () => {
  const shop = buildNewShopForOwner(
    'uid_abc',
    'owner@kitchen.com',
    {
      name: 'Ko Aye',
      shopName: 'Aye Golden Kitchen',
      city: 'Bangkok',
      region: 'Bangkok Metropolitan',
      country: 'Thailand',
    },
    'shop_test_1'
  );
  assert.equal(shop.id, 'shop_test_1');
  assert.equal(shop.ownerId, 'uid_abc');
  assert.equal(shop.ownerEmail, 'owner@kitchen.com');
  assert.equal(shop.name, 'Aye Golden Kitchen');
  assert.equal(shop.status, 'APPROVED');
  assert.equal(shop.country, 'Thailand');
});

test('stripUndefined removes undefined fields without dropping falsy values', () => {
  const cleaned = stripUndefined({
    title: 'Mohinga',
    price: 0,
    isHalal: false,
    specialDate: null,
    availableDays: undefined,
  });
  assert.equal('availableDays' in cleaned, false);
  assert.equal(cleaned.price, 0);
  assert.equal(cleaned.isHalal, false);
  assert.equal(cleaned.specialDate, null);
});
