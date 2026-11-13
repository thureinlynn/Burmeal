import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PLACEHOLDER_COVER,
  GENERATED_FOOD_COVER_DESIGNS,
  isDefaultCoverImage,
  pickRandomFoodCoverDesign,
  resolveCoverDesign,
} from './coverDesigns.ts';

test('isDefaultCoverImage detects empty, whitespace, and legacy placeholder covers', () => {
  assert.equal(isDefaultCoverImage(undefined), true);
  assert.equal(isDefaultCoverImage(''), true);
  assert.equal(isDefaultCoverImage('   '), true);
  assert.equal(isDefaultCoverImage(DEFAULT_PLACEHOLDER_COVER), true);
  assert.equal(isDefaultCoverImage('/custom/shop-banner.jpg'), false);
});

test('pickRandomFoodCoverDesign returns a valid food cover design and respects excludeUrl', () => {
  const first = pickRandomFoodCoverDesign(undefined, () => 0);
  assert.equal(first, GENERATED_FOOD_COVER_DESIGNS[0]);

  const excluded = pickRandomFoodCoverDesign(GENERATED_FOOD_COVER_DESIGNS[0], () => 0);
  assert.notEqual(excluded, GENERATED_FOOD_COVER_DESIGNS[0]);
  assert.equal(GENERATED_FOOD_COVER_DESIGNS.includes(excluded), true);
});

test('resolveCoverDesign replaces default cover with a generated food design and preserves custom covers', () => {
  const custom = 'https://example.com/my-kitchen.jpg';
  assert.equal(resolveCoverDesign(custom, () => 0.4), custom);

  const generated = resolveCoverDesign(DEFAULT_PLACEHOLDER_COVER, () => 0.6);
  assert.equal(GENERATED_FOOD_COVER_DESIGNS.includes(generated), true);
  assert.notEqual(generated, DEFAULT_PLACEHOLDER_COVER);
});
