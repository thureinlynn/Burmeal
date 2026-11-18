import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_SPECIAL_TTL_MS,
  applyDailySpecialPostUpdate,
  computeDailySpecialExpiry,
  isDailySpecialExpired,
  partitionDailySpecialPosts,
  filterDailySpecialPosts,
  validateDailySpecialInput,
  formatRemainingTime,
  buildSupabaseDailySpecialPath,
  hasLineClampOverflow,
  shouldShowDailySpecialMoreToggle,
  getDailySpecialToggleLabel,
  DAILY_SPECIAL_MAX_ACTIVE_PER_SHOP,
  getActiveDailySpecialsForShop,
  canCreateDailySpecialPost,
  isHardBusinessRejectionStatus,
  shouldRetryWithBackendSync,
} from './dailySpecialHelpers';
import type { DailySpecialPost, Shop } from '../types';

describe('dailySpecialHelpers', () => {
  it('computes exact 48-hour expiration timestamp', () => {
    const createdAt = '2026-11-16T00:00:00.000Z';
    const expiresAt = computeDailySpecialExpiry(createdAt);
    assert.equal(Date.parse(expiresAt) - Date.parse(createdAt), DAILY_SPECIAL_TTL_MS);
    assert.equal(expiresAt, '2026-11-18T00:00:00.000Z');
  });

  it('marks posts expired at or beyond 48 hours and keeps younger posts active', () => {
    const createdAt = '2026-11-16T00:00:00.000Z';
    const post = { createdAt, expiresAt: computeDailySpecialExpiry(createdAt) };
    const createdMs = Date.parse(createdAt);

    assert.equal(isDailySpecialExpired(post, createdMs + DAILY_SPECIAL_TTL_MS - 1000), false);
    assert.equal(isDailySpecialExpired(post, createdMs + DAILY_SPECIAL_TTL_MS), true);
    assert.equal(isDailySpecialExpired(post, createdMs + DAILY_SPECIAL_TTL_MS + 60000), true);
  });

  it('partitions active and expired posts and sorts active newest-first', () => {
    const nowMs = Date.parse('2026-11-16T12:00:00.000Z');
    const posts = [
      { id: 'old_expired', createdAt: '2026-11-14T11:59:59.000Z' },
      { id: 'older_active', createdAt: '2026-11-15T12:00:00.000Z' },
      { id: 'newest_active', createdAt: '2026-11-16T11:30:00.000Z' },
    ];

    const { active, expired } = partitionDailySpecialPosts(posts, nowMs);
    assert.deepEqual(
      active.map((p) => p.id),
      ['newest_active', 'older_active']
    );
    assert.deepEqual(
      expired.map((p) => p.id),
      ['old_expired']
    );
  });

  it('filters active posts by shop, region, and search query while hiding unapproved/expired', () => {
    const nowMs = Date.parse('2026-11-16T12:00:00.000Z');
    const shops: Shop[] = [
      {
        id: 'shop_us',
        ownerId: 'u1',
        name: 'Little Myanmar',
        bio: '',
        coverImage: '',
        avatarImage: '',
        status: 'APPROVED',
        cuisineType: 'Burmese',
        locationArea: 'Fort Wayne',
        country: 'United States',
        region: 'Indiana',
        city: 'Fort Wayne',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'shop_mm',
        ownerId: 'u2',
        name: 'Shwe Taung',
        bio: '',
        coverImage: '',
        avatarImage: '',
        status: 'APPROVED',
        cuisineType: 'Burmese',
        locationArea: 'Yangon',
        country: 'Myanmar',
        region: 'Yangon Region',
        city: 'Yangon',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
    ];

    const posts: DailySpecialPost[] = [
      {
        id: 'p1',
        shopId: 'shop_us',
        shopName: 'Little Myanmar',
        title: 'Fresh Tea Leaf Tray',
        post: 'Handmade pickled tea leaves available until sold out!',
        createdAt: '2026-11-16T10:00:00.000Z',
        expiresAt: '2026-11-18T10:00:00.000Z',
      },
      {
        id: 'p2',
        shopId: 'shop_mm',
        shopName: 'Shwe Taung',
        title: 'Morning Mohinga',
        post: 'Hot fish broth ready now.',
        createdAt: '2026-11-16T09:00:00.000Z',
        expiresAt: '2026-11-18T09:00:00.000Z',
      },
      {
        id: 'p3_expired',
        shopId: 'shop_us',
        shopName: 'Little Myanmar',
        title: 'Old Weekend Special',
        post: 'Expired post',
        createdAt: '2026-11-14T08:00:00.000Z',
        expiresAt: '2026-11-16T08:00:00.000Z',
      },
    ];

    const usFiltered = filterDailySpecialPosts(posts, {
      country: 'United States',
      regionId: 'US-FW',
      shopsLookup: shops,
      nowMs,
    });
    assert.deepEqual(
      usFiltered.map((p) => p.id),
      ['p1']
    );

    const searchFiltered = filterDailySpecialPosts(posts, {
      query: 'mohinga',
      shopsLookup: shops,
      nowMs,
    });
    assert.deepEqual(
      searchFiltered.map((p) => p.id),
      ['p2']
    );
  });

  it('validates Daily Special title and post without silent acceptance of blanks', () => {
    assert.equal(validateDailySpecialInput({ title: '', post: 'Fresh food' }).valid, false);
    assert.equal(validateDailySpecialInput({ title: 'Title', post: '   ' }).valid, false);
    assert.equal(validateDailySpecialInput({ title: 'Shan Noodle Tray', post: 'Order before 5pm!' }).valid, true);
  });

  it('formats remaining TTL countdown and Supabase daily-special storage paths under public/', () => {
    const nowMs = Date.parse('2026-11-16T12:00:00.000Z');
    assert.equal(
      formatRemainingTime({ createdAt: '2026-11-16T10:00:00.000Z' }, nowMs),
      '46h 0m left'
    );
    const path = buildSupabaseDailySpecialPath('shop-123', 'special.png', 1700000000000, 'image/webp');
    assert.equal(path, 'public/daily-special-shop-123-1700000000000.webp');
  });

  it('updates post title, body, and image while strictly keeping original createdAt and expiresAt countdown', () => {
    const createdAt = '2026-11-16T08:00:00.000Z';
    const expiresAt = computeDailySpecialExpiry(createdAt);
    const original: DailySpecialPost = {
      id: 'dsp_edit_1',
      shopId: 'shop_1',
      shopName: 'Pyay Thu Lay',
      title: 'Morning Mohinga',
      post: 'Fresh fish broth until 2 PM.',
      image: 'https://example.com/old.jpg',
      imageStoragePath: 'public/daily-special-shop_1-1.jpg',
      createdAt,
      expiresAt,
    };

    const updated = applyDailySpecialPostUpdate(original, {
      title: '  Updated Mohinga Pot  ',
      post: '  Added crispy bean fritters!  ',
      image: '',
      imageStoragePath: '',
    });

    assert.equal(updated.title, 'Updated Mohinga Pot');
    assert.equal(updated.post, 'Added crispy bean fritters!');
    assert.equal(updated.image, '');
    assert.equal(updated.imageStoragePath, '');
    assert.equal(updated.createdAt, createdAt);
    assert.equal(updated.expiresAt, expiresAt);

    const checkNowMs = Date.parse('2026-11-17T08:00:00.000Z');
    assert.equal(formatRemainingTime(updated, checkNowMs), formatRemainingTime(original, checkNowMs));
  });

  it('detects 3-line overflow and controls more/less link visibility cleanly', () => {
    assert.equal(hasLineClampOverflow(68, 68), false);
    assert.equal(hasLineClampOverflow(69, 68), false);
    assert.equal(hasLineClampOverflow(114, 68), true);

    assert.equal(shouldShowDailySpecialMoreToggle(false, false), false);
    assert.equal(shouldShowDailySpecialMoreToggle(false, true), true);
    assert.equal(shouldShowDailySpecialMoreToggle(true, false), true);

    assert.equal(getDailySpecialToggleLabel(false), 'more');
    assert.equal(getDailySpecialToggleLabel(true), 'less');
  });

  it('enforces a strict 1 active Daily Special post limit per shop until expired or deleted', () => {
    assert.equal(DAILY_SPECIAL_MAX_ACTIVE_PER_SHOP, 1);

    const createdAt = '2026-11-16T10:00:00.000Z';
    const expiresAt = computeDailySpecialExpiry(createdAt);
    const activePost: DailySpecialPost = {
      id: 'dsp_active_1',
      shopId: 'shop_1',
      shopName: 'Pyay Thu Lay',
      title: 'Today Special',
      post: 'Fresh pot ready',
      createdAt,
      expiresAt,
    };
    const otherShopPost: DailySpecialPost = {
      ...activePost,
      id: 'dsp_other_1',
      shopId: 'shop_2',
    };

    const during48h = Date.parse('2026-11-17T10:00:00.000Z');
    const after48h = Date.parse('2026-11-18T10:00:00.000Z');

    assert.equal(canCreateDailySpecialPost([otherShopPost], 'shop_1', during48h), true);
    assert.equal(canCreateDailySpecialPost([activePost, otherShopPost], 'shop_1', during48h), false);
    assert.equal(getActiveDailySpecialsForShop([activePost, otherShopPost], 'shop_1', during48h).length, 1);

    // Allowed once deleted
    assert.equal(canCreateDailySpecialPost([otherShopPost], 'shop_1', during48h), true);

    // Allowed once 48h TTL expires
    assert.equal(canCreateDailySpecialPost([activePost], 'shop_1', after48h), true);
  });

  it('distinguishes business rejections (400/409) from session/shop sync desyncs (401/403/404)', () => {
    assert.equal(isHardBusinessRejectionStatus(400), true);
    assert.equal(isHardBusinessRejectionStatus(409), true);
    assert.equal(isHardBusinessRejectionStatus(401), false);
    assert.equal(isHardBusinessRejectionStatus(403), false);
    assert.equal(isHardBusinessRejectionStatus(404), false);
    assert.equal(isHardBusinessRejectionStatus(500), false);

    assert.equal(shouldRetryWithBackendSync(401), true);
    assert.equal(shouldRetryWithBackendSync(403), true);
    assert.equal(shouldRetryWithBackendSync(404), true);
    assert.equal(shouldRetryWithBackendSync(400), false);
    assert.equal(shouldRetryWithBackendSync(409), false);
  });
});
