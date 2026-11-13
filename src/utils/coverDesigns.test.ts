import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PLACEHOLDER_COVER,
  GENERATED_FOOD_COVER_DESIGNS,
  buildShopCoverSeed,
  isDefaultCoverImage,
  pickRandomFoodCoverDesign,
  pickSeededFoodCoverDesign,
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

test('pickSeededFoodCoverDesign is consistent and distributes top shops without adjacent collisions', () => {
  const sampleShops: Array<[string, string]> = [
    ['shop_02', 'Golden Rangoon Coconut Kitchen'],
    ['shop_r1_2', 'Bogyoke Market Tea & Noodle House'],
    ['shop_r1_3', 'Shwedagon Vista Curry House'],
    ['shop_r1_4', 'Inya Lake Burmese Kitchen'],
    ['shop_r1_5', 'Downtown 19th Street Grill & Thoke'],
    ['shop_r1_6', 'Sanchaung Heritage Breakfast Corner'],
    ['shop_r1_7', 'Pansodan Art & Teahouse'],
    ['shop_r1_8', 'Chinatown Heritage Dim Sum & Mohinga'],
    ['shop_r1_9', 'Hledan Junction Street Eats'],
    ['shop_r1_10', 'Kandawgyi Palace Spice Kitchen'],
    ['shop_r1_11', 'Yankin Noodle Lounge'],
    ['shop_01', 'Mandalay Morning Teahouse'],
  ];

  const seeds = sampleShops.map(([id, name]) => buildShopCoverSeed(id, name));
  const picks = seeds.map((s) => pickSeededFoodCoverDesign(s));

  assert.equal(picks[0], pickSeededFoodCoverDesign(seeds[0]));
  for (let i = 1; i < picks.length; i++) {
    assert.notEqual(picks[i], picks[i - 1], `Adjacent shops at ${i - 1} and ${i} collided`);
  }

  const unique = new Set(picks);
  assert.equal(unique.size, GENERATED_FOOD_COVER_DESIGNS.length);
});

test('resolveCoverDesign replaces default cover consistently for a shopSeed and preserves custom covers', () => {
  const custom = 'https://example.com/my-kitchen.jpg';
  assert.equal(resolveCoverDesign(custom, 'shop_02', () => 0.4), custom);

  const seed = buildShopCoverSeed('shop_02', 'Golden Rangoon Coconut Kitchen');
  const fromSeed = resolveCoverDesign(DEFAULT_PLACEHOLDER_COVER, seed);
  assert.equal(GENERATED_FOOD_COVER_DESIGNS.includes(fromSeed), true);
  assert.notEqual(fromSeed, DEFAULT_PLACEHOLDER_COVER);
  assert.equal(resolveCoverDesign(DEFAULT_PLACEHOLDER_COVER, seed), fromSeed);

  const generatedRandom = resolveCoverDesign(DEFAULT_PLACEHOLDER_COVER, undefined, () => 0.6);
  assert.equal(GENERATED_FOOD_COVER_DESIGNS.includes(generatedRandom), true);
});
