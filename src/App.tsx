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
      setSavedItems(data);
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

  useEffect(() => {
    if (currentTab === 'saved') {
      loadSavedItems();
    }
  }, [currentTab, token]);

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

  // Shop Owner handlers
  const handleUpdateShopProfile = async (data: Partial<Shop>) => {
    if (!shopId || !token) return;
    try {
      await apiClient.updateShop(shopId, data, token);
      await loadShops();
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCreateMenuItem = async (data: any) => {
    if (!token) return;
    try {
      await apiClient.createMenuItem(data, token);
      await loadMenuItems();
    } catch (err) {
      console.error('Create menu item error:', err);
    }
  };

  const handleUpdateMenuItem = async (id: string, data: any) => {
    if (!token) return;
    try {
      await apiClient.updateMenuItem(id, data, token);
      await loadMenuItems();
    } catch (err) {
      console.error('Update menu item error:', err);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!token) return;
    try {
      await apiClient.deleteMenuItem(id, token);
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

  const activeDetailShop = shops.find((s) => s.id === selectedShopId);
  const currentOwnerShop = shops.find((s) => s.id === shopId || s.ownerId === user?.id);
  const followedShopsList = shops.filter((s) => (s as any).isFollowed);

  // If user is SHOP_OWNER and currentTab is one of customer tabs or feed, switch default to shop_overview
  useEffect(() => {
    if (user?.role === 'SHOP_OWNER') {
      if (
        currentTab === 'following' ||
        currentTab === 'profile' ||
        currentTab === 'feed' ||
        currentTab === 'shops'
      ) {
        setCurrentTab('shop_overview');
      }
    }
  }, [user, user?.role]);

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
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                <span>{t.navFollowing}</span>
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Fresh updates and active menus exclusively from kitchens you follow.
              </p>
            </div>

            {/* REQUIREMENT 2: Strict Inclusion of ONLY Followed Shops, Strict Exclusion of non-followed shops */}
            {!token ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
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
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
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
            ) : (
              <>
                {/* Followed Shops Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0 mr-1">
                    Followed ({followedShopsList.length}):
                  </span>
                  {followedShopsList.map((fShop) => (
                    <button
                      key={fShop.id}
                      onClick={() => {
                        setSelectedShopId(fShop.id);
                        setCurrentTab('shop_detail');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:border-amber-500 transition-colors shrink-0 shadow-2xs"
                    >
                      <img
                        src={fShop.avatarImage}
                        alt={fShop.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{fShop.name}</span>
                    </button>
                  ))}
                </div>

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
                  <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-10 text-center text-xs text-stone-400 space-y-3">
                    <p className="font-semibold text-stone-700 dark:text-stone-300">
                      No active dishes currently matching filters from your followed shops.
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                      Explore more local food kitchens across your region to expand your feed.
                    </p>
                    <button
                      onClick={() => setCurrentTab('shops')}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Discover More Shops</span>
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
                {savedItems.map((item) => (
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

        {/* ================= VIEW 7: DEDICATED SHOP OWNER DASHBOARD (4-TAB LAYOUT) ================= */}
        {(currentTab === 'shop_overview' ||
          currentTab === 'shop_menus' ||
          currentTab === 'shop_profile' ||
          currentTab === 'shop_settings') && (
          currentOwnerShop ? (
            <ShopDashboard
              shop={currentOwnerShop}
              menuItems={menuItems.filter((m) => m.shopId === currentOwnerShop.id)}
              activeSubTab={
                currentTab as 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings'
              }
              onSubTabChange={(tab) => setCurrentTab(tab)}
              onVisitShop={(sId) => {
                setSelectedShopId(sId);
                setCurrentTab('shop_detail');
              }}
              onRefresh={() => {
                loadShops();
                loadMenuItems();
              }}
              onUpdateShopProfile={handleUpdateShopProfile}
              onCreateMenuItem={handleCreateMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
            />
          ) : user?.role === 'SHOP_OWNER' ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 text-center max-w-lg mx-auto my-8 shadow-sm">
              <Store className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100">
                Setting Up Your Shop Profile
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4 leading-relaxed">
                We are configuring your kitchen dashboard and storefront. Tap below to reload your shop catalog.
              </p>
              <button
                onClick={() => {
                  loadShops();
                  loadMenuItems();
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Refresh Shop Dashboard
              </button>
            </div>
          ) : null
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
      </main>

      {/* Item Detail Modal (prominent Visit Shop Profile action, NO item contact buttons) */}
      <ItemDetailModal
        item={selectedItemForDetail}
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
