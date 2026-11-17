import { User, Shop, MenuItem, MenuType, DailySpecialPost } from '../types/index';
import { matchesRegionFilter } from '../utils/filter';
import {
  applyDailySpecialPostUpdate,
  canCreateDailySpecialPost,
  computeDailySpecialExpiry,
  filterDailySpecialPosts,
  partitionDailySpecialPosts,
} from '../utils/dailySpecialHelpers';
import { validateMenuItemLimit } from '../utils/menuLimitHelpers';

const TOKEN_KEY = 'burmeal_token';
const SHOP_ID_KEY = 'burmeal_shop_id';
const REAL_DELTA_KEY = 'burmeal_real_delta_v1';
const LEGACY_MOCK_DELTA_KEY = 'burmeal_delta_v3';

interface DbState {
  users: User[];
  shops: Shop[];
  menuItems: MenuItem[];
  follows: { customerId: string; shopId: string }[];
  savedItems: { customerId: string; itemId: string }[];
}

const BASE_MOCK_SHOPS: Shop[] = [];
const BASE_MOCK_MENU_ITEMS: MenuItem[] = [];
const BASE_MOCK_USERS: User[] = [];

interface LocalDelta {
  customShops: Shop[];
  updatedShops: Record<string, Partial<Shop>>;
  customMenuItems: MenuItem[];
  updatedMenuItems: Record<string, Partial<MenuItem>>;
  deletedMenuItemIds: string[];
  customDailySpecials: DailySpecialPost[];
  follows: { customerId: string; shopId: string }[];
  savedItems: { customerId: string; itemId: string }[];
  customUsers: User[];
}

const DEFAULT_DELTA: LocalDelta = {
  customShops: [],
  updatedShops: {},
  customMenuItems: [],
  updatedMenuItems: {},
  deletedMenuItemIds: [],
  customDailySpecials: [],
  follows: [],
  savedItems: [],
  customUsers: [],
};

function getLocalDelta(): LocalDelta {
  try {
    localStorage.removeItem(LEGACY_MOCK_DELTA_KEY);
    const raw = localStorage.getItem(REAL_DELTA_KEY);
    if (!raw) return { ...DEFAULT_DELTA };
    const parsed = JSON.parse(raw);
    const { active } = partitionDailySpecialPosts(
      (Array.isArray(parsed.customDailySpecials) ? parsed.customDailySpecials : []) as DailySpecialPost[]
    );
    return {
      customShops: parsed.customShops || [],
      updatedShops: parsed.updatedShops || {},
      customMenuItems: parsed.customMenuItems || [],
      updatedMenuItems: parsed.updatedMenuItems || {},
      deletedMenuItemIds: parsed.deletedMenuItemIds || [],
      customDailySpecials: active,
      follows: parsed.follows || [],
      savedItems: parsed.savedItems || [],
      customUsers: parsed.customUsers || [],
    };
  } catch {
    return { ...DEFAULT_DELTA };
  }
}

function saveLocalDelta(delta: LocalDelta) {
  try {
    localStorage.setItem(REAL_DELTA_KEY, JSON.stringify(delta));
  } catch (e) {
    console.warn('Failed to save delta to localStorage', e);
  }
}

let cachedState: DbState | null = null;

function getLocalDb(): DbState {
  if (cachedState) return cachedState;
  const delta = getLocalDelta();

  const shops = BASE_MOCK_SHOPS.map((s) => {
    return delta.updatedShops[s.id] ? { ...s, ...delta.updatedShops[s.id] } : s;
  }).concat(delta.customShops || []);

  const deletedIds = new Set(delta.deletedMenuItemIds || []);
  const menuItems = BASE_MOCK_MENU_ITEMS.filter((m) => !deletedIds.has(m.id))
    .map((m) => (delta.updatedMenuItems[m.id] ? { ...m, ...delta.updatedMenuItems[m.id] } : m))
    .concat(delta.customMenuItems || []);

  const users = [...BASE_MOCK_USERS, ...(delta.customUsers || [])];

  cachedState = {
    users,
    shops,
    menuItems,
    follows: delta.follows || DEFAULT_DELTA.follows,
    savedItems: delta.savedItems || DEFAULT_DELTA.savedItems,
  };
  return cachedState;
}

