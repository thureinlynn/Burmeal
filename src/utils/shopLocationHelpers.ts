export interface Coordinates {
  lat: number;
  lng: number;
}

export function isValidLatitude(lat: unknown): lat is number {
  return typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lng: unknown): lng is number {
  return typeof lng === 'number' && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

export function hasValidCoordinates(lat?: unknown, lng?: unknown): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

export function parseCoordinateInput(raw: string, type: 'lat' | 'lng'): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return undefined;
  if (type === 'lat' && !isValidLatitude(num)) return undefined;
  if (type === 'lng' && !isValidLongitude(num)) return undefined;
  return Number(num.toFixed(6));
}

const CITY_CENTERS: Array<{ match: string; center: Coordinates }> = [
  { match: 'mandalay', center: { lat: 21.9588, lng: 96.0891 } },
  { match: 'yangon', center: { lat: 16.8409, lng: 96.1735 } },
  { match: 'taunggyi', center: { lat: 20.7888, lng: 97.0337 } },
  { match: 'bangkok', center: { lat: 13.7563, lng: 100.5018 } },
  { match: 'chiang mai', center: { lat: 18.7883, lng: 98.9853 } },
  { match: 'mae sot', center: { lat: 16.7167, lng: 98.5667 } },
  { match: 'singapore', center: { lat: 1.3521, lng: 103.8198 } },
  { match: 'kuala lumpur', center: { lat: 3.139, lng: 101.6869 } },
  { match: 'tokyo', center: { lat: 35.6762, lng: 139.6503 } },
  { match: 'osaka', center: { lat: 34.6937, lng: 135.5023 } },
  { match: 'seoul', center: { lat: 37.5665, lng: 126.978 } },
  { match: 'london', center: { lat: 51.5072, lng: -0.1276 } },
  { match: 'san francisco', center: { lat: 37.7749, lng: -122.4194 } },
  { match: 'los angeles', center: { lat: 34.0522, lng: -118.2437 } },
  { match: 'new york', center: { lat: 40.7128, lng: -74.006 } },
  { match: 'sydney', center: { lat: -33.8688, lng: 151.2093 } },
  { match: 'melbourne', center: { lat: -37.8136, lng: 144.9631 } },
  { match: 'berlin', center: { lat: 52.52, lng: 13.405 } },
];

const COUNTRY_CENTERS: Record<string, Coordinates> = {
  myanmar: { lat: 16.8409, lng: 96.1735 },
  thailand: { lat: 13.7563, lng: 100.5018 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  malaysia: { lat: 3.139, lng: 101.6869 },
  japan: { lat: 35.6762, lng: 139.6503 },
  'united states': { lat: 37.7749, lng: -122.4194 },
  'european union': { lat: 52.52, lng: 13.405 },
  'united kingdom': { lat: 51.5072, lng: -0.1276 },
  'south korea': { lat: 37.5665, lng: 126.978 },
  australia: { lat: -33.8688, lng: 151.2093 },
};

export function getDefaultCenterForCountry(country?: string, city?: string): Coordinates {
  const cleanCity = (city || '').trim().toLowerCase();
  if (cleanCity) {
    const cityMatch = CITY_CENTERS.find((entry) => cleanCity.includes(entry.match));
    if (cityMatch) return cityMatch.center;
  }

  const cleanCountry = (country || '').trim().toLowerCase();
  if (cleanCountry && COUNTRY_CENTERS[cleanCountry]) {
    return COUNTRY_CENTERS[cleanCountry];
  }

  return COUNTRY_CENTERS.myanmar;
}

export function buildGoogleMapsDirectionsUrl(shop: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  locationArea?: string;
  city?: string;
  region?: string;
  country?: string;
  name?: string;
}): string | null {
  if (hasValidCoordinates(shop.latitude, shop.longitude)) {
    const lat = Number(shop.latitude).toFixed(6);
    const lng = Number(shop.longitude).toFixed(6);
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  const parts = [shop.address, shop.locationArea, shop.city, shop.region, shop.country]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);

  if (parts.length > 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts.join(', '))}`;
  }

  if (shop.name && shop.name.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.name.trim())}`;
  }

  return null;
}

export function getShopProfileImage(shop: {
  profileImageUrl?: string | null;
  avatarImage?: string | null;
}): string {
  const uploaded = typeof shop.profileImageUrl === 'string' ? shop.profileImageUrl.trim() : '';
  if (uploaded) return uploaded;
  const avatar = typeof shop.avatarImage === 'string' ? shop.avatarImage.trim() : '';
  return avatar;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);

export function sanitizeFileExtension(fileName: string, mimeType?: string): string {
  if (mimeType && MIME_TO_EXT[mimeType.toLowerCase()]) {
    return MIME_TO_EXT[mimeType.toLowerCase()];
  }
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (ALLOWED_EXTS.has(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  }
  return 'png';
}

export function buildSupabaseProfilePath(
  uid: string,
  fileName: string,
  timestamp = Date.now(),
  mimeType?: string
): string {
  const safeUid = (uid || 'shop').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = sanitizeFileExtension(fileName, mimeType);
  return `public/${safeUid}-${timestamp}.${ext}`;
}

export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateProfileImageFile(file: {
  size: number;
  type?: string;
  name?: string;
}): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please choose an image file to upload.' };
  }
  if (file.type && !file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files (JPG, PNG, WEBP, GIF) are supported.' };
  }
  if (!file.type && file.name) {
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    if (!ALLOWED_EXTS.has(ext)) {
      return { valid: false, error: 'Only image files (JPG, PNG, WEBP, GIF) are supported.' };
    }
  }
  if (file.size <= 0) {
    return { valid: false, error: 'The selected image file is empty.' };
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    return { valid: false, error: 'Profile image must be 5 MB or smaller.' };
  }
  return { valid: true };
}
