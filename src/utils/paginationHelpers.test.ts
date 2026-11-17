import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PAGE_LIMITS,
  getPageSizeForMenuType,
  getInitialVisibleLimit,
  getNextVisibleLimit,
  slicePaginatedItems,
  hasRemainingItems,
  isNearBottomForLoadMore,
} from './paginationHelpers';

describe('paginationHelpers', () => {
  it('defines exact page limits across feeds', () => {
    assert.equal(PAGE_LIMITS.DAILY_SPECIAL, 10);
    assert.equal(PAGE_LIMITS.WEEKLY_AND_MASTER, 14);
    assert.equal(PAGE_LIMITS.SHOPS, 10);
    assert.equal(PAGE_LIMITS.SAVED_ITEMS, 10);
    assert.equal(PAGE_LIMITS.FOLLOWED_SHOPS, 10);
  });

  it('returns 10 for Daily Specials and 14 for All Menu, Weekly Highlights, and Regular Menu', () => {
    assert.equal(getPageSizeForMenuType('SPECIAL'), 10);
    assert.equal(getPageSizeForMenuType('ALL'), 14);
    assert.equal(getPageSizeForMenuType('WEEKLY'), 14);
    assert.equal(getPageSizeForMenuType('PERMANENT'), 14);
  });

  it('caps initial and incremental visible limits cleanly without exceeding total items', () => {
    assert.equal(getInitialVisibleLimit(10, 25), 10);
    assert.equal(getInitialVisibleLimit(14, 9), 9);

    assert.equal(getNextVisibleLimit(10, 25, 10), 20);
    assert.equal(getNextVisibleLimit(20, 25, 10), 25);
    assert.equal(getNextVisibleLimit(14, 30, 14), 28);
    assert.equal(getNextVisibleLimit(28, 30, 14), 30);
  });

  it('slices paginated lists strictly and reports remaining items accurately', () => {
    const items = Array.from({ length: 24 }, (_, idx) => ({ id: `i_${idx + 1}` }));
    const firstPage = slicePaginatedItems(items, PAGE_LIMITS.DAILY_SPECIAL);
    assert.equal(firstPage.length, 10);
    assert.equal(firstPage[0].id, 'i_1');
    assert.equal(firstPage[9].id, 'i_10');
    assert.equal(hasRemainingItems(10, items.length), true);

    const secondLimit = getNextVisibleLimit(10, items.length, PAGE_LIMITS.DAILY_SPECIAL);
    const secondPage = slicePaginatedItems(items, secondLimit);
    assert.equal(secondPage.length, 20);
    assert.equal(hasRemainingItems(20, items.length), true);

    const thirdLimit = getNextVisibleLimit(20, items.length, PAGE_LIMITS.DAILY_SPECIAL);
    assert.equal(thirdLimit, 24);
    assert.equal(hasRemainingItems(thirdLimit, items.length), false);
  });

  it('detects when window scroll approaches bottom threshold for reloading more items', () => {
    assert.equal(isNearBottomForLoadMore(0, 800, 2000, 280), false);
    assert.equal(isNearBottomForLoadMore(950, 800, 2000, 280), true);
    assert.equal(isNearBottomForLoadMore(1200, 800, 2000, 280), true);
  });
});
