import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_STORAGE_KEY,
  buildConsentCookieString,
  buildCookieConsentPreferences,
  getStoredCookieConsent,
  parseCookieConsent,
  saveCookieConsent,
  shouldShowCookiePopup,
  type CookieStorageLike,
} from './cookieConsentHelpers.ts';

function createMemoryStorage(initial: Record<string, string> = {}): CookieStorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

test('buildCookieConsentPreferences handles all, essential, and custom choices', () => {
  const all = buildCookieConsentPreferences('all', '2026-11-16T00:00:00.000Z');
  assert.equal(all.status, 'accepted');
  assert.equal(all.essential, true);
  assert.equal(all.preferences, true);
  assert.equal(all.analytics, true);

  const essential = buildCookieConsentPreferences('essential', '2026-11-16T00:00:00.000Z');
  assert.equal(essential.status, 'essential_only');
  assert.equal(essential.preferences, false);
  assert.equal(essential.analytics, false);

  const customPrefsOnly = buildCookieConsentPreferences(
    { preferences: true, analytics: false },
    '2026-11-16T00:00:00.000Z'
  );
  assert.equal(customPrefsOnly.status, 'accepted');
  assert.equal(customPrefsOnly.preferences, true);
  assert.equal(customPrefsOnly.analytics, false);

  const customNone = buildCookieConsentPreferences(
    { preferences: false, analytics: false },
    '2026-11-16T00:00:00.000Z'
  );
  assert.equal(customNone.status, 'essential_only');
});

test('parseCookieConsent and getStoredCookieConsent safely ignore corrupt or missing values', () => {
  assert.equal(parseCookieConsent(null), null);
  assert.equal(parseCookieConsent('invalid-json'), null);
  assert.equal(parseCookieConsent(JSON.stringify({ status: 'unknown' })), null);

  const storage = createMemoryStorage();
  assert.equal(getStoredCookieConsent(storage), null);

  const valid = buildCookieConsentPreferences('all', '2026-11-16T00:00:00.000Z');
  storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(valid));
  const parsed = getStoredCookieConsent(storage);
  assert.equal(parsed?.status, 'accepted');
  assert.equal(parsed?.analytics, true);
});

test('saveCookieConsent persists preferences to storage and invokes cookie writer', () => {
  const storage = createMemoryStorage();
  let writtenCookie = '';
  const saved = saveCookieConsent(storage, 'all', (c) => {
    writtenCookie = c;
  });

  assert.equal(saved.status, 'accepted');
  assert.ok(writtenCookie.startsWith(`${COOKIE_CONSENT_COOKIE_NAME}=all;`));
  assert.equal(getStoredCookieConsent(storage)?.status, 'accepted');
  assert.ok(buildConsentCookieString(buildCookieConsentPreferences('essential')).includes('=essential;'));
});

test('shouldShowCookiePopup only shows when consent is unset and onboarding dialog is closed', () => {
  assert.equal(shouldShowCookiePopup({ consent: null, isOnboardingBlocking: false }), true);
  assert.equal(shouldShowCookiePopup({ consent: null, isOnboardingBlocking: true }), false);
  assert.equal(
    shouldShowCookiePopup({
      consent: buildCookieConsentPreferences('essential'),
      isOnboardingBlocking: false,
    }),
    false
  );
});