function saveLocalDb(state: DbState) {
  cachedState = state;
  const baseShopMap = new Map(BASE_MOCK_SHOPS.map((s) => [s.id, s]));
  const updatedShops: Record<string, Partial<Shop>> = {};
  const customShops: Shop[] = [];

  for (const s of state.shops) {
    const base = baseShopMap.get(s.id);
    if (!base) {
      customShops.push(s);
    } else {
      if (
        s.name !== base.name ||
        s.bio !== base.bio ||
        s.coverImage !== base.coverImage ||
        s.avatarImage !== base.avatarImage ||
        s.profileImageUrl !== base.profileImageUrl ||
        s.address !== base.address ||
        s.latitude !== base.latitude ||
        s.longitude !== base.longitude ||
        s.phoneNumber !== base.phoneNumber ||
        s.facebookUrl !== base.facebookUrl ||
        s.whatsappPhone !== base.whatsappPhone ||
        s.status !== base.status
      ) {
        updatedShops[s.id] = s;
      }
    }
  }

  const baseItemMap = new Map(BASE_MOCK_MENU_ITEMS.map((m) => [m.id, m]));
  const updatedMenuItems: Record<string, Partial<MenuItem>> = {};
  const customMenuItems: MenuItem[] = [];
  const currentItemIds = new Set(state.menuItems.map((m) => m.id));
  const deletedMenuItemIds: string[] = [];

  for (const base of BASE_MOCK_MENU_ITEMS) {
    if (!currentItemIds.has(base.id)) {
      deletedMenuItemIds.push(base.id);
    }
  }

  for (const m of state.menuItems) {
    const base = baseItemMap.get(m.id);
    if (!base) {
      customMenuItems.push(m);
    } else {
      if (m.title !== base.title || m.price !== base.price || m.category !== base.category || m.menuType !== base.menuType) {
        updatedMenuItems[m.id] = m;
      }
    }
  }

  const baseUserIds = new Set(BASE_MOCK_USERS.map((u) => u.id));
  const customUsers = state.users.filter((u) => !baseUserIds.has(u.id));

  const prevDelta = getLocalDelta();
  saveLocalDelta({
    customShops,
    updatedShops,
    customMenuItems,
    updatedMenuItems,
    deletedMenuItemIds,
    customDailySpecials: prevDelta.customDailySpecials || [],
    follows: state.follows,
    savedItems: state.savedItems,
    customUsers,
  });
}



// Helper to determine active user id from token
function getUserIdFromToken(token?: string | null): string | null {
  if (!token) return null;
  const db = getLocalDb();
  if (token.startsWith('tok_usr_')) {
    const id = token.replace('tok_', '');
    const user = db.users.find((u) => u.id === id);
    if (user) return user.id;
  }
  const storedUser = localStorage.getItem('burmeal_user_data');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u?.id) return u.id;
    } catch {}
  }
  return null;
}

