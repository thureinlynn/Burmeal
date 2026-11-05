export type UserRole = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';

export type ShopApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type MenuType = 'SPECIAL' | 'WEEKLY' | 'PERMANENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  name: string;
  bio: string;
  coverImage: string;
  avatarImage: string;
  status: ShopApprovalStatus;
  cuisineType: string;
  locationArea: string;
  // Detailed Address Fields
  address?: string;
  city?: string;
  region?: string;
  country?: string; // e.g. "Myanmar", "Thailand", "Singapore", "United States", "United Kingdom", "Japan"
  // Contact & Direct ordering links
  facebookUrl?: string;
  whatsappPhone?: string; // e.g. "95912345678" -> https://wa.me/95912345678
  viberPhone?: string;    // e.g. "viber://chat?number=..."
  lineId?: string;        // e.g. "https://line.me/ti/p/~..." or LINE ID
  phoneNumber?: string;   // e.g. "+95912345678" -> tel:+95912345678
  createdAt: string;
  itemCount?: number;
  followerCount?: number;
}

export interface MenuItem {
  id: string;
  shopId: string;
  shopName?: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  menuType: MenuType; // 'SPECIAL' | 'WEEKLY' | 'PERMANENT'
  isVegetarian: boolean;
  isHalal: boolean;
  // Specific availability fields
  specialDate?: string; // YYYY-MM-DD for SPECIAL (One-day menu)
  availableDays?: string[]; // e.g. ['Mon', 'Wed', 'Fri'] for WEEKLY
  createdAt: string;
  isSaved?: boolean;
  contactLinks?: {
    whatsappPhone?: string;
    viberPhone?: string;
    lineId?: string;
    facebookUrl?: string;
    phoneNumber?: string;
  };
}

export interface AuthSession {
  user: User;
  token: string;
}
