import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_SPECIAL_TTL_MS,
  computeDailySpecialExpiry,
  isDailySpecialExpired,
  partitionDailySpecialPosts,
  filterDailySpecialPosts,
  validateDailySpecialInput,
  formatRemainingTime,
  buildSupabaseDailySpecialPath,
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
});
