import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { MenuItem, Shop, MenuType } from './types';
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
import {
  Sparkles,
  Heart,
  Bookmark,
  Calendar,
  Store,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  const { user, token, shopId } = useAuth();
  const { t } = useLanguage();

  // Navigation State: 'feed' | 'following' | 'shops' | 'shop_detail' | 'saved' | 'profile' | 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings' | 'admin'
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
  const [feedSource, setFeedSource] = useState<'FOLLOWED' | 'FALLBACK_TRENDING' | 'DISCOVER'>('DISCOVER');
  const [followedCount, setFollowedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType | 'ALL'>('ALL');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Load Shops
  const loadShops = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/shops', { headers });
      if (res.ok) {
        const data = await res.json();
        setShops(data);
      }
    } catch (err) {
      console.error('Failed to load shops', err);
    }
  };

  // Load Menu Items
  const loadMenuItems = async (feedTypeOverride?: 'FOLLOWED') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedShopId) params.append('shopId', selectedShopId);
      if (selectedMenuType !== 'ALL') params.append('menuType', selectedMenuType);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (isVegetarian) params.append('isVegetarian', 'true');
      if (isHalal) params.append('isHalal', 'true');
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      if (currentTab === 'following' || feedTypeOverride === 'FOLLOWED') {
        params.append('feedType', 'FOLLOWED');
      }

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/menu-items?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items || []);
        setFeedSource(data.feedSource || 'DISCOVER');
        setFollowedCount(data.followedCount || 0);
      }
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
      const res = await fetch('/api/saved-items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedItems(data);
      }
    } catch (err) {
      console.error('Failed to load saved items', err);
    }
  };

  useEffect(() => {
    loadShops();
  }, [token]);

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
      const res = await fetch(`/api/shops/${targetShopId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
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
      const res = await fetch(`/api/menu-items/${item.id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
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
      await fetch(`/api/shops/${shopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      loadShops();
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCreateMenuItem = async (data: any) => {
    if (!token) return;
    await fetch('/api/menu-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    loadMenuItems();
  };

  const handleUpdateMenuItem = async (id: string, data: any) => {
    if (!token) return;
    await fetch(`/api/menu-items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    loadMenuItems();
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!token) return;
    await fetch(`/api/menu-items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadMenuItems();
  };

  const handleAdminStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!token) return;
    await fetch(`/api/admin/shops/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    loadShops();
    loadMenuItems();
  };

  const activeDetailShop = shops.find((s) => s.id === selectedShopId);
  const currentOwnerShop = shops.find((s) => s.id === shopId || s.ownerId === user?.id);
  const followedShopsList = shops.filter((s) => (s as any).isFollowed);

  // If user is SHOP_OWNER and currentTab is one of customer tabs, switch default to shop_overview
  useEffect(() => {
    if (user?.role === 'SHOP_OWNER' && (currentTab === 'following' || currentTab === 'profile')) {
      setCurrentTab('shop_overview');
    }
  }, [user]);

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

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">
                {menuItems.length} {t.dishes} {searchQuery ? `for "${searchQuery}"` : ''}
              </span>
              {(selectedMenuType !== 'ALL' || isVegetarian || isHalal || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMenuType('ALL');
                    setIsVegetarian(false);
                    setIsHalal(false);
                    setSelectedCategory('ALL');
                  }}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>

            {/* Public Food Items Grid (AT LEAST TWO ITEMS PER ROW IN MOBILE UI!) */}
            {menuItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400">
                {t.noDishesFound}
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

        {/* ================= VIEW 2: TAB 2 (FOLLOWING FEED) ================= */}
        {currentTab === 'following' && !selectedShopId && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                <span>{t.navFollowing}</span>
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Fresh updates and menus exclusively from food kitchens you follow.
              </p>
            </div>

            {/* Fallback Banner if user follows none or followed shops have no items */}
            {feedSource === 'FALLBACK_TRENDING' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <strong className="block">{t.trendingFallbackTitle}</strong>
                    <span className="text-[11px] text-amber-800">{t.trendingFallbackDesc}</span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentTab('shops')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 text-xs shadow-xs"
                >
                  Explore More Shops
                </button>
              </div>
            )}

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

            {/* Grid (At least 2 items per row in mobile UI) */}
            {menuItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400">
                {t.noFollowedShops}
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

        {/* ================= VIEW 3: TAB 3 (SAVED ITEMS) ================= */}
        {currentTab === 'saved' && !selectedShopId && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-600 fill-current" />
                <span>{t.navSaved}</span>
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Dishes you have bookmarked for quick ordering and review.
              </p>
            </div>

            {!token ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto">
                <p className="text-xs text-stone-600 mb-3">Please sign in to access your saved items across devices.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  {t.signIn}
                </button>
              </div>
            ) : savedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400">
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
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
                {t.navShops}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Explore approved culinary artisans, read shop stories, and follow your favorites.
              </p>
            </div>

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

        {/* ================= VIEW 7: SHOP OWNER DASHBOARD (4-TAB LAYOUT) ================= */}
        {(currentTab === 'shop_overview' ||
          currentTab === 'shop_menus' ||
          currentTab === 'shop_profile' ||
          currentTab === 'shop_settings') &&
          currentOwnerShop && (
            <ShopDashboard
              shop={currentOwnerShop}
              menuItems={menuItems.filter((m) => m.shopId === currentOwnerShop.id)}
              activeSubTab={
                currentTab as 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings'
              }
              onSubTabChange={(tab) => setCurrentTab(tab)}
              onRefresh={() => {
                loadShops();
                loadMenuItems();
              }}
              onUpdateShopProfile={handleUpdateShopProfile}
              onCreateMenuItem={handleCreateMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
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

      {/* Mobile 4-Tab Bottom Navigation Bar (Sticky bottom on mobile) */}
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
