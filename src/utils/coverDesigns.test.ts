import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNTRY_COVER_DESIGNS,
  DEFAULT_PLACEHOLDER_COVER,
  getCountryCoverDesign,
  isDefaultCoverImage,
  resolveCountryCode,
  resolveCoverDesign,
} from './coverDesigns.ts';

test('isDefaultCoverImage detects empty, legacy hero spread, and removed food covers', () => {
  assert.equal(isDefaultCoverImage(undefined), true);
  assert.equal(isDefaultCoverImage(''), true);
  assert.equal(isDefaultCoverImage('   '), true);
  assert.equal(isDefaultCoverImage(DEFAULT_PLACEHOLDER_COVER), true);
  assert.equal(isDefaultCoverImage('/src/assets/images/food_cover_kitchen_1794568119889.jpg'), true);
  assert.equal(isDefaultCoverImage('/custom/shop-banner.jpg'), false);
});

test('COUNTRY_COVER_DESIGNS maps each of the 10 supported regions/countries to a unique flat design asset', () => {
  const values = Object.values(COUNTRY_COVER_DESIGNS);
  assert.equal(values.length, 10);
  assert.equal(new Set(values).size, 10);
  for (const path of values) {
    assert.match(path, /^\/src\/assets\/images\/country_cover_[a-z]{2}_\d+\.jpg$/);
  }
});

test('resolveCountryCode and getCountryCoverDesign resolve countries, aliases, and region fallbacks', () => {
  assert.equal(resolveCountryCode('Myanmar'), 'MM');
  assert.equal(resolveCountryCode('Thailand'), 'TH');
  assert.equal(resolveCountryCode('Singapore'), 'SG');
  assert.equal(resolveCountryCode('Malaysia'), 'MY');
  assert.equal(resolveCountryCode('Japan'), 'JP');
  assert.equal(resolveCountryCode('United States'), 'US');
  assert.equal(resolveCountryCode('European Union'), 'EU');
  assert.equal(resolveCountryCode('Germany'), 'EU');
  assert.equal(resolveCountryCode('United Kingdom'), 'GB');
  assert.equal(resolveCountryCode('UK'), 'GB');
  assert.equal(resolveCountryCode('South Korea'), 'KR');
  assert.equal(resolveCountryCode('Australia'), 'AU');
  assert.equal(resolveCountryCode(undefined, 'JP-TYO'), 'JP');
  assert.equal(getCountryCoverDesign('Japan'), COUNTRY_COVER_DESIGNS.JP);
  assert.equal(getCountryCoverDesign('Unknown Country'), COUNTRY_COVER_DESIGNS.MM);
});

test('resolveCoverDesign applies country flat design for default covers and preserves custom covers', () => {
  const custom = 'https://example.com/custom-shop.jpg';
  assert.equal(resolveCoverDesign(custom, 'Thailand', 'Bangkok'), custom);

  assert.equal(
    resolveCoverDesign(DEFAULT_PLACEHOLDER_COVER, 'Thailand', 'Bangkok'),
    COUNTRY_COVER_DESIGNS.TH
  );
  assert.equal(
    resolveCoverDesign(DEFAULT_PLACEHOLDER_COVER, 'Myanmar', 'Yangon Region'),
    COUNTRY_COVER_DESIGNS.MM
  );
  assert.equal(
    resolveCoverDesign('/src/assets/images/food_cover_wok_1794568120622.jpg', 'Japan', 'Tokyo'),
    COUNTRY_COVER_DESIGNS.JP
  );
});
