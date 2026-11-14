import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasValidCoordinates,
  parseCoordinateInput,
  getDefaultCenterForCountry,
  buildGoogleMapsDirectionsUrl,
  getShopProfileImage,
  buildSupabaseProfilePath,
  validateProfileImageFile,
} from './shopLocationHelpers';

test('hasValidCoordinates validates latitude and longitude ranges strictly', () => {
  assert.equal(hasValidCoordinates(16.8409, 96.1735), true);
  assert.equal(hasValidCoordinates(-90, 180), true);
  assert.equal(hasValidCoordinates(91, 96), false);
  assert.equal(hasValidCoordinates(16.8, -181), false);
  assert.equal(hasValidCoordinates(undefined, 96), false);
  assert.equal(hasValidCoordinates(NaN, 96), false);
});

test('parseCoordinateInput parses valid coordinates and rejects invalid inputs', () => {
  assert.equal(parseCoordinateInput(' 16.8409123 ', 'lat'), 16.840912);
  assert.equal(parseCoordinateInput('96.1735', 'lng'), 96.1735);
  assert.equal(parseCoordinateInput('95', 'lat'), undefined);
  assert.equal(parseCoordinateInput('abc', 'lng'), undefined);
  assert.equal(parseCoordinateInput('', 'lat'), undefined);
});

test('getDefaultCenterForCountry prioritizes city then country fallback', () => {
  assert.deepEqual(getDefaultCenterForCountry('Myanmar', 'Mandalay'), { lat: 21.9588, lng: 96.0891 });
  assert.deepEqual(getDefaultCenterForCountry('Thailand', 'Chiang Mai'), { lat: 18.7883, lng: 98.9853 });
  assert.deepEqual(getDefaultCenterForCountry('Singapore', ''), { lat: 1.3521, lng: 103.8198 });
  assert.deepEqual(getDefaultCenterForCountry('Unknown', ''), { lat: 16.8409, lng: 96.1735 });
});

test('buildGoogleMapsDirectionsUrl prefers exact coordinates and falls back to address', () => {
  assert.equal(
    buildGoogleMapsDirectionsUrl({
      latitude: 16.8409,
      longitude: 96.1735,
      address: '78th Street',
      city: 'Mandalay',
    }),
    'https://www.google.com/maps/dir/?api=1&destination=16.840900,96.173500'
  );

  assert.equal(
    buildGoogleMapsDirectionsUrl({
      address: '111 North Bridge Road',
      city: 'Singapore',
      country: 'Singapore',
    }),
    'https://www.google.com/maps/dir/?api=1&destination=111%20North%20Bridge%20Road%2C%20Singapore%2C%20Singapore'
  );

  assert.equal(buildGoogleMapsDirectionsUrl({}), null);
});

test('getShopProfileImage prefers Supabase profileImageUrl over avatarImage', () => {
  assert.equal(
    getShopProfileImage({
      profileImageUrl: 'https://oiyejybkorjvxsispjkg.supabase.co/storage/v1/object/public/shop-profiles/public/u1-123.png',
      avatarImage: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop',
    }),
    'https://oiyejybkorjvxsispjkg.supabase.co/storage/v1/object/public/shop-profiles/public/u1-123.png'
  );

  assert.equal(
    getShopProfileImage({
      profileImageUrl: '',
      avatarImage: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop',
    }),
    'https://api.dicebear.com/7.x/identicon/svg?seed=shop'
  );
});

test('buildSupabaseProfilePath formats public/${uid}-${timestamp}.${ext} safely', () => {
  assert.equal(
    buildSupabaseProfilePath('uid:abc/123', 'my photo.JPEG', 1700000000000, 'image/jpeg'),
    'public/uid_abc_123-1700000000000.jpg'
  );
  assert.equal(
    buildSupabaseProfilePath('usr_123', 'avatar.webp', 1700000000001),
    'public/usr_123-1700000000001.webp'
  );
});

test('validateProfileImageFile checks mime type and max size', () => {
  assert.equal(validateProfileImageFile({ size: 1024, type: 'image/png', name: 'pic.png' }).valid, true);
  assert.equal(validateProfileImageFile({ size: 1024, type: 'application/pdf', name: 'doc.pdf' }).valid, false);
  assert.equal(validateProfileImageFile({ size: 6 * 1024 * 1024, type: 'image/jpeg', name: 'big.jpg' }).valid, false);
  assert.equal(validateProfileImageFile({ size: 0, type: 'image/png', name: 'empty.png' }).valid, false);
});