export const apiClient = {
  // Get all shops (with optional country & region filtering)
  async getShops(params?: { country?: string; regionId?: string; status?: string; followedOnly?: boolean } | string | null, tokenParam?: string | null): Promise<Shop[]> {
    const token = typeof params === 'string' ? params : tokenParam;
    const filterParams = typeof params === 'object' && params !== null ? params : {};

    try {
      const sp = new URLSearchParams();
      if (filterParams.country) sp.append('country', filterParams.country);
      if (filterParams.regionId) sp.append('regionId', filterParams.regionId);
      if (filterParams.status) sp.append('status', filterParams.status);
      if (filterParams.followedOnly) sp.append('followedOnly', 'true');

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const url = `/api/shops${sp.toString() ? `?${sp.toString()}` : ''}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data;
          }
        }
      }
    } catch (e) {
      // Serverless or Vercel static fallback
    }

    // Client persistent fallback
    const db = getLocalDb();
    const userId = getUserIdFromToken(token);
    let shops = db.shops;

    // Apply followedOnly or region/country filtering
    if (filterParams.followedOnly) {
      if (!userId) return [];
      const followedIds = db.follows.filter((f) => f.customerId === userId).map((f) => f.shopId);
      shops = shops.filter((s) => followedIds.includes(s.id));
    } else {
      shops = shops.filter((s) => matchesRegionFilter(s, filterParams.regionId, filterParams.country));
    }

    return shops.map((s) => ({
      ...s,
      isFollowed: userId ? db.follows.some((f) => f.customerId === userId && f.shopId === s.id) : false,
      itemCount: db.menuItems.filter((m) => m.shopId === s.id).length,
      followerCount: db.follows.filter((f) => f.shopId === s.id).length,
    }));
  },

  // Get single shop
  async getShop(id: string, token?: string | null): Promise<Shop | null> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/shops/${id}`, { headers });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return await res.json();
        }
      }
    } catch {}

    const db = getLocalDb();
    const shop = db.shops.find((s) => s.id === id);
    if (!shop) return null;
    const userId = getUserIdFromToken(token);
    return {
      ...shop,
      isFollowed: userId ? db.follows.some((f) => f.customerId === userId && f.shopId === shop.id) : false,
      itemCount: db.menuItems.filter((m) => m.shopId === shop.id).length,
      followerCount: db.follows.filter((f) => f.shopId === shop.id).length,
    };
  },

  // Update shop profile
  async updateShop(shopId: string, data: Partial<Shop>, token?: string | null): Promise<{ success: boolean; shop?: Shop }> {
    let serverSuccess = false;
    try {
      if (token) {
        const res = await fetch(`/api/shops/${shopId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          serverSuccess = true;
        }
      }
    } catch {}

    // Always update client storage to guarantee instant Vercel responsiveness
    const db = getLocalDb();
    const idx = db.shops.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      db.shops[idx] = { ...db.shops[idx], ...data };
      saveLocalDb(db);
      return { success: true, shop: db.shops[idx] };
    }
    return { success: serverSuccess };
  },

  // Get menu items with query/filters, region scoping, and strict FOLLOWED feed logic
  async getMenuItems(
    params: {
      shopId?: string | null;
      menuType?: MenuType | 'ALL';
      category?: string;
      isVegetarian?: boolean;
      isHalal?: boolean;
      query?: string;
      feedType?: 'FOLLOWED';
      country?: string;
      regionId?: string;
    },
    token?: string | null
  ): Promise<{ items: MenuItem[]; feedSource: string; followedCount: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.shopId) sp.append('shopId', params.shopId);
      if (params.menuType && params.menuType !== 'ALL') sp.append('menuType', params.menuType);
      if (params.category && params.category !== 'ALL') sp.append('category', params.category);
      if (params.isVegetarian) sp.append('isVegetarian', 'true');
      if (params.isHalal) sp.append('isHalal', 'true');
      if (params.query) sp.append('query', params.query);
      if (params.feedType) sp.append('feedType', params.feedType);
      if (params.country) sp.append('country', params.country);
      if (params.regionId) sp.append('regionId', params.regionId);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/menu-items?${sp.toString()}`, { headers });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          if (json && Array.isArray(json.items)) {
            return json;
          }
        }
      }
    } catch {}

    // Client fallback
    const db = getLocalDb();
    const userId = getUserIdFromToken(token);
    let items = [...db.menuItems];

    if (params.shopId) {
      items = items.filter((i) => i.shopId === params.shopId);
    }

    // Country/Region scoping across shops (unless inspecting a specific shop directly)
    if (!params.shopId && (params.country || params.regionId)) {
      const allowedShopIds = new Set(
        db.shops.filter((s) => matchesRegionFilter(s, params.regionId, params.country)).map((s) => s.id)
      );
      items = items.filter((i) => allowedShopIds.has(i.shopId));
    }

    if (params.menuType && params.menuType !== 'ALL') {
      items = items.filter((i) => i.menuType === params.menuType);
    }
    if (params.category && params.category !== 'ALL') {
      items = items.filter((i) => i.category === params.category);
    }
    if (params.isVegetarian) {
      items = items.filter((i) => i.isVegetarian);
    }
    if (params.isHalal) {
      items = items.filter((i) => i.isHalal);
    }
    if (params.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.shopName && i.shopName.toLowerCase().includes(q))
      );
    }

    const followedShopIds = userId
      ? db.follows.filter((f) => f.customerId === userId).map((f) => f.shopId)
      : [];

    let feedSource = 'DISCOVER';
    if (params.feedType === 'FOLLOWED') {
      // REQUIREMENT 2: STRICT INCLUSION of ONLY followed shops, STRICT EXCLUSION of non-followed
      items = items.filter((i) => followedShopIds.includes(i.shopId));
      feedSource = 'FOLLOWED';
    }

    const mapped = items.map((it) => {
      const s = db.shops.find((shp) => shp.id === it.shopId);
      return {
        ...it,
        shopName: s?.name || it.shopName || 'Local Kitchen',
        shopCountry: s?.country || it.shopCountry,
        shopRegion: s?.region || it.shopRegion,
        shopCity: s?.city || it.shopCity,
        country: s?.country || it.country || it.shopCountry,
        isSaved: userId ? db.savedItems.some((sv) => sv.customerId === userId && sv.itemId === it.id) : false,
        contactLinks: s
          ? {
              whatsappPhone: s.whatsappPhone,
              viberPhone: s.viberPhone,
              lineId: s.lineId,
              facebookUrl: s.facebookUrl,
              phoneNumber: s.phoneNumber,
            }
          : undefined,
      };
    });

    return {
      items: mapped,
      feedSource,
      followedCount: followedShopIds.length,
    };
  },

  // Create menu item
  async createMenuItem(data: Partial<MenuItem>, token?: string | null): Promise<MenuItem> {
    try {
      if (token) {
        const res = await fetch('/api/menu-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const created = await res.json();
            const normalizedItem: MenuItem = created.item || {
              ...(data as MenuItem),
              id: created.id || created.itemId || data.id || 'item_' + Date.now(),
            };
            const db = getLocalDb();
            db.menuItems = [
              normalizedItem,
              ...db.menuItems.filter((m) => m.id !== normalizedItem.id),
            ];
            saveLocalDb(db);
            return normalizedItem;
          }
        } else if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          const apiErr = new Error(errBody.error || `Failed to create menu item (${res.status})`);
          (apiErr as any).isApiError = true;
          throw apiErr;
        }
      }
    } catch (err: any) {
      if (err?.isApiError) throw err;
    }

    // Client fallback
    const db = getLocalDb();
    const targetShop = db.shops.find((s) => s.id === data.shopId);
    const resolvedShopId = data.shopId || targetShop?.id || '';
    const resolvedMenuType: MenuType = data.menuType || 'WEEKLY';
    const newId = data.id || 'item_' + Date.now();

    const shopExistingItems = db.menuItems.filter((m) => m.shopId === resolvedShopId);
    const limitCheck = validateMenuItemLimit(shopExistingItems, resolvedMenuType, newId);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.error);
    }

    const newItem: MenuItem = {
      id: newId,
      shopId: resolvedShopId,
      shopName: data.shopName || targetShop?.name || '',
      title: data.title || 'Untitled Dish',
      description: data.description || '',
      image: data.image || '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
      price: typeof data.price === 'number' ? data.price : parseFloat(data.price as any) || 5.0,
      category: data.category || 'Noodles & Broth',
      menuType: resolvedMenuType,
      isVegetarian: Boolean(data.isVegetarian),
      isHalal: Boolean(data.isHalal),
      specialDate: data.specialDate || (resolvedMenuType === 'SPECIAL' ? new Date().toISOString().slice(0, 10) : undefined),
      availableDays: data.availableDays || (resolvedMenuType === 'WEEKLY' ? ['Mon', 'Wed', 'Fri'] : undefined),
      createdAt: new Date().toISOString(),
      isSaved: false,
    };

    db.menuItems.unshift(newItem);
    saveLocalDb(db);
    return newItem;
  },

  // Update menu item
  async updateMenuItem(id: string, data: Partial<MenuItem>, token?: string | null): Promise<boolean> {
    try {
      if (token) {
        const res = await fetch(`/api/menu-items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const db = getLocalDb();
          const idx = db.menuItems.findIndex((m) => m.id === id);
          if (idx !== -1) {
            db.menuItems[idx] = { ...db.menuItems[idx], ...data };
            saveLocalDb(db);
          }
          return true;
        } else if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          const apiErr = new Error(errBody.error || `Failed to update menu item (${res.status})`);
          (apiErr as any).isApiError = true;
          throw apiErr;
        }
      }
    } catch (err: any) {
      if (err?.isApiError) throw err;
    }

    const db = getLocalDb();
    const idx = db.menuItems.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const existing = db.menuItems[idx];
      const nextMenuType = data.menuType || existing.menuType;
      const limitCheck = validateMenuItemLimit(
        db.menuItems.filter((m) => m.shopId === existing.shopId),
        nextMenuType,
        id
      );
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.error);
      }
      db.menuItems[idx] = { ...existing, ...data };
      saveLocalDb(db);
      return true;
    }
    return false;
  },

  // Delete menu item
  async deleteMenuItem(id: string, token?: string | null): Promise<boolean> {
    try {
      if (token) {
        await fetch(`/api/menu-items/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}

    const db = getLocalDb();
    db.menuItems = db.menuItems.filter((m) => m.id !== id);
    db.savedItems = db.savedItems.filter((s) => s.itemId !== id);
    saveLocalDb(db);
    return true;
  },

  // Get saved items for current user
  async getSavedItems(token?: string | null): Promise<MenuItem[]> {
    try {
      if (token) {
        const res = await fetch('/api/saved-items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            return await res.json();
          }
        }
      }
    } catch {}

    const db = getLocalDb();
    const userId = getUserIdFromToken(token);
    if (!userId) return [];

    const savedIds = db.savedItems.filter((s) => s.customerId === userId).map((s) => s.itemId);
    return db.menuItems
      .filter((m) => savedIds.includes(m.id))
      .map((m) => {
        const s = db.shops.find((shp) => shp.id === m.shopId);
        return {
          ...m,
          shopName: s?.name || m.shopName,
          shopCountry: s?.country || m.shopCountry,
          shopRegion: s?.region || m.shopRegion,
          shopCity: s?.city || m.shopCity,
          country: s?.country || m.country || m.shopCountry,
          isSaved: true,
        };
      });
  },

  // Toggle save
  async toggleSave(itemId: string, token?: string | null, desiredState?: boolean): Promise<boolean> {
    try {
      if (token) {
        const res = await fetch(`/api/menu-items/${itemId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(desiredState !== undefined ? { desiredState } : {}),
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            if (typeof data?.saved === 'boolean') {
              return data.saved;
            }
          }
        }
      }
    } catch {}

    const db = getLocalDb();
    const userId = getUserIdFromToken(token);
    if (!userId) return false;
    const exists = db.savedItems.some((s) => s.customerId === userId && s.itemId === itemId);
    const nextSaved = desiredState !== undefined ? desiredState : !exists;
    if (!nextSaved) {
      db.savedItems = db.savedItems.filter((s) => !(s.customerId === userId && s.itemId === itemId));
    } else if (!exists) {
      db.savedItems.push({ customerId: userId, itemId });
    }
    saveLocalDb(db);
    return nextSaved;
  },

  // Toggle follow shop
  async toggleFollow(shopId: string, token?: string | null, desiredState?: boolean): Promise<boolean> {
    try {
      if (token) {
        const res = await fetch(`/api/shops/${shopId}/follow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(desiredState !== undefined ? { desiredState } : {}),
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            if (typeof data?.followed === 'boolean') {
              return data.followed;
            }
          }
        }
      }
    } catch {}

    const db = getLocalDb();
    const userId = getUserIdFromToken(token);
    if (!userId) return false;
    const exists = db.follows.some((f) => f.customerId === userId && f.shopId === shopId);
    const nextFollowed = desiredState !== undefined ? desiredState : !exists;
    if (!nextFollowed) {
      db.follows = db.follows.filter((f) => !(f.customerId === userId && f.shopId === shopId));
    } else if (!exists) {
      db.follows.push({ customerId: userId, shopId });
    }
    saveLocalDb(db);
    return nextFollowed;
  },

  // Auth: Login
  async login(email: string, password?: string): Promise<{ success: boolean; user?: User; shopId?: string; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data && data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem('burmeal_user_data', JSON.stringify(data.user));
          if (data.shopId) localStorage.setItem(SHOP_ID_KEY, data.shopId);
          else localStorage.removeItem(SHOP_ID_KEY);
          return { success: true, user: data.user, shopId: data.shopId, token: data.token };
        }
        return { success: false, error: data?.error || 'Invalid email or password.' };
      }
    } catch {}

    // Client fallback login (static/offline mode only — never auto-creates a fake CUSTOMER)
    const db = getLocalDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'Account not found. Please check your email or sign up first.' };
    }

    let shopId: string | undefined = undefined;
    if (user.role === 'SHOP_OWNER') {
      const shop = db.shops.find((s) => s.ownerId === user?.id || s.ownerEmail === user?.email);
      if (shop) shopId = shop.id;
    }

    const token = 'tok_' + user.id;
    localStorage.setItem(TOKEN_KEY, token);
    if (shopId) localStorage.setItem(SHOP_ID_KEY, shopId);
    else localStorage.removeItem(SHOP_ID_KEY);
    localStorage.setItem('burmeal_user_data', JSON.stringify(user));

    return {
      success: true,
      user,
      shopId,
      token,
    };
  },

  // Auth: Firebase Customer Login (Google)
  async firebaseLogin(payload: {
    uid: string;
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    provider?: string;
  }): Promise<{ success: boolean; user?: User; shopId?: string; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (data && data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem('burmeal_user_data', JSON.stringify(data.user));
            return { success: true, user: data.user, shopId: data.shopId, token: data.token };
          }
        }
      }
    } catch {}

    // Fallback in-memory/localStorage
    const db = getLocalDb();
    let user = db.users.find((u) => u.id === payload.uid || (payload.email && u.email === payload.email));
    if (!user) {
      user = {
        id: payload.uid,
        email: payload.email || `${payload.uid}@customer.burmeal.com`,
        name: payload.name || 'Customer',
        role: 'CUSTOMER',
        avatarUrl: payload.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.uid}`,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveLocalDb(db);
    }
    const token = 'tok_' + user.id;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('burmeal_user_data', JSON.stringify(user));
    return { success: true, user, token };
  },

  // Sync Firebase user & shop into SQLite session and local cache
  async syncFirebaseAccount(user: User, shop?: Shop | null): Promise<{ token?: string; shopId?: string | null }> {
    const db = getLocalDb();
    if (!db.users.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())) {
      db.users.push(user);
    }
    if (shop && !db.shops.some((s) => s.id === shop.id)) {
      db.shops.unshift(shop);
    }
    saveLocalDb(db);

    try {
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, shop }),
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          return { token: data.token, shopId: data.shopId };
        }
      }
    } catch {}
    return { shopId: shop?.id || null };
  },

  // Auth: Register (Supports both CUSTOMER and SHOP_OWNER)
  async register(formData: any): Promise<{ success: boolean; user?: User; shopId?: string; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data && data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem('burmeal_user_data', JSON.stringify(data.user));
          if (data.shopId) localStorage.setItem(SHOP_ID_KEY, data.shopId);
          else localStorage.removeItem(SHOP_ID_KEY);
          return { success: true, user: data.user, shopId: data.shopId, token: data.token };
        }
        return { success: false, error: data?.error || 'Registration failed.' };
      }
    } catch {}

    // Client storage fallback: guarantees 100% registration success on Vercel deployments
    const db = getLocalDb();
    const { email, name, role, shopName, cuisineType, locationArea, address, city, region, country } = formData;

    const existingUser = db.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const userId = 'usr_' + Date.now();
    const newUser: User = {
      id: userId,
      email: email || `user_${Date.now()}@example.com`,
      name: name || 'New Foodie',
      role: role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    let createdShopId: string | undefined = undefined;
    if (newUser.role === 'SHOP_OWNER') {
      createdShopId = 'shop_' + Date.now();
      const newShop: Shop = {
        id: createdShopId,
        ownerId: userId,
        ownerEmail: newUser.email,
        name: shopName || `${newUser.name}'s Kitchen`,
        bio: 'Welcome to our authentic kitchen! We specialize in home-cooked specialties and daily chef selections.',
        coverImage: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
        avatarImage: `https://api.dicebear.com/7.x/identicon/svg?seed=${shopName || 'shop'}`,
        status: 'APPROVED', // Immediately approved on client so user can start testing without admin bottleneck!
        cuisineType: cuisineType || 'Traditional Burmese Cuisine',
        locationArea: locationArea || (city ? `${city}, ${country || 'Myanmar'}` : 'Downtown Central'),
        address: address || 'Main Road',
        city: city || 'Yangon',
        region: region || 'Yangon Region',
        country: country || 'Myanmar',
        facebookUrl: '',
        whatsappPhone: '',
        viberPhone: '',
        lineId: '',
        phoneNumber: '',
        createdAt: new Date().toISOString(),
        followerCount: 0,
        itemCount: 0,
      };
      db.shops.unshift(newShop);
    }

    saveLocalDb(db);

    const token = 'tok_' + userId;
    localStorage.setItem(TOKEN_KEY, token);
    if (createdShopId) localStorage.setItem(SHOP_ID_KEY, createdShopId);
    localStorage.setItem('burmeal_user_data', JSON.stringify(newUser));

    return {
      success: true,
      user: newUser,
      shopId: createdShopId,
      token,
    };
  },

  // Get current user session
  async getMe(token: string): Promise<{ user: User; shopId?: string } | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          return { user: data.user, shopId: data.shopId };
        }
      }
      if (res.status === 401) {
        return null;
      }
    } catch {}

    const db = getLocalDb();
    const userId = getUserIdFromToken(token);
    if (!userId) return null;
    const user = db.users.find((u) => u.id === userId);
    if (!user) return null;

    let shopId: string | undefined = undefined;
    if (user.role === 'SHOP_OWNER') {
      const shop = db.shops.find((s) => s.ownerId === user.id || s.ownerEmail === user.email);
      if (shop) shopId = shop.id;
    }
    return { user, shopId };
  },

  // Admin approval
  async adminUpdateStatus(shopId: string, status: 'APPROVED' | 'REJECTED', token?: string | null): Promise<boolean> {
    try {
      if (token) {
        await fetch(`/api/admin/shops/${shopId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });
      }
    } catch {}

    const db = getLocalDb();
    const shop = db.shops.find((s) => s.id === shopId);
    if (shop) {
      shop.status = status;
      saveLocalDb(db);
      return true;
    }
    return false;
  },

  // Daily Special Posts (Facebook-style 48h feed)
  async getDailySpecialPosts(
    params?: {
      shopId?: string | null;
      query?: string;
      feedType?: 'FOLLOWED';
      country?: string;
      regionId?: string;
    },
    token?: string | null
  ): Promise<DailySpecialPost[]> {
    try {
      const sp = new URLSearchParams();
      if (params?.shopId) sp.append('shopId', params.shopId);
      if (params?.query) sp.append('query', params.query);
      if (params?.feedType) sp.append('feedType', params.feedType);
      if (params?.country) sp.append('country', params.country);
      if (params?.regionId) sp.append('regionId', params.regionId);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/daily-specials${sp.toString() ? `?${sp.toString()}` : ''}`, {
        headers,
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          if (json && Array.isArray(json.posts)) {
            return partitionDailySpecialPosts(json.posts as DailySpecialPost[]).active;
          }
        }
      }
    } catch {}

    const delta = getLocalDelta();
    const db = getLocalDb();
    return filterDailySpecialPosts(delta.customDailySpecials || [], {
      shopId: params?.shopId,
      country: params?.country,
      regionId: params?.regionId,
      query: params?.query,
      shopsLookup: db.shops,
    });
  },

  async createDailySpecialPost(
    data: Partial<DailySpecialPost>,
    token?: string | null
  ): Promise<DailySpecialPost> {
    let clientError: Error | null = null;
    try {
      if (token) {
        const res = await fetch('/api/daily-specials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        const ct = res.headers.get('content-type') || '';
        if (res.ok) {
          if (ct.includes('application/json')) {
            const created = await res.json();
            if (created?.post) {
              const delta = getLocalDelta();
              delta.customDailySpecials = [
                created.post,
                ...delta.customDailySpecials.filter((p) => p.id !== created.post.id),
              ];
              saveLocalDelta(delta);
              return created.post;
            }
          }
        } else if (res.status >= 400 && res.status < 500) {
          let errMessage = 'Could not publish Daily Special post.';
          if (ct.includes('application/json')) {
            const errJson = await res.json().catch(() => null);
            if (errJson?.error) errMessage = errJson.error;
          }
          clientError = new Error(errMessage);
        }
      }
    } catch {}

    if (clientError) {
      throw clientError;
    }

    const db = getLocalDb();
    const targetShop = db.shops.find((s) => s.id === data.shopId);
    const resolvedShopId = data.shopId || targetShop?.id || '';
    const delta = getLocalDelta();
    if (!canCreateDailySpecialPost(delta.customDailySpecials || [], resolvedShopId)) {
      throw new Error(
        'Only 1 active Daily Special post is allowed at a time. Wait 48 hours for it to expire or delete your current post first.'
      );
    }

    const createdAt = data.createdAt || new Date().toISOString();
    const newPost: DailySpecialPost = {
      id: data.id || `dsp_${Date.now()}`,
      shopId: resolvedShopId,
      shopName: data.shopName || targetShop?.name || 'Local Kitchen',
      shopAvatarImage: data.shopAvatarImage || targetShop?.profileImageUrl || targetShop?.avatarImage,
      shopCountry: data.shopCountry || targetShop?.country,
      shopRegion: data.shopRegion || targetShop?.region,
      shopCity: data.shopCity || targetShop?.city,
      title: (data.title || '').trim(),
      post: (data.post || '').trim(),
      image: data.image || '',
      imageStoragePath: data.imageStoragePath || '',
      createdAt,
      expiresAt: data.expiresAt || computeDailySpecialExpiry(createdAt),
    };

    delta.customDailySpecials = [
      newPost,
      ...delta.customDailySpecials.filter((p) => p.id !== newPost.id),
    ];
    saveLocalDelta(delta);
    return newPost;
  },

  async updateDailySpecialPost(
    id: string,
    data: {
      title: string;
      post: string;
      image?: string;
      imageStoragePath?: string;
    },
    token?: string | null
  ): Promise<DailySpecialPost | null> {
    try {
      if (token) {
        const res = await fetch(`/api/daily-specials/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const updated = await res.json();
            if (updated?.post) {
              const delta = getLocalDelta();
              delta.customDailySpecials = (delta.customDailySpecials || []).map((p) =>
                p.id === id ? updated.post : p
              );
              saveLocalDelta(delta);
              return updated.post as DailySpecialPost;
            }
          }
        }
      }
    } catch {}

    const delta = getLocalDelta();
    let updatedLocal: DailySpecialPost | null = null;
    delta.customDailySpecials = (delta.customDailySpecials || []).map((p) => {
      if (p.id !== id) return p;
      updatedLocal = applyDailySpecialPostUpdate(p, data);
      return updatedLocal;
    });
    saveLocalDelta(delta);
    return updatedLocal;
  },

  async deleteDailySpecialPost(id: string, token?: string | null): Promise<boolean> {
    try {
      if (token) {
        await fetch(`/api/daily-specials/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}

    const delta = getLocalDelta();
    delta.customDailySpecials = delta.customDailySpecials.filter((p) => p.id !== id);
    saveLocalDelta(delta);
    return true;
  },
};

