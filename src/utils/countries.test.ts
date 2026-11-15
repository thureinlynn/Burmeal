import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNTRIES,
  REGIONS,
  getDefaultRegionNameForCountry,
  getRegionsForCountry,
  matchRegionOptionName,
} from './countries.ts';

test('getRegionsForCountry returns only regions belonging to the requested country', () => {
  const thRegions = getRegionsForCountry('Thailand');
  assert.ok(thRegions.length >= 4);
  assert.ok(thRegions.every((r) => r.countryName === 'Thailand'));
  assert.ok(thRegions.some((r) => r.id === 'TH-BKK'));

  const jpByCode = getRegionsForCountry('JP');
  assert.ok(jpByCode.every((r) => r.countryName === 'Japan'));

  for (const country of COUNTRIES) {
    const list = getRegionsForCountry(country.name);
    assert.ok(list.length > 0, `Expected at least one region for ${country.name}`);
  }
});

test('getDefaultRegionNameForCountry prefers specific hub regions over All catch-all', () => {
  assert.equal(getDefaultRegionNameForCountry('Myanmar'), 'Yangon Region');
  assert.equal(
    getDefaultRegionNameForCountry('Thailand'),
    'Bangkok Metropolitan (Pratunam & Silom)'
  );
  assert.equal(
    getDefaultRegionNameForCountry('Singapore'),
    'Central Singapore (Peninsula Plaza)'
  );
});

test('matchRegionOptionName normalizes partial or legacy region strings to canonical option names', () => {
  assert.equal(
    matchRegionOptionName('Thailand', 'Bangkok Metropolitan'),
    'Bangkok Metropolitan (Pratunam & Silom)'
  );
  assert.equal(matchRegionOptionName('Myanmar', 'Yangon'), 'Yangon Region');
  assert.equal(matchRegionOptionName('Myanmar', 'Shan State'), 'Shan State (Taunggyi & Inle)');
  assert.equal(matchRegionOptionName('Japan', 'Fukuoka Custom District'), 'Fukuoka Custom District');
  assert.equal(matchRegionOptionName('Thailand', ''), '');
  assert.ok(REGIONS.length > 0);
});
