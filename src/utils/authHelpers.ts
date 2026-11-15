import { Shop, User, UserRole } from '../types';

export interface RoleResolutionResult {
  role: UserRole;
  shopId: string | null;
  error?: string;
}

/**
 * Resolves the authoritative user role and shopId based on Firestore profile,
 * owned shop record, and the login mode the user selected in the AuthModal.
 */
export function resolveEffectiveUserRole(
  profile: User | null,
  ownedShop: Shop | null,
  expectedRole?: 'CUSTOMER' | 'SHOP_OWNER'
): RoleResolutionResult {
  if (ownedShop) {
    return {
      role: 'SHOP_OWNER',
      shopId: ownedShop.id,
    };
  }

  if (profile?.role === 'SHOP_OWNER') {
    return {
      role: 'SHOP_OWNER',
      shopId: null,
    };
  }

  if (expectedRole === 'SHOP_OWNER') {
    return {
      role: 'CUSTOMER',
      shopId: null,
      error:
        'This account is registered as a Customer account, not a Shop Owner. Please sign up as a Shop Owner or switch to Customer login.',
    };
  }

  return {
    role: profile?.role || 'CUSTOMER',
    shopId: null,
  };
}

export interface FirebaseIdentityInput {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  providerData?: Array<{
    providerId?: string | null;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  }>;
}

export interface HydratedFirebaseResult {
  user: User;
  shopId: string | null;
  needsFirestoreSync: boolean;
  error?: string;
}

function isPlaceholderAvatar(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  return url.includes('api.dicebear.com');
}

/**
 * Hydrates the authoritative BurMeal User from Firebase Auth identity (including providerData)
 * and any existing Firestore profile, repairing blank or stale fields without clobbering
 * custom non-placeholder avatars or owned-shop privileges.
 */
export function hydrateFirebaseUserProfile(
  fbUser: FirebaseIdentityInput,
  existingProfile: User | null,
  ownedShop: Shop | null,
  expectedRole?: 'CUSTOMER' | 'SHOP_OWNER'
): HydratedFirebaseResult {
  const provider = fbUser.providerData?.find((p) => p?.email || p?.displayName || p?.photoURL) || fbUser.providerData?.[0];
  const authEmail = (fbUser.email || provider?.email || '').trim();
  const profileEmail = (existingProfile?.email || '').trim();
  const email = profileEmail || authEmail;

  const authName = (fbUser.displayName || provider?.displayName || '').trim();
  const profileName = (existingProfile?.name || '').trim();
  const fallbackName = email ? email.split('@')[0] : 'Google User';
  const name = profileName || authName || fallbackName;

  const authPhoto = (fbUser.photoURL || provider?.photoURL || '').trim();
  const profilePhoto = (existingProfile?.avatarUrl || '').trim();
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fbUser.uid)}`;

  let avatarUrl = defaultAvatar;
  if (profilePhoto && !isPlaceholderAvatar(profilePhoto)) {
    avatarUrl = profilePhoto;
  } else if (authPhoto) {
    avatarUrl = authPhoto;
  } else if (profilePhoto) {
    avatarUrl = profilePhoto;
  }

  const resolved = resolveEffectiveUserRole(existingProfile, ownedShop, expectedRole);
  const createdAt = (existingProfile?.createdAt || '').trim() || new Date().toISOString();

  const user: User = {
    id: fbUser.uid,
    email,
    name,
    role: resolved.role,
    avatarUrl,
    createdAt,
  };

  const needsFirestoreSync =
    !existingProfile ||
    existingProfile.id !== user.id ||
    (existingProfile.email || '').trim() !== user.email ||
    (existingProfile.name || '').trim() !== user.name ||
    (existingProfile.avatarUrl || '').trim() !== user.avatarUrl ||
    existingProfile.role !== user.role ||
    !(existingProfile.createdAt || '').trim();

  return {
    user,
    shopId: resolved.shopId,
    needsFirestoreSync,
    error: resolved.error,
  };
}

/**
 * Builds a complete, Firestore-safe Shop object for a newly registered Shop Owner.
 */
export function buildNewShopForOwner(
  ownerId: string,
  ownerEmail: string,
  formData: {
    name?: string;
    shopName?: string;
    cuisineType?: string;
    locationArea?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  },
  shopId?: string
): Shop {
  const id = shopId || `shop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const cleanEmail = ownerEmail.trim().toLowerCase();
  const ownerDisplay = formData.name?.trim() || cleanEmail.split('@')[0] || 'Chef';
  const city = formData.city?.trim() || 'Yangon';
  const country = formData.country?.trim() || 'Myanmar';

  return {
    id,
    ownerId,
    ownerEmail: cleanEmail,
    name: formData.shopName?.trim() || `${ownerDisplay}'s Kitchen`,
    bio: 'Artisan home kitchen preparing authentic delicacies for direct contact and kitchen pick-up.',
    coverImage: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
    avatarImage: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(id)}`,
    status: 'APPROVED',
    cuisineType: formData.cuisineType?.trim() || 'Traditional Burmese Cuisine',
    locationArea: formData.locationArea?.trim() || `${city}, ${country}`,
    address: formData.address?.trim() || '',
    city,
    region: formData.region?.trim() || `${city} Region`,
    country,
    facebookUrl: '',
    whatsappPhone: '',
    viberPhone: '',
    lineId: '',
    phoneNumber: '',
    isOpen: true,
    operatingHours: '8:00 AM - 8:00 PM',
    createdAt: new Date().toISOString(),
    followerCount: 0,
    itemCount: 0,
    isFollowed: false,
  };
}

/**
 * Removes undefined properties recursively/shallowly so Firestore setDoc/updateDoc never throws.
 */
export function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

export interface FirebaseLoginErrorHandling {
  shouldFallbackToBackend: boolean;
  userError?: string;
}

/**
 * Classifies Firebase Auth email/password sign-in errors so expected credential
 * mismatches or legacy seeded-account checks fall through cleanly without noisy warnings,
 * while non-retryable errors surface immediately to the user.
 */
export function classifyFirebaseLoginError(code?: string): FirebaseLoginErrorHandling {
  switch (code) {
    case 'auth/invalid-email':
      return {
        shouldFallbackToBackend: false,
        userError: 'Please enter a valid email address.',
      };
    case 'auth/user-disabled':
      return {
        shouldFallbackToBackend: false,
        userError: 'This account has been disabled.',
      };
    case 'auth/too-many-requests':
      return {
        shouldFallbackToBackend: false,
        userError: 'Too many failed sign-in attempts. Please wait a moment and try again.',
      };
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/network-request-failed':
    case 'auth/operation-not-allowed':
    default:
      return { shouldFallbackToBackend: true };
  }
}
