import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useLocation } from './context/LocationContext';
import { MenuItem, Shop, MenuType, DailySpecialPost } from './types';
import { apiClient } from './services/apiClient';
import { firestoreService } from './services/firestoreService';
import {
  mergeUniqueIds,
  mergeUniqueShops,
  mergeUniqueMenuItems,
  isShopOpenForPublic,
  buildDisplayedShops,
  buildDisplayedMenuItems,
  filterFollowedShops,
  filterFollowedMenuItems,
  filterSavedMenuItems,
} from './utils/userDataHelpers';
import { createFeedSortSeed } from './utils/feedSortHelpers';
import { filterOutSeededMockShops } from './utils/mockCleanup';
import {
  applyDailySpecialPostUpdate,
  canCreateDailySpecialPost,
  computeDailySpecialExpiry,
  mergeUniqueDailySpecialPosts,
  partitionDailySpecialPosts,
} from './utils/dailySpecialHelpers';
import { parseShareTargetFromSearch } from './utils/shareHelpers';
import { buildNewShopForOwner } from './utils/authHelpers';
import { validateMenuItemLimit } from './utils/menuLimitHelpers';
import { COUNTRIES, getDefaultRegionNameForCountry } from './utils/countries';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FilterBar } from './components/FilterBar';
import { MenuCard } from './components/MenuCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ShopProfileView } from './components/ShopProfileView';
import { ShopDashboard } from './components/ShopDashboard';
import { ScrollLoadMoreSentinel } from './components/ScrollLoadMoreSentinel';
import { PAGE_LIMITS } from './utils/paginationHelpers';
import { useInfiniteScrollLimit } from './hooks/useInfiniteScrollLimit';
import { CustomerProfile } from './components/CustomerProfile';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ShopCard } from './components/ShopCard';
import { FollowedShopRow } from './components/FollowedShopRow';
import { SettingsView } from './components/SettingsView';
import { LocationModal } from './components/LocationModal';
import { PWAInstallBanner, OfflineIndicator } from './components/PWAInstallBanner';
import { CookieConsentPopup } from './components/CookieConsentPopup';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { LightboxImageData } from './utils/imageLightboxHelpers';
import {
  CookieConsentChoice,
  CookieConsentPreferences,
  getStoredCookieConsent,
  saveCookieConsent,
  shouldShowCookiePopup,
} from './utils/cookieConsentHelpers';
import {
  Sparkles,
  Heart,
  Bookmark,
  Store,
  MapPin,
} from 'lucide-react';

