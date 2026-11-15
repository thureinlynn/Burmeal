import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveEffectiveUserRole,
  hydrateFirebaseUserProfile,
  buildNewShopForOwner,
  stripUndefined,
  classifyFirebaseLoginError,
} from './authHelpers';
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

test('hydrateFirebaseUserProfile repairs blank Firestore profile fields from Google Auth identity', () => {
  const blankResetDoc: User = {
    id: 'google_uid_1',
    email: '',
    name: '',
    role: 'CUSTOMER',
    avatarUrl: '',
    createdAt: '',
  };

  const result = hydrateFirebaseUserProfile(
    {
      uid: 'google_uid_1',
      email: 'jared@example.com',
      displayName: 'Jared Hendrix',
      photoURL: 'https://lh3.googleusercontent.com/photo.jpg',
    },
    blankResetDoc,
    null,
    'CUSTOMER'
  );

  assert.equal(result.error, undefined);
  assert.equal(result.user.id, 'google_uid_1');
  assert.equal(result.user.email, 'jared@example.com');
  assert.equal(result.user.name, 'Jared Hendrix');
  assert.equal(result.user.avatarUrl, 'https://lh3.googleusercontent.com/photo.jpg');
  assert.equal(result.user.role, 'CUSTOMER');
  assert.ok(result.user.createdAt.length > 0);
  assert.equal(result.needsFirestoreSync, true);
});

test('hydrateFirebaseUserProfile falls back to providerData and promotes Google user who owns a shop', () => {
  const result = hydrateFirebaseUserProfile(
    {
      uid: 'google_uid_2',
      email: null,
      displayName: null,
      photoURL: null,
      providerData: [
        {
          providerId: 'google.com',
          email: 'owner@kitchen.com',
          displayName: 'Owner Google',
          photoURL: 'https://lh3.googleusercontent.com/owner.jpg',
        },
      ],
    },
    {
      id: 'google_uid_2',
      email: 'owner@kitchen.com',
      name: 'Owner Google',
      role: 'CUSTOMER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google_uid_2',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    baseShop,
    'SHOP_OWNER'
  );

  assert.equal(result.error, undefined);
  assert.equal(result.user.role, 'SHOP_OWNER');
  assert.equal(result.shopId, 'shop_999');
  assert.equal(result.user.avatarUrl, 'https://lh3.googleusercontent.com/owner.jpg');
  assert.equal(result.needsFirestoreSync, true);
});

test('buildNewShopForOwner creates APPROVED shop with owner metadata', () => {
  const shop = buildNewShopForOwner(
    'uid_abc',
    'Owner@Kitchen.com',
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

test('classifyFirebaseLoginError falls back silently on credential errors and blocks invalid-email/rate-limit', () => {
  assert.deepEqual(classifyFirebaseLoginError('auth/invalid-credential'), {
    shouldFallbackToBackend: true,
  });
  assert.deepEqual(classifyFirebaseLoginError('auth/user-not-found'), {
    shouldFallbackToBackend: true,
  });
  const invalidEmail = classifyFirebaseLoginError('auth/invalid-email');
  assert.equal(invalidEmail.shouldFallbackToBackend, false);
  assert.ok(invalidEmail.userError?.includes('valid email'));

  const rateLimited = classifyFirebaseLoginError('auth/too-many-requests');
  assert.equal(rateLimited.shouldFallbackToBackend, false);
  assert.ok(rateLimited.userError?.includes('Too many'));
});
