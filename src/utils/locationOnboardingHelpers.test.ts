import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldForceRegionOnboarding,
  canConfirmLocationSelection,
  getInitialOnboardingStep,
  getLocationSelectionStatus,
} from './locationOnboardingHelpers';

test('shouldForceRegionOnboarding enforces selection on first visit and skips when stored or deep-linked', () => {
  assert.equal(shouldForceRegionOnboarding(null, null, ''), true);
  assert.equal(shouldForceRegionOnboarding('', '', ''), true);
  assert.equal(shouldForceRegionOnboarding('Myanmar', '', ''), true);
  assert.equal(shouldForceRegionOnboarding('', 'MM-YGN', ''), true);

  // Returning user with stored country and region
  assert.equal(shouldForceRegionOnboarding('Myanmar', 'MM-YGN', ''), false);

  // First-time user arriving via shared item or shop deep link is not blocked
  assert.equal(shouldForceRegionOnboarding(null, null, '?item=item_01'), false);
  assert.equal(shouldForceRegionOnboarding(null, null, '?shop=shop_02'), false);
});

test('canConfirmLocationSelection requires both country and region to be non-empty', () => {
  assert.equal(canConfirmLocationSelection('', ''), false);
  assert.equal(canConfirmLocationSelection('Myanmar', ''), false);
  assert.equal(canConfirmLocationSelection('', 'MM-YGN'), false);
  assert.equal(canConfirmLocationSelection('   ', 'MM-ALL'), false);
  assert.equal(canConfirmLocationSelection('Myanmar', 'MM-ALL'), true);
});

test('getInitialOnboardingStep starts at intro alert for first-time users and select for returning users', () => {
  assert.equal(getInitialOnboardingStep(false), 'intro');
  assert.equal(getInitialOnboardingStep(true), 'select');
});

test('getLocationSelectionStatus returns clear guidance across selection states', () => {
  assert.equal(
    getLocationSelectionStatus('', undefined, false),
    'Select a country first, then pick your region.'
  );
  assert.equal(
    getLocationSelectionStatus('Myanmar', undefined, false),
    'Myanmar selected — choose a region to continue.'
  );
  assert.equal(
    getLocationSelectionStatus('Myanmar', 'Yangon Region', true),
    'Myanmar · Yangon Region'
  );
});