export default function App() {
  const { user, token, shopId, syncBackendSession } = useAuth();
  const { t } = useLanguage();
  const {
    selectedCountry,
    selectedRegionId,
    selectedRegionName,
    selectedFlag,
    hasChosenLocation,
    isLocationModalOpen,
    openLocationModal,
    closeLocationModal,
  } = useLocation();

  // Navigation State: 'feed' | 'following' | 'shops' | 'shop_detail' | 'saved' | 'profile' | 'shop_overview' | 'shop_menus' | 'shop_profile' | 'admin' | 'settings'
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<LightboxImageData | null>(null);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>('CUSTOMER');

  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dailySpecialPosts, setDailySpecialPosts] = useState<DailySpecialPost[]>([]);
  const [allBackendSpecialsCache, setAllBackendSpecialsCache] = useState<DailySpecialPost[]>([]);
  const [firestoreSpecialPosts, setFirestoreSpecialPosts] = useState<DailySpecialPost[]>([]);
  const [expiryClockMs, setExpiryClockMs] = useState<number>(() => Date.now());
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

  // Search & Filters ('ALL' = Weekly Highlights + Regular Menu is the default view)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType>('ALL');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [feedSortSeed, setFeedSortSeed] = useState<string>(() => createFeedSortSeed());
  const [cookieConsent, setCookieConsent] = useState<CookieConsentPreferences | null>(() => {
    if (typeof window === 'undefined') return null;
    return getStoredCookieConsent(window.localStorage);
  });

  const showCookiePopup = shouldShowCookiePopup({
    consent: cookieConsent,
    isOnboardingBlocking: isLocationModalOpen,
  });

  const handleSelectCookieConsent = (choice: CookieConsentChoice) => {
    const saved = saveCookieConsent(
      typeof window !== 'undefined' ? window.localStorage : null,
      choice,
      typeof document !== 'undefined'
        ? (cookieStr) => {
            document.cookie = cookieStr;
          }
        : undefined
    );
    setCookieConsent(saved);
  };

  const isSignedIn = Boolean(user || token);

  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiryClockMs(Date.now());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Resolve shared deep links (?item=<id> or ?shop=<id>) across all regions
  const pendingShareRef = React.useRef<{ itemId?: string; shopId?: string }>(
    typeof window !== 'undefined' ? parseShareTargetFromSearch(window.location.search) : {}
  );
  const fetchedShareCatalogRef = React.useRef(false);

  useEffect(() => {
    const target = pendingShareRef.current;
    if (!target.shopId && !target.itemId) return;

    const clearShareParams = () => {
      pendingShareRef.current = {};
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('item');
          url.searchParams.delete('shop');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        } catch {
          // ignore
        }
      }
    };

    const allShopsPool = mergeUniqueShops(shops, allBackendShopsCache, firestoreShopsCache);
    const allItemsPool = mergeUniqueMenuItems(menuItems, allBackendItemsCache, firestoreItemsCache);

    if (target.shopId) {
      const matchedShop = allShopsPool.find((s) => s.id === target.shopId);
      if (matchedShop) {
        if (isShopOpenForPublic(matchedShop) || user?.role === 'ADMIN' || matchedShop.ownerId === user?.id) {
          setSelectedShopId(matchedShop.id);
          setCurrentTab('shop_detail');
        }
        clearShareParams();
        return;
      }
    }

    if (target.itemId) {
      const matchedItem = allItemsPool.find((i) => i.id === target.itemId);
      if (matchedItem) {
        const parentShop = allShopsPool.find((s) => s.id === matchedItem.shopId);
        if (!parentShop || isShopOpenForPublic(parentShop) || user?.role === 'ADMIN' || parentShop.ownerId === user?.id) {
          setSelectedItemForDetail(matchedItem);
        }
        clearShareParams();
        return;
      }
    }

    if (!fetchedShareCatalogRef.current) {
      fetchedShareCatalogRef.current = true;
      (async () => {
        try {
          if (target.shopId) {
            const fetchedShop = await apiClient.getShop(target.shopId, token).catch(() => null);
            if (fetchedShop) {
              setAllBackendShopsCache((prev) => mergeUniqueShops(prev, [fetchedShop]));
              if (isShopOpenForPublic(fetchedShop) || user?.role === 'ADMIN' || fetchedShop.ownerId === user?.id) {
                setSelectedShopId(fetchedShop.id);
                setCurrentTab('shop_detail');
              }
              clearShareParams();
              return;
            }
          }
          if (target.itemId) {
            const res = await apiClient.getMenuItems({}, token).catch(() => null);
            if (res?.items?.length) {
              setAllBackendItemsCache((prev) => mergeUniqueMenuItems(prev, res.items));
              const hit = res.items.find((i) => i.id === target.itemId);
              if (hit) {
                setSelectedItemForDetail(hit);
                clearShareParams();
              }
            }
          }
        } catch {
          // Ignore deep-link resolution errors cleanly
        }
      })();
    }
  }, [shops, allBackendShopsCache, firestoreShopsCache, menuItems, allBackendItemsCache, firestoreItemsCache, token, user?.role, user?.id]);

  // Effective cross-device IDs (Firestore real-time UID/email source of truth + backend session fallback)
  const effectiveFollowedIds = React.useMemo(
    () => new Set(mergeUniqueIds(firestoreFollowedIds, backendFollowedIds)),
    [firestoreFollowedIds, backendFollowedIds]
  );

  const effectiveSavedIds = React.useMemo(
    () => new Set(mergeUniqueIds(firestoreSavedIds, backendSavedIds)),
    [firestoreSavedIds, backendSavedIds]
  );

  // Subscribe to global Firestore shops, menu_items, & daily_special_posts caches
  useEffect(() => {
    const unsubShops = firestoreService.subscribeShops((fsShops) => {
      setFirestoreShopsCache(fsShops);
    });
    const unsubItems = firestoreService.subscribeMenuItems((fsItems) => {
      setFirestoreItemsCache(fsItems);
    });
    const unsubSpecials = firestoreService.subscribeDailySpecialPosts((fsPosts) => {
      setFirestoreSpecialPosts(fsPosts);
    });
    return () => {
      unsubShops();
      unsubItems();
      unsubSpecials();
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
          menuType: selectedShopId ? 'ALL' : selectedMenuType,
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

  // Load active (<48h) Daily Special Facebook-style posts
  const loadDailySpecialPosts = async () => {
    try {
      const isFollowFeed = currentTab === 'following';
      const posts = await apiClient.getDailySpecialPosts(
        {
          shopId: selectedShopId,
          query: searchQuery.trim(),
          country: isFollowFeed || selectedShopId ? undefined : selectedCountry,
          regionId: isFollowFeed || selectedShopId ? undefined : selectedRegionId,
        },
        token
      );
      setDailySpecialPosts(posts);
    } catch (err) {
      console.error('Failed to load daily special posts', err);
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
      const [backendFollowed, allShops, allSpecials] = await Promise.all([
        token ? apiClient.getShops({ followedOnly: true }, token) : Promise.resolve([]),
        apiClient.getShops(null, token),
        apiClient.getDailySpecialPosts({}, token).catch(() => []),
      ]);
      setBackendFollowedIds(backendFollowed.map((s) => s.id));
      setAllBackendShopsCache(allShops);
      setAllBackendSpecialsCache(allSpecials);
    } catch (err) {
      console.error('Failed to load followed shops', err);
    }
  };

  // Auto-reload data whenever auth token, active tab, country, or region changes
  useEffect(() => {
    loadShops();
  }, [token, currentTab, selectedCountry, selectedRegionId]);

  useEffect(() => {
    loadMenuItems();
    loadDailySpecialPosts();
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
      setAllBackendSpecialsCache([]);
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
  const [ownerDailySpecialPosts, setOwnerDailySpecialPosts] = useState<DailySpecialPost[]>([]);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);

  const loadOwnerData = async () => {
    if (user?.role !== 'SHOP_OWNER') {
      setOwnerShop(null);
      setOwnerMenuItems([]);
      setOwnerDailySpecialPosts([]);
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
        resolvedShop = await apiClient.getOwnerShop(token).catch(() => null);
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
        let finalShop = resolvedShop;
        if (user.id && finalShop.ownerId !== user.id) {
          finalShop = {
            ...finalShop,
            ownerId: user.id,
            ownerEmail: finalShop.ownerEmail || user.email,
          };
          await firestoreService
            .updateShop(finalShop.id, {
              ownerId: user.id,
              ownerEmail: finalShop.ownerEmail,
            })
            .catch(() => {});
        }
        const needsSessionSync = !token?.startsWith('tok_') || shopId !== finalShop.id;
        if (needsSessionSync) {
          await syncBackendSession(user, finalShop).catch(() => {});
        }

        setOwnerShop(finalShop);
        const [fsItems, apiRes, fsSpecials, apiSpecials] = await Promise.all([
          firestoreService.getMenuItemsByShopId(finalShop.id),
          apiClient.getMenuItems({ shopId: finalShop.id }, token),
          firestoreService.getDailySpecialPostsByShopId(finalShop.id).catch(() => []),
          apiClient.getDailySpecialPosts({ shopId: finalShop.id }, token).catch(() => []),
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

        const { active: activeOwnerSpecials } = partitionDailySpecialPosts(
          mergeUniqueDailySpecialPosts(apiSpecials, fsSpecials)
        );
        setOwnerDailySpecialPosts(activeOwnerSpecials);
      } else {
        setOwnerShop(null);
        setOwnerMenuItems([]);
        setOwnerDailySpecialPosts([]);
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
      setOwnerDailySpecialPosts([]);
      setIsOwnerLoading(false);
    }
  }, [user, user?.role, shopId, token]);

  // Shop Owner handlers
  const [newOwnerShopName, setNewOwnerShopName] = useState('');
  const [newOwnerCuisine, setNewOwnerCuisine] = useState('Traditional Burmese Cuisine');
  const [newOwnerCountry, setNewOwnerCountry] = useState(selectedCountry || 'Myanmar');
  const [newOwnerRegion, setNewOwnerRegion] = useState(
    selectedRegionName && !selectedRegionName.startsWith('All ')
      ? selectedRegionName
      : getDefaultRegionNameForCountry(selectedCountry || 'Myanmar') || 'Yangon Region'
  );
  const [newOwnerCity, setNewOwnerCity] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [isCreatingOwnerShop, setIsCreatingOwnerShop] = useState(false);

  const handleCreateOwnerShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newOwnerShopName.trim()) return;
    setIsCreatingOwnerShop(true);
    try {
      const createdShop = buildNewShopForOwner(user.id, user.email || '', {
        name: user.name,
        shopName: newOwnerShopName.trim(),
        cuisineType: newOwnerCuisine.trim() || 'Traditional Burmese Cuisine',
        city: newOwnerCity.trim() || newOwnerRegion,
        region: newOwnerRegion.trim() || 'Yangon Region',
        country: newOwnerCountry || 'Myanmar',
        address: newOwnerAddress.trim(),
      });
      await firestoreService.createShop(createdShop);
      await syncBackendSession(user, createdShop).catch(() => {});
      setOwnerShop(createdShop);
      setFirestoreShopsCache((prev) => mergeUniqueShops([createdShop], prev));
      await Promise.all([loadOwnerData(), loadShops()]);
    } catch (err) {
      console.error('Create owner shop error:', err);
    } finally {
      setIsCreatingOwnerShop(false);
    }
  };

  const handleUpdateShopProfile = async (data: Partial<Shop>) => {
    const targetId = ownerShop?.id || shopId;
    if (!targetId || !ownerShop) return;
    const updatedOnlineShop: Shop = {
      ...ownerShop,
      ...data,
      id: targetId,
      ownerId: user?.id || ownerShop.ownerId,
      ownerEmail: (user?.email || ownerShop.ownerEmail || '').trim().toLowerCase(),
    };
    try {
      setOwnerShop(updatedOnlineShop);
      setShops((prev) => prev.map((s) => (s.id === targetId ? { ...s, ...data } : s)));
      setFirestoreShopsCache((prev) => {
        const exists = prev.some((s) => s.id === targetId);
        return exists
          ? prev.map((s) => (s.id === targetId ? { ...s, ...updatedOnlineShop } : s))
          : [updatedOnlineShop, ...prev];
      });

      await Promise.all([
        apiClient
          .updateShop(targetId, data, token, {
            user,
            shop: updatedOnlineShop,
            onSessionSynced: () => {
              void syncBackendSession(user, updatedOnlineShop);
            },
          })
          .catch(() => null),
        firestoreService.updateShop(targetId, updatedOnlineShop).catch((fbErr) => {
          console.warn('Direct Firestore shop update notice:', fbErr);
        }),
      ]);

      await Promise.all([loadOwnerData(), loadShops(), loadMenuItems(), loadDailySpecialPosts()]);
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCreateMenuItem = async (data: any) => {
    const targetShopId = ownerShop?.id || shopId;
    if (!targetShopId) {
      throw new Error('Your shop profile is not ready yet. Please finish creating your shop profile first.');
    }

    const shopExistingItems = ownerMenuItems.filter((m) => m.shopId === targetShopId);
    const limitCheck = validateMenuItemLimit(shopExistingItems, data.menuType);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.error);
    }

    try {
      const canonicalId =
        data.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fullPayload: MenuItem = {
        ...data,
        id: canonicalId,
        shopId: data.shopId || targetShopId,
        shopName: ownerShop?.name || data.shopName || '',
        shopCountry: ownerShop?.country || data.shopCountry || '',
        shopRegion: ownerShop?.region || data.shopRegion || '',
        shopCity: ownerShop?.city || data.shopCity || '',
        country: ownerShop?.country || data.country || '',
        createdAt: data.createdAt || new Date().toISOString(),
      };

      const targetShop = ownerShop || allKnownShops.find((s) => s.id === targetShopId) || null;
      const apiCreated = await apiClient.createMenuItem(fullPayload, token, {
        user,
        shop: targetShop,
        onSessionSynced: () => {
          void syncBackendSession(user, targetShop);
        },
      });
      const finalItem = apiCreated || fullPayload;
      await firestoreService.createMenuItem(finalItem).catch((fbErr) => {
        console.warn('Direct Firestore item write notice:', fbErr);
        return finalItem;
      });

      setOwnerMenuItems((prev) => mergeUniqueMenuItems([finalItem], prev));
      setFirestoreItemsCache((prev) => mergeUniqueMenuItems([finalItem], prev));

      await Promise.all([loadOwnerData(), loadMenuItems()]);
    } catch (err) {
      console.error('Create menu item error:', err);
      throw err;
    }
  };

  const handleUpdateMenuItem = async (id: string, data: any) => {
    const existing = ownerMenuItems.find((m) => m.id === id);
    const targetShopId = existing?.shopId || data.shopId || ownerShop?.id || shopId;
    const targetMenuType = data.menuType || existing?.menuType;

    if (targetShopId && targetMenuType) {
      const shopExistingItems = ownerMenuItems.filter((m) => m.shopId === targetShopId);
      const limitCheck = validateMenuItemLimit(shopExistingItems, targetMenuType, id);
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.error);
      }
    }

    try {
      const targetShop = ownerShop || allKnownShops.find((s) => s.id === targetShopId) || null;
      const payload = {
        ...data,
        ...(targetShopId ? { shopId: targetShopId } : {}),
        ...(targetShop?.name ? { shopName: targetShop.name } : {}),
      };
      await apiClient.updateMenuItem(id, payload, token, {
        user,
        shop: targetShop,
        onSessionSynced: () => {
          void syncBackendSession(user, targetShop);
        },
      });
      setOwnerMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...payload } : m)));
      setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...payload } : m)));
      setFirestoreItemsCache((prev) => prev.map((m) => (m.id === id ? { ...m, ...payload } : m)));

      await firestoreService.updateMenuItem(id, payload).catch((fbErr) => {
        console.warn('Direct Firestore item update notice:', fbErr);
      });
      await Promise.all([loadOwnerData(), loadMenuItems()]);
    } catch (err) {
      console.error('Update menu item error:', err);
      throw err;
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      setOwnerMenuItems((prev) => prev.filter((m) => m.id !== id));
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      setFirestoreItemsCache((prev) => prev.filter((m) => m.id !== id));

      await Promise.all([
        apiClient.deleteMenuItem(id, token).catch(() => false),
        firestoreService.deleteMenuItem(id).catch((fbErr) => {
          console.warn('Direct Firestore item delete notice:', fbErr);
        }),
      ]);
      await Promise.all([loadOwnerData(), loadMenuItems()]);
    } catch (err) {
      console.error('Delete menu item error:', err);
    }
  };

  const handleCreateDailySpecialPost = async (data: {
    title: string;
    post: string;
    image?: string;
    imageStoragePath?: string;
  }) => {
    const targetShopId = ownerShop?.id || shopId;
    if (!targetShopId) {
      throw new Error('Your shop profile is not ready yet. Please finish creating your shop profile first.');
    }

    const existingPool = mergeUniqueDailySpecialPosts(
      ownerDailySpecialPosts,
      dailySpecialPosts,
      firestoreSpecialPosts,
      allBackendSpecialsCache
    );
    if (!canCreateDailySpecialPost(existingPool, targetShopId, Date.now())) {
      throw new Error(t.dailySpecialLimitReached);
    }

    try {
      const targetShop = ownerShop || allKnownShops.find((s) => s.id === targetShopId) || null;
      const createdAt = new Date().toISOString();
      const canonicalId = `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fullPost: DailySpecialPost = {
        id: canonicalId,
        shopId: targetShopId,
        shopName: targetShop?.name || 'Local Kitchen',
        shopAvatarImage: targetShop?.profileImageUrl || targetShop?.avatarImage || '',
        shopCountry: targetShop?.country || '',
        shopRegion: targetShop?.region || '',
        shopCity: targetShop?.city || '',
        title: data.title.trim(),
        post: data.post.trim(),
        image: data.image || '',
        imageStoragePath: data.imageStoragePath || '',
        createdAt,
        expiresAt: computeDailySpecialExpiry(createdAt),
      };

      const apiCreated = await apiClient.createDailySpecialPost(fullPost, token, {
        user,
        shop: targetShop,
        onSessionSynced: () => {
          void syncBackendSession(user, targetShop);
        },
      });
      const finalPost = apiCreated || fullPost;
      await firestoreService.createDailySpecialPost(finalPost).catch((fbErr) => {
        console.warn('Direct Firestore daily special write notice:', fbErr);
        return finalPost;
      });

      setOwnerDailySpecialPosts((prev) =>
        partitionDailySpecialPosts(mergeUniqueDailySpecialPosts([finalPost], prev)).active
      );
      setDailySpecialPosts((prev) =>
        partitionDailySpecialPosts(mergeUniqueDailySpecialPosts([finalPost], prev)).active
      );
      setFirestoreSpecialPosts((prev) =>
        partitionDailySpecialPosts(mergeUniqueDailySpecialPosts([finalPost], prev)).active
      );

      await Promise.all([loadOwnerData(), loadDailySpecialPosts()]);
    } catch (err) {
      console.error('Create daily special post error:', err);
      throw err;
    }
  };

  const handleUpdateDailySpecialPost = async (
    id: string,
    data: {
      title: string;
      post: string;
      image?: string;
      imageStoragePath?: string;
    }
  ) => {
    try {
      const existingPool = mergeUniqueDailySpecialPosts(
        ownerDailySpecialPosts,
        dailySpecialPosts,
        firestoreSpecialPosts,
        allBackendSpecialsCache
      );
      const existing = existingPool.find((p) => p.id === id);
      if (!existing) return;

      const updatedPost = applyDailySpecialPostUpdate(existing, data);
      const nextImg = updatedPost.image || '';
      const nextPath = updatedPost.imageStoragePath || '';
      const oldRef = existing.imageStoragePath || existing.image || '';
      const oldImageToRemove =
        oldRef && oldRef !== nextPath && oldRef !== nextImg ? oldRef : null;

      setOwnerDailySpecialPosts((prev) =>
        prev.map((p) => (p.id === id ? applyDailySpecialPostUpdate(p, data) : p))
      );
      setDailySpecialPosts((prev) =>
        prev.map((p) => (p.id === id ? applyDailySpecialPostUpdate(p, data) : p))
      );
      setFirestoreSpecialPosts((prev) =>
        prev.map((p) => (p.id === id ? applyDailySpecialPostUpdate(p, data) : p))
      );
      setAllBackendSpecialsCache((prev) =>
        prev.map((p) => (p.id === id ? applyDailySpecialPostUpdate(p, data) : p))
      );

      const targetShop = ownerShop || allKnownShops.find((s) => s.id === existing.shopId) || null;
      const [apiUpdated] = await Promise.all([
        apiClient
          .updateDailySpecialPost(id, data, token, {
            user,
            shop: targetShop,
            onSessionSynced: () => {
              void syncBackendSession(user, targetShop);
            },
          })
          .catch(() => null),
        firestoreService
          .updateDailySpecialPost(id, updatedPost, oldImageToRemove)
          .catch((fbErr) => {
            console.warn('Direct Firestore daily special update notice:', fbErr);
            return updatedPost;
          }),
      ]);

      if (apiUpdated) {
        setOwnerDailySpecialPosts((prev) =>
          prev.map((p) => (p.id === id ? apiUpdated : p))
        );
        setDailySpecialPosts((prev) =>
          prev.map((p) => (p.id === id ? apiUpdated : p))
        );
        setFirestoreSpecialPosts((prev) =>
          prev.map((p) => (p.id === id ? apiUpdated : p))
        );
        setAllBackendSpecialsCache((prev) =>
          prev.map((p) => (p.id === id ? apiUpdated : p))
        );
      }

      await Promise.all([loadOwnerData(), loadDailySpecialPosts()]);
    } catch (err) {
      console.error('Update daily special post error:', err);
      throw err;
    }
  };

  const handleDeleteDailySpecialPost = async (id: string, imageOrPath?: string | null) => {
    try {
      setOwnerDailySpecialPosts((prev) => prev.filter((p) => p.id !== id));
      setDailySpecialPosts((prev) => prev.filter((p) => p.id !== id));
      setFirestoreSpecialPosts((prev) => prev.filter((p) => p.id !== id));
      setAllBackendSpecialsCache((prev) => prev.filter((p) => p.id !== id));

      await Promise.all([
        apiClient.deleteDailySpecialPost(id, token).catch(() => false),
        firestoreService.deleteDailySpecialPost(id, imageOrPath).catch((fbErr) => {
          console.warn('Direct Firestore daily special delete notice:', fbErr);
        }),
      ]);
      await Promise.all([loadOwnerData(), loadDailySpecialPosts()]);
    } catch (err) {
      console.error('Delete daily special post error:', err);
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

  const displayedShops = React.useMemo(
    () =>
      buildDisplayedShops(
        shops,
        firestoreShopsCache,
        effectiveFollowedIds,
        {
          country: selectedCountry,
          regionId: selectedRegionId,
        },
        allKnownItems
      ),
    [shops, firestoreShopsCache, effectiveFollowedIds, selectedCountry, selectedRegionId, allKnownItems]
  );

  const followedShopsList = React.useMemo(
    () => filterFollowedShops(allKnownShops, effectiveFollowedIds),
    [allKnownShops, effectiveFollowedIds]
  );

  const followedRowDishes = React.useMemo(
    () => filterFollowedMenuItems(allKnownItems, effectiveFollowedIds, effectiveSavedIds, undefined, allKnownShops),
    [allKnownItems, effectiveFollowedIds, effectiveSavedIds, allKnownShops]
  );

  const displayedMenuItems = React.useMemo(() => {
    if (currentTab === 'following') {
      return filterFollowedMenuItems(
        allKnownItems,
        effectiveFollowedIds,
        effectiveSavedIds,
        {
          menuType: selectedMenuType,
          category: selectedCategory,
          isVegetarian,
          isHalal,
          query: searchQuery,
        },
        allKnownShops
      );
    }
    return buildDisplayedMenuItems(menuItems, firestoreItemsCache, allKnownShops, effectiveSavedIds, {
      shopId: selectedShopId,
      country: selectedCountry,
      regionId: selectedRegionId,
      menuType: selectedMenuType,
      category: selectedCategory,
      isVegetarian,
      isHalal,
      query: searchQuery,
      followedIds: effectiveFollowedIds,
      sortSeed: !selectedShopId && currentTab === 'feed' ? feedSortSeed : undefined,
    });
  }, [
    currentTab,
    selectedShopId,
    allKnownItems,
    allKnownShops,
    menuItems,
    firestoreItemsCache,
    effectiveFollowedIds,
    effectiveSavedIds,
    selectedCountry,
    selectedRegionId,
    selectedMenuType,
    selectedCategory,
    isVegetarian,
    isHalal,
    searchQuery,
    feedSortSeed,
  ]);

  const allKnownDailySpecialPosts = React.useMemo(() => {
    const shopMap = new Map(allKnownShops.map((s) => [s.id, s]));
    return partitionDailySpecialPosts(
      mergeUniqueDailySpecialPosts(
        allBackendSpecialsCache,
        dailySpecialPosts,
        firestoreSpecialPosts,
        ownerDailySpecialPosts
      ),
      expiryClockMs
    ).active.filter((post) => {
      const shop = shopMap.get(post.shopId);
      return !shop || isShopOpenForPublic(shop);
    });
  }, [
    allKnownShops,
    allBackendSpecialsCache,
    dailySpecialPosts,
    firestoreSpecialPosts,
    ownerDailySpecialPosts,
    expiryClockMs,
  ]);

  const displayedSavedItems = React.useMemo(
    () => filterSavedMenuItems(allKnownItems, effectiveSavedIds, allKnownShops),
    [allKnownItems, effectiveSavedIds, allKnownShops]
  );

  // Scroll-triggered incremental pagination:
  // - All Menu / Weekly Highlights & Regular Menu: 14 initially + 14 per scroll
  // - Shops, Saved, Followed Shops: 10 initially + 10 per scroll
  const isConsumerView = user?.role !== 'SHOP_OWNER' && !selectedShopId;

  const paginatedHomeDishes = useInfiniteScrollLimit(
    displayedMenuItems,
    PAGE_LIMITS.WEEKLY_AND_MASTER,
    `feed:${selectedMenuType}:${selectedCategory}:${isVegetarian}:${isHalal}:${selectedCountry}:${selectedRegionId}:${searchQuery}:${feedSortSeed}`,
    isConsumerView && currentTab === 'feed'
  );

  const paginatedFollowedShops = useInfiniteScrollLimit(
    followedShopsList,
    PAGE_LIMITS.FOLLOWED_SHOPS,
    `following:SHOPS:${user?.id || 'anon'}`,
    isConsumerView && currentTab === 'following' && followingViewMode === 'SHOPS'
  );

  const paginatedFollowingDishes = useInfiniteScrollLimit(
    displayedMenuItems,
    PAGE_LIMITS.WEEKLY_AND_MASTER,
    `following:${selectedMenuType}:${selectedCategory}:${isVegetarian}:${isHalal}:${searchQuery}:${user?.id || 'anon'}`,
    isConsumerView && currentTab === 'following' && followingViewMode === 'DISHES'
  );

  const paginatedSavedItems = useInfiniteScrollLimit(
    displayedSavedItems,
    PAGE_LIMITS.SAVED_ITEMS,
    `saved:${user?.id || 'anon'}`,
    isConsumerView && currentTab === 'saved'
  );

  const paginatedShops = useInfiniteScrollLimit(
    displayedShops,
    PAGE_LIMITS.SHOPS,
    `shops:${selectedCountry}:${selectedRegionId}`,
    isConsumerView && currentTab === 'shops'
  );

  const activeDetailShop = React.useMemo(() => {
    if (!selectedShopId) return undefined;
    const found =
      displayedShops.find((s) => s.id === selectedShopId) ||
      followedShopsList.find((s) => s.id === selectedShopId) ||
      allKnownShops.find((s) => s.id === selectedShopId);
    if (!found) return undefined;
    if (!isShopOpenForPublic(found) && user?.role !== 'ADMIN' && found.ownerId !== user?.id) {
      return undefined;
    }
    return {
      ...found,
      isFollowed: effectiveFollowedIds.has(found.id),
    };
  }, [selectedShopId, displayedShops, followedShopsList, allKnownShops, effectiveFollowedIds, user?.role, user?.id]);

  // If a customer is viewing a shop/item that gets closed by the owner in real time, leave the closed view cleanly
  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SHOP_OWNER') return;
    if (selectedShopId) {
      const targetShop = allKnownShops.find((s) => s.id === selectedShopId);
      if (targetShop && !isShopOpenForPublic(targetShop)) {
        setSelectedShopId(null);
        if (currentTab === 'shop_detail') {
          setCurrentTab('feed');
        }
      }
    }
    if (selectedItemForDetail) {
      const itemShop = allKnownShops.find((s) => s.id === selectedItemForDetail.shopId);
      if (itemShop && !isShopOpenForPublic(itemShop)) {
        setSelectedItemForDetail(null);
      }
    }
  }, [allKnownShops, selectedShopId, selectedItemForDetail, currentTab, user?.role]);

  // Real owner shop resolved from Firestore / SQLite (never falls back to mock shop data)

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

  const hasNavigatedRef = useRef(false);

  const prevUserIdRef = useRef<string | undefined>(user?.id);
  useEffect(() => {
    if (prevUserIdRef.current !== user?.id) {
      prevUserIdRef.current = user?.id;
      setFeedSortSeed(createFeedSortSeed());
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [selectedShopId, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-20 md:pb-8">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 dark:bg-amber-950/90 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 dark:text-amber-100 hover:text-amber-800 dark:hover:text-amber-300"
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
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          if (tab === 'feed') {
            setFeedSortSeed(createFeedSortSeed());
          }
          setSelectedShopId(null);
          setCurrentTab(tab);
        }}
        onOpenAuth={(role) => {
          setAuthDefaultRole(role || 'CUSTOMER');
          setIsAuthModalOpen(true);
        }}
        hasFollowedShops={followedShopsList.length > 0}
      />

      <PWAInstallBanner isBlockedByOtherModal={isLocationModalOpen || showCookiePopup} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {user?.role === 'SHOP_OWNER' ? (
          isOwnerLoading && !ownerShop ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center text-xs text-stone-500 dark:text-stone-400">
              Loading your shop dashboard...
            </div>
          ) : !ownerShop ? (
            <div className="max-w-xl mx-auto bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold font-display text-stone-900 dark:text-stone-100">
                    Set Up Your Real Shop Profile
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Create your live storefront to start publishing real dishes for customers.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateOwnerShop} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwnerShopName}
                    onChange={(e) => setNewOwnerShopName(e.target.value)}
                    placeholder="e.g. Yangon Home Kitchen"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Cuisine Style *
                    </label>
                    <input
                      type="text"
                      required
                      value={newOwnerCuisine}
                      onChange={(e) => setNewOwnerCuisine(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Country *
                    </label>
                    <select
                      value={newOwnerCountry}
                      onChange={(e) => {
                        const next = e.target.value;
                        setNewOwnerCountry(next);
                        setNewOwnerRegion(getDefaultRegionNameForCountry(next) || next);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={newOwnerCity}
                      onChange={(e) => setNewOwnerCity(e.target.value)}
                      placeholder="e.g. Yangon, Indianapolis"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={newOwnerRegion}
                      onChange={(e) => setNewOwnerRegion(e.target.value)}
                      placeholder="e.g. Yangon Region"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    placeholder="Kitchen street address or neighborhood"
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingOwnerShop}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingOwnerShop ? 'Creating Storefront...' : 'Create Storefront & Open Dashboard'}
                </button>
              </form>
            </div>
          ) : currentTab === 'shop_detail' ? (
            <ShopProfileView
              shop={ownerShop}
              menuItems={ownerMenuItems}
              dailySpecialPosts={ownerDailySpecialPosts}
              onBack={() => {
                setSelectedShopId(null);
                setCurrentTab('shop_overview');
              }}
              onFollowToggle={handleToggleFollow}
              onToggleSave={handleToggleSave}
              onSelectItem={(it) => setSelectedItemForDetail(it)}
              onViewImage={setLightboxImage}
            />
          ) : (
            <ShopDashboard
              shop={ownerShop}
              menuItems={ownerMenuItems}
              dailySpecialPosts={ownerDailySpecialPosts}
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
              onCreateDailySpecialPost={handleCreateDailySpecialPost}
              onUpdateDailySpecialPost={handleUpdateDailySpecialPost}
              onDeleteDailySpecialPost={handleDeleteDailySpecialPost}
              onViewImage={setLightboxImage}
            />
          )
        ) : (
          <>
            {(currentTab === 'shop_detail' || (selectedShopId && currentTab !== 'admin')) && activeDetailShop ? (
              /* ================= VIEW 6: SHOP PROFILE VIEW (WITH DEDICATED CONTACT SECTION) ================= */
              <ShopProfileView
                shop={activeDetailShop}
                menuItems={buildDisplayedMenuItems(
                  menuItems,
                  mergeUniqueMenuItems(firestoreItemsCache, allBackendItemsCache),
                  allKnownShops,
                  effectiveSavedIds,
                  { shopId: activeDetailShop.id }
                )}
                dailySpecialPosts={allKnownDailySpecialPosts.filter((p) => p.shopId === activeDetailShop.id)}
                onBack={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                  setSelectedShopId(null);
                  setCurrentTab('feed');
                }}
                onFollowToggle={handleToggleFollow}
                onToggleSave={handleToggleSave}
                onSelectItem={(it) => setSelectedItemForDetail(it)}
                onViewImage={setLightboxImage}
              />
            ) : (
              <div
                key={currentTab}
                data-testid={`tab-view-${currentTab}`}
                className="animate-tab-enter"
              >
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
                <span>
                  {displayedMenuItems.length} {t.dishes} in {selectedRegionName} {selectedFlag}
                </span>
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
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>

            {displayedMenuItems.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-10 sm:p-12 text-center text-xs text-stone-400 space-y-3">
                <Store className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="font-semibold text-sm text-stone-700 dark:text-stone-300">
                  {selectedRegionName} — {t.noDishesFound}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  Only real kitchens and dishes published by shop owners appear here. Switch regions to explore other areas or register your own kitchen.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={openLocationModal}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Change Region</span>
                  </button>
                  {!isSignedIn && (
                    <button
                      onClick={() => {
                        setAuthDefaultRole('SHOP_OWNER');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200 dark:border-stone-700 transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>Register Your Kitchen</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {paginatedHomeDishes.visibleItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onToggleSave={handleToggleSave}
                      onSelectItem={(it) => setSelectedItemForDetail(it)}
                      onSelectShop={(sId) => {
                        setSelectedShopId(sId);
                        setCurrentTab('shop_detail');
                      }}
                      onViewImage={setLightboxImage}
                    />
                  ))}
                </div>
                <ScrollLoadMoreSentinel
                  sentinelRef={paginatedHomeDishes.sentinelRef}
                  visibleCount={paginatedHomeDishes.visibleCount}
                  totalCount={paginatedHomeDishes.totalCount}
                  pageSize={PAGE_LIMITS.WEEKLY_AND_MASTER}
                  hasMore={paginatedHomeDishes.hasMore}
                  onLoadMore={paginatedHomeDishes.loadMore}
                  itemLabel="dishes"
                />
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
                <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700 self-start sm:self-auto shadow-2xs">
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
                    <span>
                      Dishes Feed ({displayedMenuItems.length})
                    </span>
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
                  {paginatedFollowedShops.visibleItems.map((fShop) => (
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
                      onViewImage={setLightboxImage}
                    />
                  ))}
                  <ScrollLoadMoreSentinel
                    sentinelRef={paginatedFollowedShops.sentinelRef}
                    visibleCount={paginatedFollowedShops.visibleCount}
                    totalCount={paginatedFollowedShops.totalCount}
                    pageSize={PAGE_LIMITS.FOLLOWED_SHOPS}
                    hasMore={paginatedFollowedShops.hasMore}
                    onLoadMore={paginatedFollowedShops.loadMore}
                    itemLabel="shops"
                  />
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                      {paginatedFollowingDishes.visibleItems.map((item) => (
                        <MenuCard
                          key={item.id}
                          item={item}
                          onToggleSave={handleToggleSave}
                          onSelectItem={(it) => setSelectedItemForDetail(it)}
                          onSelectShop={(sId) => {
                            setSelectedShopId(sId);
                            setCurrentTab('shop_detail');
                          }}
                          onViewImage={setLightboxImage}
                        />
                      ))}
                    </div>
                    <ScrollLoadMoreSentinel
                      sentinelRef={paginatedFollowingDishes.sentinelRef}
                      visibleCount={paginatedFollowingDishes.visibleCount}
                      totalCount={paginatedFollowingDishes.totalCount}
                      pageSize={PAGE_LIMITS.WEEKLY_AND_MASTER}
                      hasMore={paginatedFollowingDishes.hasMore}
                      onLoadMore={paginatedFollowingDishes.loadMore}
                      itemLabel="dishes"
                    />
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {paginatedSavedItems.visibleItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onToggleSave={handleToggleSave}
                      onSelectItem={(it) => setSelectedItemForDetail(it)}
                      onSelectShop={(sId) => {
                        setSelectedShopId(sId);
                        setCurrentTab('shop_detail');
                      }}
                      onViewImage={setLightboxImage}
                    />
                  ))}
                </div>
                <ScrollLoadMoreSentinel
                  sentinelRef={paginatedSavedItems.sentinelRef}
                  visibleCount={paginatedSavedItems.visibleCount}
                  totalCount={paginatedSavedItems.totalCount}
                  pageSize={PAGE_LIMITS.SAVED_ITEMS}
                  hasMore={paginatedSavedItems.hasMore}
                  onLoadMore={paginatedSavedItems.loadMore}
                  itemLabel="saved items"
                />
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
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-10 sm:p-12 text-center text-xs text-stone-400 space-y-3">
                <Store className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="font-semibold text-sm text-stone-700 dark:text-stone-300">
                  No shops registered yet in {selectedRegionName}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  Switch your location or register your own shop to be the first kitchen featured in this area.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={openLocationModal}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Switch Region</span>
                  </button>
                  {!isSignedIn && (
                    <button
                      onClick={() => {
                        setAuthDefaultRole('SHOP_OWNER');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200 dark:border-stone-700 transition-transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>Register Your Kitchen</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedShops.visibleItems.map((shop) => (
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
                <ScrollLoadMoreSentinel
                  sentinelRef={paginatedShops.sentinelRef}
                  visibleCount={paginatedShops.visibleCount}
                  totalCount={paginatedShops.totalCount}
                  pageSize={PAGE_LIMITS.SHOPS}
                  hasMore={paginatedShops.hasMore}
                  onLoadMore={paginatedShops.loadMore}
                  itemLabel="shops"
                />
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 8: ADMIN APPROVAL PANEL ================= */}
        {currentTab === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel
            shops={filterOutSeededMockShops(allKnownShops)}
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
              </div>
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
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          setSelectedShopId(shopId);
          setCurrentTab('shop_detail');
        }}
        onViewImage={setLightboxImage}
      />

      <ImageLightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
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
        canDismiss={hasChosenLocation}
        isFirstTime={!hasChosenLocation}
      />

      <CookieConsentPopup
        isOpen={showCookiePopup}
        onSelectConsent={handleSelectCookieConsent}
      />

      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar (Strict 3-Tab layout for Shop Owners, 5-Tab for Customers) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          if (tab === 'feed') {
            setFeedSortSeed(createFeedSortSeed());
          }
          setSelectedShopId(null);
          setCurrentTab(tab);
        }}
        role={user?.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER'}
        hasFollowedShops={followedShopsList.length > 0}
      />
    </div>
  );
}
