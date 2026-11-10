import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useLocation } from './context/LocationContext';
import { MenuItem, Shop, MenuType } from './types';
import { apiClient } from './services/apiClient';
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
  Calendar,
  Store,
  ArrowRight,
  TrendingUp,
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
  const [allFollowedShops, setAllFollowedShops] = useState<Shop[]>([]);
  const [followingViewMode, setFollowingViewMode] = useState<'SHOPS' | 'DISHES'>('SHOPS');
  const [savedItems, setSavedItems] = useState<MenuItem[]>([]);
  const [followedCount, setFollowedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType | 'ALL'>('ALL');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  // Load Menu Items scoped to user's selected Country & Region, with strict FOLLOWED feed logic
  const loadMenuItems = async (feedTypeOverride?: 'FOLLOWED') => {
    setIsLoading(true);
    try {
      const isFollowFeed = currentTab === 'following' || feedTypeOverride === 'FOLLOWED';
      const data = await apiClient.getMenuItems(
        {
          shopId: selectedShopId,
          menuType: selectedMenuType,
          category: selectedCategory,
          isVegetarian,
          isHalal,
          query: searchQuery.trim(),
          feedType: isFollowFeed ? 'FOLLOWED' : undefined,
          country: selectedCountry,
          regionId: selectedRegionId,
        },
        token
      );
      setMenuItems(data.items || []);
      setFollowedCount(data.followedCount || 0);
    } catch (err) {
      console.error('Failed to load menu items', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Saved Items
  const loadSavedItems = async () => {
    if (!token) {
      setSavedItems([]);
      return;
    }
    try {
      const data = await apiClient.getSavedItems(token);
      // Guarantee each saved item preserves its genuine shop country currency
      const enriched = data.map((item) => {
        const foundShop =
          shops.find((s) => s.id === item.shopId) ||
          allFollowedShops.find((s) => s.id === item.shopId);
        return {
          ...item,
          shopCountry: item.shopCountry || item.country || foundShop?.country,
          shopName: item.shopName || foundShop?.name,
        };
      });
      setSavedItems(enriched);
    } catch (err) {
      console.error('Failed to load saved items', err);
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

  const loadFollowedShops = async () => {
    if (!token) {
      setAllFollowedShops([]);
      return;
    }
    try {
      const data = await apiClient.getShops({ followedOnly: true }, token);
      setAllFollowedShops(data);
    } catch (err) {
      console.error('Failed to load followed shops', err);
    }
  };

  useEffect(() => {
    if (currentTab === 'saved') {
      loadSavedItems();
    }
  }, [currentTab, token]);

  useEffect(() => {
    if (token) {
      loadFollowedShops();
    } else {
      setAllFollowedShops([]);
    }
  }, [token, currentTab]);

  // Handle follow toggle
  const handleToggleFollow = async (targetShopId: string) => {
    if (!token) {
      setAuthDefaultRole('CUSTOMER');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await apiClient.toggleFollow(targetShopId, token);
      if (res) {
        await loadShops();
        await loadFollowedShops();
        await loadMenuItems();
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  // Handle save bookmark toggle
  const handleToggleSave = async (item: MenuItem) => {
    if (!token) {
      setAuthDefaultRole('CUSTOMER');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await apiClient.toggleSave(item.id, token);
      if (res) {
        setMenuItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isSaved: !i.isSaved } : i))
        );
        if (selectedItemForDetail && selectedItemForDetail.id === item.id) {
          setSelectedItemForDetail({
            ...selectedItemForDetail,
            isSaved: !selectedItemForDetail.isSaved,
          });
        }
        if (currentTab === 'saved') {
          loadSavedItems();
        }
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // Dedicated Owner Shop & Menu state (never filtered out by consumer region)
  const [ownerShop, setOwnerShop] = useState<Shop | null>(null);
  const [ownerMenuItems, setOwnerMenuItems] = useState<MenuItem[]>([]);
  const [, setIsOwnerLoading] = useState(false);

  const loadOwnerData = async () => {
    if (user?.role !== 'SHOP_OWNER') {
      setOwnerShop(null);
      setOwnerMenuItems([]);
      return;
    }
    setIsOwnerLoading(true);
    try {
      let targetShopId = shopId;
      if (!targetShopId && user) {
        const allShops = await apiClient.getShops(null, token);
        const myShop = allShops.find((s) => s.ownerId === user.id);
        if (myShop) targetShopId = myShop.id;
      }
      if (targetShopId) {
        const sData = await apiClient.getShop(targetShopId, token);
        if (sData) {
          setOwnerShop(sData);
        }
        const mData = await apiClient.getMenuItems({ shopId: targetShopId }, token);
        if (mData && Array.isArray(mData.items)) {
          setOwnerMenuItems(mData.items);
        }
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
    }
  }, [user, user?.role, shopId, token]);

  // Shop Owner handlers
  const handleUpdateShopProfile = async (data: Partial<Shop>) => {
    const targetId = ownerShop?.id || shopId;
    if (!targetId || !token) return;
    try {
      await apiClient.updateShop(targetId, data, token);
      await loadOwnerData();
      await loadShops();
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCreateMenuItem = async (data: any) => {
    if (!token) return;
    try {
      await apiClient.createMenuItem(data, token);
      await loadOwnerData();
      await loadMenuItems();
    } catch (err) {
      console.error('Create menu item error:', err);
    }
  };

  const handleUpdateMenuItem = async (id: string, data: any) => {
    if (!token) return;
    try {
      await apiClient.updateMenuItem(id, data, token);
      await loadOwnerData();
      await loadMenuItems();
    } catch (err) {
      console.error('Update menu item error:', err);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!token) return;
    try {
      await apiClient.deleteMenuItem(id, token);
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

  const activeDetailShop = shops.find((s) => s.id === selectedShopId) || allFollowedShops.find((s) => s.id === selectedShopId);
  const followedShopsList = allFollowedShops.length > 0 ? allFollowedShops : shops.filter((s) => (s as any).isFollowed);

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

  // Strict Role Segregation: If user is SHOP_OWNER, enforce shop dashboard tabs
  useEffect(() => {
    if (user?.role === 'SHOP_OWNER') {
      const validShopTabs = ['shop_overview', 'shop_menus', 'shop_profile', 'shop_settings', 'shop_detail'];
      if (!validShopTabs.includes(currentTab)) {
        setCurrentTab('shop_overview');
      }
    }
  }, [user, user?.role, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-20 md:pb-8">
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
          currentTab === 'shop_detail' ? (
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
                <span>{menuItems.length} {t.dishes} in {selectedRegionName} {selectedFlag}</span>
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
            {menuItems.length === 0 ? (
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
                {menuItems.map((item) => (
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
              {token && followedShopsList.length > 0 && (
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
                    <span>Dishes Feed ({menuItems.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* REQUIREMENT 2: Strict Inclusion of ONLY Followed Shops, Strict Exclusion of non-followed shops */}
            {!token ? (
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
                      dishes={menuItems}
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
                {menuItems.length === 0 ? (
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
                    {menuItems.map((item) => (
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

            {!token ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 text-center max-w-md mx-auto">
                <p className="text-xs text-stone-600 dark:text-stone-300 mb-3">Please sign in to access your saved items across devices.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  {t.signIn}
                </button>
              </div>
            ) : savedItems.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-12 text-center text-xs text-stone-400">
                {t.noSavedItems}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {savedItems.map((item) => {
                  const itemShop =
                    shops.find((s) => s.id === item.shopId) ||
                    allFollowedShops.find((s) => s.id === item.shopId);
                  const enrichedItem = {
                    ...item,
                    shopCountry: item.shopCountry || item.country || itemShop?.country,
                    shopName: item.shopName || itemShop?.name,
                  };
                  return (
                    <MenuCard
                      key={item.id}
                      item={enrichedItem}
                      onToggleSave={handleToggleSave}
                      onSelectItem={(it) => setSelectedItemForDetail({ ...it, ...enrichedItem })}
                      onSelectShop={(sId) => {
                        setSelectedShopId(sId);
                        setCurrentTab('shop_detail');
                      }}
                    />
                  );
                })}
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

            {shops.length === 0 ? (
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
                {shops.map((shop) => (
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
            menuItems={menuItems.filter((m) => m.shopId === activeDetailShop.id)}
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
            shops={shops}
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
                shopCountry:
                  selectedItemForDetail.shopCountry ||
                  selectedItemForDetail.country ||
                  shops.find((s) => s.id === selectedItemForDetail.shopId)?.country ||
                  allFollowedShops.find((s) => s.id === selectedItemForDetail.shopId)?.country,
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
