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
  const ownerDisplay = formData.name?.trim() || ownerEmail.split('@')[0] || 'Chef';
  const city = formData.city?.trim() || 'Yangon';
  const country = formData.country?.trim() || 'Myanmar';

  return {
    id,
    ownerId,
    ownerEmail,
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
