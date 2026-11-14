import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useLocation } from './context/LocationContext';
import { MenuItem, Shop, MenuType } from './types';
import { apiClient } from './services/apiClient';
import { firestoreService } from './services/firestoreService';
import {
  mergeUniqueIds,
  mergeUniqueShops,
  mergeUniqueMenuItems,
  applyFollowStateToShops,
  applySaveStateToMenuItems,
  filterFollowedShops,
  filterFollowedMenuItems,
  filterSavedMenuItems,
} from './utils/userDataHelpers';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FilterBar } from './components/FilterBar';
import { MenuCard } from './components/MenuCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ShopProfileView } from './components/ShopProfileView';
import { ShopDashboard } from './components/ShopDashboard';
import { CustomerProfile } from './components/CustomerProfile';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ShopCard } from './components/ShopCard';
import { FollowedShopRow } from './components/FollowedShopRow';
import { SettingsView } from './components/SettingsView';
import { LocationModal } from './components/LocationModal';
import {
  Sparkles,
  Heart,
  Bookmark,
  Store,
  MapPin,
} from 'lucide-react';

export default function App() {
  const { user, token, shopId } = useAuth();
  const { t } = useLanguage();
  const {
    selectedCountry,
    selectedRegionId,
    selectedRegionName,
    selectedFlag,
    isLocationModalOpen,
    openLocationModal,
    closeLocationModal,
  } = useLocation();

  // Navigation State: 'feed' | 'following' | 'shops' | 'shop_detail' | 'saved' | 'profile' | 'shop_overview' | 'shop_menus' | 'shop_profile' | 'admin' | 'settings'
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>('CUSTOMER');

  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [allBackendShopsCache, setAllBackendShopsCache] = useState<Shop[]>([]);
  const [allBackendItemsCache, setAllBackendItemsCache] = useState<MenuItem[]>([]);
  const [firestoreShopsCache, setFirestoreShopsCache] = useState<Shop[]>([]);
  const [firestoreItemsCache, setFirestoreItemsCache] = useState<MenuItem[]>([]);
  const [firestoreFollowedIds, setFirestoreFollowedIds] = useState<string[]>([]);
  const [firestoreSavedIds, setFirestoreSavedIds] = useState<string[]>([]);
  const [backendFollowedIds, setBackendFollowedIds] = useState<string[]>([]);
  const [backendSavedIds, setBackendSavedIds] = useState<string[]>([]);
  const [followingViewMode, setFollowingViewMode] = useState<'SHOPS' | 'DISHES'>('SHOPS');
  const [savedItems, setSavedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType | 'ALL'>('ALL');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const isSignedIn = Boolean(user || token);

  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  // Effective cross-device IDs (Firestore real-time UID/email source of truth + backend session fallback)
  const effectiveFollowedIds = React.useMemo(
    () => new Set(mergeUniqueIds(firestoreFollowedIds, backendFollowedIds)),
    [firestoreFollowedIds, backendFollowedIds]
  );

  const effectiveSavedIds = React.useMemo(
    () => new Set(mergeUniqueIds(firestoreSavedIds, backendSavedIds)),
    [firestoreSavedIds, backendSavedIds]
  );

  // Subscribe to global Firestore shops & menu_items caches so followed/saved custom shops/items resolve across devices
  useEffect(() => {
    const unsubShops = firestoreService.subscribeShops((fsShops) => {
      setFirestoreShopsCache(fsShops);
    });
    const unsubItems = firestoreService.subscribeMenuItems((fsItems) => {
      setFirestoreItemsCache(fsItems);
    });
    return () => {
      unsubShops();
      unsubItems();
    };
  }, []);

  // Subscribe to Firestore follows & saved_items for the active Firebase UID + normalized email
  useEffect(() => {
    if (!user?.id && !user?.email) {
      setFirestoreFollowedIds([]);
      setFirestoreSavedIds([]);
      return;
    }
    const unsubFollows = firestoreService.subscribeFollows(
      user.id || '',
      (ids) => setFirestoreFollowedIds(ids),
      user.email
    );
    const unsubSaved = firestoreService.subscribeSavedItems(
      user.id || '',
      (ids) => setFirestoreSavedIds(ids),
      user.email
    );
    return () => {
      unsubFollows();
      unsubSaved();
    };
  }, [user?.id, user?.email]);

  // Load Shops scoped to user's selected Country & Region
  const loadShops = async () => {
    try {
      const data = await apiClient.getShops(
        {
          country: selectedCountry,
          regionId: selectedRegionId,
        },
        token
      );
      setShops(data);
    } catch (err) {
      console.error('Failed to load shops', err);
    }
  };

  // Load Menu Items scoped to user's selected Country & Region (or selected shop)
  const loadMenuItems = async () => {
    setIsLoading(true);
    try {
      const isFollowFeed = currentTab === 'following';
      const data = await apiClient.getMenuItems(
        {
          shopId: selectedShopId,
          menuType: selectedMenuType,
          category: selectedCategory,
          isVegetarian,
          isHalal,
          query: searchQuery.trim(),
          country: isFollowFeed || selectedShopId ? undefined : selectedCountry,
          regionId: isFollowFeed || selectedShopId ? undefined : selectedRegionId,
        },
        token
      );
      setMenuItems(data.items || []);
    } catch (err) {
      console.error('Failed to load menu items', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Saved Items & full cross-region catalog cache so bookmarked items/followed shops resolve across regions & devices
  const loadSavedItems = async () => {
    if (!isSignedIn) {
      setSavedItems([]);
      setBackendSavedIds([]);
      return;
    }
    try {
      const [backendSaved, allItemsRes] = await Promise.all([
        token ? apiClient.getSavedItems(token) : Promise.resolve([]),
        apiClient.getMenuItems({}, token),
      ]);
      setSavedItems(backendSaved);
      setBackendSavedIds(backendSaved.map((i) => i.id));
      if (allItemsRes?.items) {
        setAllBackendItemsCache(allItemsRes.items);
      }
    } catch (err) {
      console.error('Failed to load saved items', err);
    }
  };

  const loadFollowedShops = async () => {
    if (!isSignedIn) {
      setBackendFollowedIds([]);
      return;
    }
    try {
      const [backendFollowed, allShops] = await Promise.all([
        token ? apiClient.getShops({ followedOnly: true }, token) : Promise.resolve([]),
        apiClient.getShops(null, token),
      ]);
      setBackendFollowedIds(backendFollowed.map((s) => s.id));
      setAllBackendShopsCache(allShops);
    } catch (err) {
      console.error('Failed to load followed shops', err);
    }
  };

  // Auto-reload data whenever auth token, country, or region changes
  useEffect(() => {
    loadShops();
  }, [token, selectedCountry, selectedRegionId]);

  useEffect(() => {
    loadMenuItems();
  }, [
    token,
    currentTab,
    selectedShopId,
    selectedMenuType,
    selectedCategory,
    isVegetarian,
    isHalal,
    searchQuery,
    selectedCountry,
    selectedRegionId,
  ]);

  useEffect(() => {
    if (isSignedIn) {
      loadFollowedShops();
      loadSavedItems();
    } else {
      setBackendFollowedIds([]);
      setBackendSavedIds([]);
      setAllBackendShopsCache([]);
      setAllBackendItemsCache([]);
      setSavedItems([]);
    }
  }, [token, user?.id, currentTab]);

  // Handle follow toggle (persists to both Firestore and backend SQLite cleanly)
  const handleToggleFollow = async (targetShopId: string) => {
    if (!isSignedIn) {
      setAuthDefaultRole('CUSTOMER');
      setIsAuthModalOpen(true);
      return;
    }
    const nextFollowed = !effectiveFollowedIds.has(targetShopId);
    const updateIds = (prev: string[]) =>
      nextFollowed ? mergeUniqueIds(prev, [targetShopId]) : prev.filter((id) => id !== targetShopId);

    setFirestoreFollowedIds(updateIds);
    setBackendFollowedIds(updateIds);

    try {
      await Promise.all([
        user?.id
          ? firestoreService.toggleFollow(user.id, targetShopId, user.email, nextFollowed).catch((fbErr) => {
              console.warn('Firestore follow sync notice:', fbErr);
              return nextFollowed;
            })
          : Promise.resolve(nextFollowed),
        token ? apiClient.toggleFollow(targetShopId, token, nextFollowed).catch(() => nextFollowed) : Promise.resolve(nextFollowed),
      ]);
      await loadShops();
      await loadFollowedShops();
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  // Handle save bookmark toggle (persists to both Firestore and backend SQLite cleanly)
  const handleToggleSave = async (item: MenuItem) => {
    if (!isSignedIn) {
      setAuthDefaultRole('CUSTOMER');
      setIsAuthModalOpen(true);
      return;
    }
    const nextSaved = !effectiveSavedIds.has(item.id);
    const updateIds = (prev: string[]) =>
      nextSaved ? mergeUniqueIds(prev, [item.id]) : prev.filter((id) => id !== item.id);

    setFirestoreSavedIds(updateIds);
    setBackendSavedIds(updateIds);
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isSaved: nextSaved } : i)));
    if (selectedItemForDetail && selectedItemForDetail.id === item.id) {
      setSelectedItemForDetail({
        ...selectedItemForDetail,
        isSaved: nextSaved,
      });
    }

    try {
      await Promise.all([
        user?.id
          ? firestoreService.toggleSaveItem(user.id, item.id, user.email, nextSaved).catch((fbErr) => {
              console.warn('Firestore save sync notice:', fbErr);
              return nextSaved;
            })
          : Promise.resolve(nextSaved),
        token ? apiClient.toggleSave(item.id, token, nextSaved).catch(() => nextSaved) : Promise.resolve(nextSaved),
      ]);
      if (currentTab === 'saved') {
        await loadSavedItems();
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // Dedicated Owner Shop & Menu state (never filtered out by consumer region)
  const [ownerShop, setOwnerShop] = useState<Shop | null>(null);
  const [ownerMenuItems, setOwnerMenuItems] = useState<MenuItem[]>([]);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);

  const loadOwnerData = async () => {
    if (user?.role !== 'SHOP_OWNER') {
      setOwnerShop(null);
      setOwnerMenuItems([]);
      setIsOwnerLoading(false);
      return;
    }
    setIsOwnerLoading(true);
    try {
      let resolvedShop: Shop | null = null;
      if (shopId) {
        const [fsShop, apiShop] = await Promise.all([
          firestoreService.getShopById(shopId).catch(() => null),
          apiClient.getShop(shopId, token).catch(() => null),
        ]);
        if (fsShop && apiShop) {
          resolvedShop = { ...apiShop, ...fsShop };
        } else {
          resolvedShop = fsShop || apiShop;
        }
      }
      if (!resolvedShop && user.id) {
        resolvedShop = await firestoreService.getShopByOwnerId(user.id);
      }
      if (!resolvedShop && user.email) {
        resolvedShop = await firestoreService.getShopByOwnerEmail(user.email);
      }
      if (!resolvedShop) {
        const allShops = await apiClient.getShops(null, token);
        resolvedShop =
          allShops.find(
            (s) =>
              s.ownerId === user.id ||
              (user.email && s.ownerEmail?.toLowerCase() === user.email.toLowerCase())
          ) || null;
      }

      if (resolvedShop) {
        setOwnerShop(resolvedShop);
        const [fsItems, apiRes] = await Promise.all([
          firestoreService.getMenuItemsByShopId(resolvedShop.id),
          apiClient.getMenuItems({ shopId: resolvedShop.id }, token),
        ]);
        const mergedMap = new Map<string, MenuItem>();
        for (const item of fsItems) {
          mergedMap.set(item.id, item);
        }
        for (const item of apiRes?.items || []) {
          if (!mergedMap.has(item.id)) {
            mergedMap.set(item.id, item);
          }
        }
        setOwnerMenuItems(Array.from(mergedMap.values()));
      } else {
        setOwnerShop(null);
        setOwnerMenuItems([]);
      }
    } catch (err) {
      console.error('Failed to load owner data:', err);
    } finally {
      setIsOwnerLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SHOP_OWNER') {
      loadOwnerData();
    } else {
      setOwnerShop(null);
      setOwnerMenuItems([]);
      setIsOwnerLoading(false);
    }
  }, [user, user?.role, shopId, token]);

  // Shop Owner handlers
  const handleUpdateShopProfile = async (data: Partial<Shop>) => {
    const targetId = ownerShop?.id || shopId;
    if (!targetId) return;
    try {
      setOwnerShop((prev) => (prev ? { ...prev, ...data } : prev));
      setShops((prev) => prev.map((s) => (s.id === targetId ? { ...s, ...data } : s)));
      setFirestoreShopsCache((prev) =>
        prev.map((s) => (s.id === targetId ? { ...s, ...data } : s))
      );

      await Promise.all([
        apiClient.updateShop(targetId, data, token).catch(() => null),
        firestoreService.updateShop(targetId, data).catch((fbErr) => {
          console.warn('Direct Firestore shop update notice:', fbErr);
        }),
      ]);

      await loadOwnerData();
      await loadShops();
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCreateMenuItem = async (data: any) => {
    const targetShopId = ownerShop?.id || shopId;
    if (!targetShopId) return;
    try {
      const payload = {
        ...data,
        shopId: data.shopId || targetShopId,
      };
      const created = await apiClient.createMenuItem(payload, token);
      const itemId = created?.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        await firestoreService.createMenuItem({
          ...payload,
          id: itemId,
          shopName: ownerShop?.name || created?.shopName || '',
          shopCountry: ownerShop?.country || '',
          shopRegion: ownerShop?.region || '',
          shopCity: ownerShop?.city || '',
        });
      } catch (fbErr) {
        console.warn('Direct Firestore item write notice:', fbErr);
      }
      await loadOwnerData();
      await loadMenuItems();
    } catch (err) {
      console.error('Create menu item error:', err);
    }
  };

  const handleUpdateMenuItem = async (id: string, data: any) => {
    try {
      await apiClient.updateMenuItem(id, data, token).catch(() => false);
      try {
        await firestoreService.updateMenuItem(id, data);
      } catch (fbErr) {
        console.warn('Direct Firestore item update notice:', fbErr);
      }
      await loadOwnerData();
      await loadMenuItems();
    } catch (err) {
      console.error('Update menu item error:', err);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await apiClient.deleteMenuItem(id, token).catch(() => false);
      try {
        await firestoreService.deleteMenuItem(id);
      } catch (fbErr) {
        console.warn('Direct Firestore item delete notice:', fbErr);
      }
      await loadOwnerData();
      await loadMenuItems();
    } catch (err) {
      console.error('Delete menu item error:', err);
    }
  };

  const handleAdminStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!token) return;
    try {
      await apiClient.adminUpdateStatus(id, status, token);
      await loadShops();
      await loadMenuItems();
    } catch (err) {
      console.error('Admin status update error:', err);
    }
  };

  const allKnownShops = React.useMemo(
    () => mergeUniqueShops(allBackendShopsCache, shops, firestoreShopsCache),
    [allBackendShopsCache, shops, firestoreShopsCache]
  );

  const allKnownItems = React.useMemo(
    () => mergeUniqueMenuItems(allBackendItemsCache, menuItems, firestoreItemsCache, savedItems),
    [allBackendItemsCache, menuItems, firestoreItemsCache, savedItems]
  );

  const displayedShops = React.useMemo(() => {
    const fsMap = new Map(firestoreShopsCache.map((s) => [s.id, s]));
    const merged = shops.map((s) => {
      const fs = fsMap.get(s.id);
      return fs ? { ...s, ...fs } : s;
    });
    return applyFollowStateToShops(merged, effectiveFollowedIds);
  }, [shops, firestoreShopsCache, effectiveFollowedIds]);

  const followedShopsList = React.useMemo(
    () => filterFollowedShops(allKnownShops, effectiveFollowedIds),
    [allKnownShops, effectiveFollowedIds]
  );

  const followedRowDishes = React.useMemo(
    () => filterFollowedMenuItems(allKnownItems, effectiveFollowedIds, effectiveSavedIds),
    [allKnownItems, effectiveFollowedIds, effectiveSavedIds]
  );

  const displayedMenuItems = React.useMemo(() => {
    if (currentTab === 'following') {
      return filterFollowedMenuItems(allKnownItems, effectiveFollowedIds, effectiveSavedIds, {
        menuType: selectedMenuType,
        category: selectedCategory,
        isVegetarian,
        isHalal,
        query: searchQuery,
      });
    }
    if (selectedShopId) {
      const shopMerged = mergeUniqueMenuItems(
        menuItems,
        allKnownItems.filter((m) => m.shopId === selectedShopId)
      );
      return applySaveStateToMenuItems(shopMerged, effectiveSavedIds);
    }
    return applySaveStateToMenuItems(menuItems, effectiveSavedIds);
  }, [
    currentTab,
    selectedShopId,
    allKnownItems,
    menuItems,
    effectiveFollowedIds,
    effectiveSavedIds,
    selectedMenuType,
    selectedCategory,
    isVegetarian,
    isHalal,
    searchQuery,
  ]);

  const displayedSavedItems = React.useMemo(
    () => filterSavedMenuItems(allKnownItems, effectiveSavedIds, allKnownShops),
    [allKnownItems, effectiveSavedIds, allKnownShops]
  );

  const activeDetailShop = React.useMemo(() => {
    if (!selectedShopId) return undefined;
    const found =
      displayedShops.find((s) => s.id === selectedShopId) ||
      followedShopsList.find((s) => s.id === selectedShopId) ||
      allKnownShops.find((s) => s.id === selectedShopId);
    if (!found) return undefined;
    return {
      ...found,
      isFollowed: effectiveFollowedIds.has(found.id),
    };
  }, [selectedShopId, displayedShops, followedShopsList, allKnownShops, effectiveFollowedIds]);

  // Fallback safe owner shop so the dashboard is guaranteed to be fully usable and visible
  const fallbackOwnerShop: Shop = {
    id: shopId || 'shop_01',
    ownerId: user?.id || 'usr_owner_01',
    ownerEmail: user?.email || 'mandalay@burmeal.com',
    name: user?.name ? user.name.replace(/\s*Host\s*$/i, '') : 'Mandalay Morning Teahouse',
    bio: 'Authentic Burmese culinary kitchen bringing traditional regional recipes to food lovers.',
    coverImage: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
    avatarImage: user?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=mandalay',
    status: 'APPROVED',
    cuisineType: 'Traditional Burmese Kitchen',
    locationArea: 'Downtown Heritage District',
    address: '78th Street, Between 26th & 27th',
    city: 'Mandalay',
    region: 'Mandalay Region',
    country: 'Myanmar',
    facebookUrl: 'https://facebook.com/burmeal',
    whatsappPhone: '9592001000',
    viberPhone: '9592001000',
    lineId: '@burmeal',
    phoneNumber: '+95 9 200 1000',
    isOpen: true,
    operatingHours: '7:00 AM - 8:30 PM',
    createdAt: new Date().toISOString(),
    followerCount: 28,
    itemCount: 11,
    isFollowed: false,
  };

  const resolvedOwnerShop = ownerShop || fallbackOwnerShop;

  // Strict Role Segregation: enforce shop tabs for SHOP_OWNER and reset protected tabs on logout
  useEffect(() => {
    if (user?.role === 'SHOP_OWNER') {
      const validShopTabs = ['shop_overview', 'shop_menus', 'shop_profile', 'shop_settings', 'shop_detail'];
      if (!validShopTabs.includes(currentTab)) {
        setCurrentTab('shop_overview');
      }
    } else if (!user) {
      const authOnlyTabs = ['shop_overview', 'shop_menus', 'shop_profile', 'shop_settings', 'admin', 'profile'];
      if (authOnlyTabs.includes(currentTab)) {
        setSelectedShopId(null);
        setCurrentTab('feed');
      }
    }
  }, [user, user?.role, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-20 md:pb-8">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedShopId(null);
          setCurrentTab(tab);
        }}
        onOpenAuth={(role) => {
          setAuthDefaultRole(role || 'CUSTOMER');
          setIsAuthModalOpen(true);
        }}
        hasFollowedShops={followedShopsList.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {user?.role === 'SHOP_OWNER' ? (
          isOwnerLoading && !ownerShop ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center text-xs text-stone-500 dark:text-stone-400">
              Loading your shop dashboard...
            </div>
          ) : currentTab === 'shop_detail' ? (
            <ShopProfileView
              shop={resolvedOwnerShop}
              menuItems={ownerMenuItems}
              onBack={() => {
                setSelectedShopId(null);
                setCurrentTab('shop_overview');
              }}
              onFollowToggle={handleToggleFollow}
              onToggleSave={handleToggleSave}
              onSelectItem={(it) => setSelectedItemForDetail(it)}
            />
          ) : (
            <ShopDashboard
              shop={resolvedOwnerShop}
              menuItems={ownerMenuItems}
              activeSubTab={
                (['shop_overview', 'shop_menus', 'shop_profile', 'shop_settings'].includes(currentTab)
                  ? currentTab
                  : 'shop_overview') as 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings'
              }
              onSubTabChange={(tab) => setCurrentTab(tab)}
              onVisitShop={(sId) => {
                setSelectedShopId(sId);
                setCurrentTab('shop_detail');
              }}
              onRefresh={loadOwnerData}
              onUpdateShopProfile={handleUpdateShopProfile}
              onCreateMenuItem={handleCreateMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
            />
          )
        ) : (
          <>
            {/* ================= VIEW 1: TAB 1 (HOME FEED - PUBLIC FOOD ITEMS GRID) ================= */}
            {currentTab === 'feed' && !selectedShopId && (
          <div className="space-y-4 sm:space-y-6">
            {/* Search & Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedMenuType={selectedMenuType}
              onMenuTypeChange={setSelectedMenuType}
              isVegetarian={isVegetarian}
              onVegetarianToggle={() => setIsVegetarian(!isVegetarian)}
              isHalal={isHalal}
              onHalalToggle={() => setIsHalal(!isHalal)}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Results Header with Current Region Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <span>{displayedMenuItems.length} {t.dishes} in {selectedRegionName} {selectedFlag}</span>
                {searchQuery && <span>for "{searchQuery}"</span>}
              </span>
              {(selectedMenuType !== 'ALL' || isVegetarian || isHalal || searchQuery || selectedCategory !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMenuType('ALL');
                    setIsVegetarian(false);
                    setIsHalal(false);
                    setSelectedCategory('ALL');
                  }}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>

            {/* Public Food Items Grid (AT LEAST TWO ITEMS PER ROW IN MOBILE UI!) */}
            {displayedMenuItems.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center text-xs text-stone-400 space-y-3">
                <Store className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="font-semibold text-stone-700 dark:text-stone-300">
                  {t.noDishesFound} in {selectedRegionName}
                </p>
                <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                  Try switching your location region or resetting dietary filters to explore dining spots nearby.
                </p>
                <button
                  onClick={openLocationModal}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Change Region</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {displayedMenuItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onToggleSave={handleToggleSave}
                    onSelectItem={(it) => setSelectedItemForDetail(it)}
                    onSelectShop={(sId) => {
                      setSelectedShopId(sId);
                      setCurrentTab('shop_detail');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 2: TAB 2 (DEDICATED "FOLLOW" TAB - REQUIREMENT 2) ================= */}
        {currentTab === 'following' && !selectedShopId && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                  <span>{t.navFollowing}</span>
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Followed culinary kitchens listed vertically with rotating menus and direct contacts.
                </p>
              </div>

              {/* View Switcher: Followed Kitchens vs All Followed Dishes Feed */}
              {isSignedIn && followedShopsList.length > 0 && (
                <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 self-start sm:self-auto shadow-2xs">
                  <button
                    onClick={() => setFollowingViewMode('SHOPS')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                      followingViewMode === 'SHOPS'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    <span>Followed Kitchens ({followedShopsList.length})</span>
                  </button>
                  <button
                    onClick={() => setFollowingViewMode('DISHES')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                      followingViewMode === 'DISHES'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dishes Feed ({displayedMenuItems.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* REQUIREMENT 2: Strict Inclusion of ONLY Followed Shops, Strict Exclusion of non-followed shops */}
            {!isSignedIn ? (
              <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl border border-stone-200 dark:border-stone-800 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-2">
                  Sign In to Follow Local Shops
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                  Save your favorite home kitchens and restaurants to curate your personalized culinary feed.
                </p>
                <button
                  onClick={() => {
                    setAuthDefaultRole('CUSTOMER');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95"
                >
                  {t.signIn}
                </button>
              </div>
            ) : followedShopsList.length === 0 ? (
              /* Requirement 2 Clean Empty State: If zero shops are followed, display a clean empty-state placeholder with "Discover Local Shops" CTA */
              <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl border border-stone-200 dark:border-stone-800 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-stone-900 dark:text-stone-100 mb-2">
                  {t.noFollowedShops}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed max-w-sm mx-auto">
                  Follow local artisan shops to view their daily specials, rotating menus, and direct contact numbers here in real time.
                </p>
                <button
                  onClick={() => setCurrentTab('shops')}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Discover Local Shops</span>
                </button>
              </div>
            ) : followingViewMode === 'SHOPS' ? (
              /* VERTICAL LIST OF FOLLOWED SHOPS */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    Showing {followedShopsList.length} followed food kitchen{followedShopsList.length === 1 ? '' : 's'}
                  </span>
                  <button
                    onClick={() => setCurrentTab('shops')}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Find More Kitchens</span>
                  </button>
                </div>

                <div className="flex flex-col gap-4 sm:gap-5">
                  {followedShopsList.map((fShop) => (
                    <FollowedShopRow
                      key={fShop.id}
                      shop={fShop}
                      dishes={followedRowDishes}
                      onSelectShop={(sId) => {
                        setSelectedShopId(sId);
                        setCurrentTab('shop_detail');
                      }}
                      onToggleFollow={handleToggleFollow}
                      onSelectDish={(it) => setSelectedItemForDetail(it)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* DISHES FEED VIEW */
              <>
                {/* Search/Filter Bar */}
                <FilterBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedMenuType={selectedMenuType}
                  onMenuTypeChange={setSelectedMenuType}
                  isVegetarian={isVegetarian}
                  onVegetarianToggle={() => setIsVegetarian(!isVegetarian)}
                  isHalal={isHalal}
                  onHalalToggle={() => setIsHalal(!isHalal)}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />

                {/* Grid of Dishes STRICTLY from followed shops */}
                {displayedMenuItems.length === 0 ? (
                  <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl border border-stone-200 dark:border-stone-800 p-10 text-center text-xs text-stone-400 space-y-3">
                    <p className="font-semibold text-stone-700 dark:text-stone-300">
                      No active dishes currently matching filters from your followed shops.
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                      Explore more local food kitchens across your region to expand your feed.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => setFollowingViewMode('SHOPS')}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>View Followed Kitchens</span>
                      </button>
                      <button
                        onClick={() => setCurrentTab('shops')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Discover More Shops</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {displayedMenuItems.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        onToggleSave={handleToggleSave}
                        onSelectItem={(it) => setSelectedItemForDetail(it)}
                        onSelectShop={(sId) => {
                          setSelectedShopId(sId);
                          setCurrentTab('shop_detail');
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= VIEW 3: TAB 3 (SAVED ITEMS) ================= */}
        {currentTab === 'saved' && !selectedShopId && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-600 fill-current" />
                <span>{t.navSaved}</span>
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Dishes you have bookmarked for quick ordering and review.
              </p>
            </div>

            {!isSignedIn ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 text-center max-w-md mx-auto">
                <p className="text-xs text-stone-600 dark:text-stone-300 mb-3">Please sign in to access your saved items across devices.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  {t.signIn}
                </button>
              </div>
            ) : displayedSavedItems.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center text-xs text-stone-400">
                {t.noSavedItems}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {displayedSavedItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onToggleSave={handleToggleSave}
                    onSelectItem={(it) => setSelectedItemForDetail(it)}
                    onSelectShop={(sId) => {
                      setSelectedShopId(sId);
                      setCurrentTab('shop_detail');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 4: TAB 4 (CUSTOMER PROFILE) ================= */}
        {currentTab === 'profile' && !selectedShopId && (
          <CustomerProfile
            user={user}
            followedShops={followedShopsList}
            onSelectShop={(sId) => {
              setSelectedShopId(sId);
              setCurrentTab('shop_detail');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* ================= VIEW 5: ALL SHOPS DISCOVERY ================= */}
        {currentTab === 'shops' && !selectedShopId && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100">
                  {t.navShops} in {selectedCountry} {selectedFlag}
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Explore approved culinary artisans in {selectedRegionName}, read shop stories, and follow your favorites.
                </p>
              </div>
              <button
                onClick={openLocationModal}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
              >
                Change Region ({selectedRegionName})
              </button>
            </div>

            {displayedShops.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center text-xs text-stone-400 space-y-3">
                <Store className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="font-semibold text-stone-700 dark:text-stone-300">
                  No shops registered yet in {selectedRegionName}
                </p>
                <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                  Switch your location or register your own shop to be the first kitchen featured in this area.
                </p>
                <button
                  onClick={openLocationModal}
                  className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Switch Region
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    onFollowToggle={handleToggleFollow}
                    onSelectShop={(sId) => {
                      setSelectedShopId(sId);
                      setCurrentTab('shop_detail');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 6: SHOP PROFILE VIEW (WITH DEDICATED CONTACT SECTION) ================= */}
        {(currentTab === 'shop_detail' || (selectedShopId && currentTab !== 'admin')) && activeDetailShop && (
          <ShopProfileView
            shop={activeDetailShop}
            menuItems={displayedMenuItems.filter((m) => m.shopId === activeDetailShop.id)}
            onBack={() => {
              setSelectedShopId(null);
              setCurrentTab('feed');
            }}
            onFollowToggle={handleToggleFollow}
            onToggleSave={handleToggleSave}
            onSelectItem={(it) => setSelectedItemForDetail(it)}
          />
        )}

        {/* ================= VIEW 8: ADMIN APPROVAL PANEL ================= */}
        {currentTab === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel
            shops={displayedShops}
            onUpdateStatus={handleAdminStatusUpdate}
            onRefresh={() => {
              loadShops();
              loadMenuItems();
            }}
          />
        )}

        {/* ================= VIEW 9: PLATFORM SETTINGS ================= */}
        {currentTab === 'settings' && !selectedShopId && (
          <SettingsView />
        )}
          </>
        )}
      </main>

      {/* Item Detail Modal (prominent Visit Shop Profile action, NO item contact buttons) */}
      <ItemDetailModal
        item={
          selectedItemForDetail
            ? {
                ...selectedItemForDetail,
                isSaved: effectiveSavedIds.has(selectedItemForDetail.id),
                shopCountry:
                  selectedItemForDetail.shopCountry ||
                  selectedItemForDetail.country ||
                  allKnownShops.find((s) => s.id === selectedItemForDetail.shopId)?.country,
              }
            : null
        }
        onClose={() => setSelectedItemForDetail(null)}
        onToggleSave={handleToggleSave}
        onVisitShop={(shopId) => {
          setSelectedShopId(shopId);
          setCurrentTab('shop_detail');
        }}
      />

      {/* Dual Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />

      {/* Country / Region Onboarding & Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        canDismiss={Boolean(selectedCountry)}
      />

      {/* Mobile Bottom Navigation Bar (Strict 3-Tab layout for Shop Owners, 5-Tab for Customers) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedShopId(null);
          setCurrentTab(tab);
        }}
        role={user?.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER'}
        hasFollowedShops={followedShopsList.length > 0}
      />
    </div>
  );
}
