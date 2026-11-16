import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectInstallPlatform,
  getInstallInstructions,
  getInstallReadinessInfo,
  isStandaloneDisplayMode,
  shouldShowFirstTimeInstallPopup,
  shouldShowInstallAlert,
} from './pwaHelpers.ts';

test('isStandaloneDisplayMode detects Chromium matchMedia and iOS navigator.standalone', () => {
  assert.equal(isStandaloneDisplayMode(false, false), false);
  assert.equal(isStandaloneDisplayMode(false, undefined), false);
  assert.equal(isStandaloneDisplayMode(true, false), true);
  assert.equal(isStandaloneDisplayMode(false, true), true);
  assert.equal(isStandaloneDisplayMode(true, true), true);
});

test('detectInstallPlatform distinguishes iOS, Android, and desktop user agents', () => {
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15'),
    'ios'
  );
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'),
    'ios'
  );
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/124.0.0.0 Mobile Safari/537.36'),
    'android'
  );
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
    'desktop'
  );
});

test('shouldShowInstallAlert shows alert only when not installed and not dismissed', () => {
  assert.equal(shouldShowInstallAlert({ isInstalled: false, isDismissed: false }), true);
  assert.equal(shouldShowInstallAlert({ isInstalled: true, isDismissed: false }), false);
  assert.equal(shouldShowInstallAlert({ isInstalled: false, isDismissed: true }), false);
  assert.equal(shouldShowInstallAlert({ isInstalled: true, isDismissed: true }), false);
});

test('shouldShowFirstTimeInstallPopup gates properly on install state, acknowledgement, and blocking modals', () => {
  assert.equal(
    shouldShowFirstTimeInstallPopup({
      isInstalled: false,
      isDismissed: false,
      hasSeenFirstTimePrompt: false,
      isBlockedByOtherModal: false,
    }),
    true
  );
  assert.equal(
    shouldShowFirstTimeInstallPopup({
      isInstalled: true,
      isDismissed: false,
      hasSeenFirstTimePrompt: false,
      isBlockedByOtherModal: false,
    }),
    false
  );
  assert.equal(
    shouldShowFirstTimeInstallPopup({
      isInstalled: false,
      isDismissed: false,
      hasSeenFirstTimePrompt: true,
      isBlockedByOtherModal: false,
    }),
    false
  );
  assert.equal(
    shouldShowFirstTimeInstallPopup({
      isInstalled: false,
      isDismissed: false,
      hasSeenFirstTimePrompt: false,
      isBlockedByOtherModal: true,
    }),
    false
  );
});

test('getInstallReadinessInfo prioritizes native ready status and tailored platform prompts', () => {
  const nativeReady = getInstallReadinessInfo({ isInstallable: true, platform: 'android' });
  assert.equal(nativeReady.isNativeReady, true);
  assert.equal(nativeReady.badgeText, 'Ready to Install');
  assert.equal(nativeReady.ctaLabel, 'Install App Now');

  const iosInfo = getInstallReadinessInfo({ isInstallable: false, platform: 'ios' });
  assert.equal(iosInfo.isNativeReady, false);
  assert.ok(iosInfo.ctaLabel.includes('iPhone'));
});

test('getInstallInstructions returns clear platform-specific steps', () => {
  const ios = getInstallInstructions('ios');
  assert.ok(ios.steps.some((s) => s.includes('Add to Home Screen')));

  const android = getInstallInstructions('android');
  assert.ok(android.steps.some((s) => s.includes('Install app')));

  const desktop = getInstallInstructions('desktop');
  assert.ok(desktop.steps.length === 3);
});
