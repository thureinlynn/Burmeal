import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOOD_CATEGORY,
  FILTER_CATEGORIES,
  FOOD_CATEGORIES,
  getMenuItemCategoryOptions,
} from './foodCategories';

test('FOOD_CATEGORIES preserves core categories and adds specific Burmese/Asian culinary options', () => {
  assert.ok(FOOD_CATEGORIES.length >= 12);
  assert.equal(DEFAULT_FOOD_CATEGORY, 'Noodles & Broth');

  // Backward compatibility with existing fixtures/categories
  assert.ok(FOOD_CATEGORIES.includes('Noodles & Broth'));
  assert.ok(FOOD_CATEGORIES.includes('Salads & Snacks'));
  assert.ok(FOOD_CATEGORIES.includes('Breakfast Specials'));
  assert.ok(FOOD_CATEGORIES.includes('Rice & Main Dishes'));

  // Specific new culinary options
  assert.ok(FOOD_CATEGORIES.includes('Shan & Regional Noodles'));
  assert.ok(FOOD_CATEGORIES.includes('Burmese Curries & Stews'));
  assert.ok(FOOD_CATEGORIES.includes('Rice & Biryani'));
  assert.ok(FOOD_CATEGORIES.includes('Salads & Let-Thoke'));
  assert.ok(FOOD_CATEGORIES.includes('Street Food & Fritters'));
  assert.ok(FOOD_CATEGORIES.includes('Grilled, BBQ & Roasted'));
  assert.ok(FOOD_CATEGORIES.includes('Desserts & Traditional Sweets'));
  assert.ok(FOOD_CATEGORIES.includes('Tea, Coffee & Beverages'));

  assert.equal(FILTER_CATEGORIES[0], 'ALL');
  assert.equal(FILTER_CATEGORIES.length, FOOD_CATEGORIES.length + 1);
});

test('getMenuItemCategoryOptions preserves any legacy custom category during editing', () => {
  assert.deepEqual(getMenuItemCategoryOptions('Noodles & Broth'), [...FOOD_CATEGORIES]);
  const withLegacy = getMenuItemCategoryOptions('Desserts & Drinks');
  assert.equal(withLegacy[0], 'Desserts & Drinks');
  assert.equal(withLegacy.length, FOOD_CATEGORIES.length + 1);
});
