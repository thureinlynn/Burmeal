import React, { useState } from 'react';
import { MenuItem, MenuType, Shop } from '../types';
import { formatPrice } from '../utils/filter';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, getCountryFlag } from '../utils/countries';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  Save,
  Clock,
  Eye,
  Heart,
  Bookmark,
  LogOut,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Globe,
  Calendar,
} from 'lucide-react';

interface ShopDashboardProps {
  shop: Shop;
  menuItems: MenuItem[];
  activeSubTab?: 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings';
  onSubTabChange?: (tab: 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings') => void;
  onVisitShop?: (shopId: string) => void;
  onRefresh: () => void;
  onUpdateShopProfile: (data: Partial<Shop>) => Promise<void>;
  onCreateMenuItem: (data: any) => Promise<void>;
  onUpdateMenuItem: (id: string, data: any) => Promise<void>;
  onDeleteMenuItem: (id: string) => Promise<void>;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ShopDashboard: React.FC<ShopDashboardProps> = ({
  shop,
  menuItems,
  activeSubTab = 'shop_overview',
  onSubTabChange,
  onVisitShop,
  onRefresh,
  onUpdateShopProfile,
  onCreateMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}) => {
  const { t } = useLanguage();
  const { logout } = useAuth();

  const [currentTab, setCurrentTab] = useState<'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings'>(
    activeSubTab
  );

  const setTab = (tab: 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings') => {
    setCurrentTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // Sync prop changes
  React.useEffect(() => {
    if (activeSubTab) setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  const [menuFilter, setMenuFilter] = useState<MenuType | 'ALL'>('ALL');

  // Dish modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Noodles & Broth');
  const [menuType, setMenuType] = useState<MenuType>('SPECIAL');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [specialDate, setSpecialDate] = useState(new Date().toISOString().slice(0, 10));
  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shop Profile state
  const [shopName, setShopName] = useState(shop.name);
  const [bio, setBio] = useState(shop.bio);
  const [cuisineType, setCuisineType] = useState(shop.cuisineType);
  const [locationArea, setLocationArea] = useState(shop.locationArea);
  const [address, setAddress] = useState(shop.address || '');
  const [city, setCity] = useState(shop.city || '');
  const [region, setRegion] = useState(shop.region || '');
  const [country, setCountry] = useState(shop.country || 'Myanmar');
  const [coverImage, setCoverImage] = useState(shop.coverImage);
  const [avatarImage, setAvatarImage] = useState(shop.avatarImage);
  const [facebookUrl, setFacebookUrl] = useState(shop.facebookUrl || '');
  const [whatsappPhone, setWhatsappPhone] = useState(shop.whatsappPhone || '');
  const [viberPhone, setViberPhone] = useState(shop.viberPhone || '');
  const [lineId, setLineId] = useState(shop.lineId || '');
  const [phoneNumber, setPhoneNumber] = useState(shop.phoneNumber || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync state if shop prop updates
  React.useEffect(() => {
    setShopName(shop.name);
    setBio(shop.bio);
    setCuisineType(shop.cuisineType);
    setLocationArea(shop.locationArea);
    setAddress(shop.address || '');
    setCity(shop.city || '');
    setRegion(shop.region || '');
    setCountry(shop.country || 'Myanmar');
    setCoverImage(shop.coverImage);
    setAvatarImage(shop.avatarImage);
    setFacebookUrl(shop.facebookUrl || '');
    setWhatsappPhone(shop.whatsappPhone || '');
    setViberPhone(shop.viberPhone || '');
    setLineId(shop.lineId || '');
    setPhoneNumber(shop.phoneNumber || '');
  }, [shop]);

  const openCreateModal = (presetType: MenuType = 'SPECIAL') => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setImage('/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg');
    setPrice('');
    setCategory('Noodles & Broth');
    setMenuType(presetType);
    setIsVegetarian(false);
    setIsHalal(false);
    setSpecialDate(new Date().toISOString().slice(0, 10));
    setAvailableDays(['Mon', 'Wed', 'Fri']);
    setIsItemModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setImage(item.image);
    setPrice(item.price.toString());
    setCategory(item.category);
    setMenuType(item.menuType);
    setIsVegetarian(item.isVegetarian);
    setIsHalal(item.isHalal);
    setSpecialDate(item.specialDate || new Date().toISOString().slice(0, 10));
    setAvailableDays(item.availableDays || []);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        shopId: shop.id,
        title,
        description,
        image,
        price: parseFloat(price) || 0,
        category,
        menuType,
        isVegetarian,
        isHalal,
        specialDate: menuType === 'SPECIAL' ? specialDate : undefined,
        availableDays: menuType === 'WEEKLY' ? availableDays : undefined,
      };

      if (editingItem) {
        await onUpdateMenuItem(editingItem.id, payload);
      } else {
        await onCreateMenuItem(payload);
      }
      setIsItemModalOpen(false);
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateShopProfile({
      name: shopName,
      bio,
      cuisineType,
      locationArea,
      address,
      city,
      region,
      country,
      coverImage,
      avatarImage,
      facebookUrl,
      whatsappPhone,
      viberPhone,
      lineId,
      phoneNumber,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const filteredItems = menuItems.filter((i) => {
    if (menuFilter === 'ALL') return true;
    return i.menuType === menuFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={shop.avatarImage}
            alt={shop.name}
            className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900">{shop.name}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  shop.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : shop.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {shop.status === 'APPROVED' ? t.approved : shop.status === 'PENDING' ? t.pending : t.rejected}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {shop.cuisineType} · {shop.locationArea}
            </p>
          </div>
        </div>

        {/* 4-Tab Navigation Selector (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setTab('shop_overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'shop_overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.shopNavOverview}
          </button>
          <button
            onClick={() => setTab('shop_menus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'shop_menus'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.shopNavMenus}
          </button>
          <button
            onClick={() => setTab('shop_profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'shop_profile'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.shopNavProfile}
          </button>
          <button
            onClick={() => setTab('shop_settings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currentTab === 'shop_settings'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.shopNavSettings}
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & INSIGHTS ================= */}
      {currentTab === 'shop_overview' && (() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDayName = dayNames[new Date().getDay()];

        const dailySpecials = menuItems.filter((m) => m.menuType === 'SPECIAL');
        const weeklyItems = menuItems.filter((m) => m.menuType === 'WEEKLY');
        const regularItems = menuItems.filter((m) => m.menuType === 'PERMANENT');

        // Check if there is an active special for today or recent
        const todaysSpecial = dailySpecials.find((m) => m.specialDate === todayStr) || dailySpecials[0];
        
        // Count active contact channels
        const contactChannelsCount = [
          shop.whatsappPhone,
          shop.viberPhone,
          shop.lineId,
          shop.facebookUrl,
          shop.phoneNumber,
        ].filter(Boolean).length;

        // Health score calculation (out of 100)
        let healthScore = 20; // base registered
        if (shop.status === 'APPROVED') healthScore += 25;
        if (menuItems.length >= 3) healthScore += 20;
        else if (menuItems.length > 0) healthScore += 10;
        if (contactChannelsCount >= 2) healthScore += 20;
        else if (contactChannelsCount === 1) healthScore += 10;
        if (shop.address && shop.city) healthScore += 15;

        return (
          <div className="space-y-6">
            {/* Top Store Overview & Quick Actions Banner */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
                <Store className="w-48 h-48" />
              </div>
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold tracking-wide mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {shop.status === 'APPROVED'
                      ? 'Verified Storefront'
                      : shop.status === 'PENDING'
                      ? 'Pending Admin Verification'
                      : 'Storefront Review Needed'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight mb-2">
                  Welcome to {shop.name}
                </h2>
                <p className="text-xs sm:text-sm text-amber-100 leading-relaxed mb-5">
                  Manage your multi-tier culinary offerings (Daily Specials, Weekly Rotating Menus, and Regular Master Dishes) and connect with hungry customers across your city.
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => openCreateModal('SPECIAL')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-600" />
                    <span>+ Add Today's Special</span>
                  </button>
                  <button
                    onClick={() => openCreateModal('WEEKLY')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-xs font-bold transition-all text-white active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Add Weekly Dish</span>
                  </button>
                  {onVisitShop && (
                    <button
                      onClick={() => onVisitShop(shop.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Public Storefront</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Metric KPI Cards & Store Health */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Dishes */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{t.totalDishes}</span>
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                  {menuItems.length}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-rose-600">{dailySpecials.length} daily</span>
                  <span>·</span>
                  <span className="font-semibold text-amber-600">{weeklyItems.length} weekly</span>
                  <span>·</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{regularItems.length} reg</span>
                </div>
              </div>

              {/* Card 2: Followers */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{t.totalFollowers}</span>
                  <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                  {shop.followerCount || 0}
                </p>
                <p className="text-[11px] text-stone-400 mt-2">
                  Engaged customers receiving updates in their Following feed
                </p>
              </div>

              {/* Card 3: Direct Ordering Channels */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Ordering Channels</span>
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                  {contactChannelsCount} <span className="text-xs font-normal text-stone-400">/ 5 Active</span>
                </p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${shop.whatsappPhone ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 line-through'}`}>WA</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${shop.viberPhone ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 line-through'}`}>Viber</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${shop.lineId ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 line-through'}`}>LINE</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${shop.facebookUrl ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 line-through'}`}>FB</span>
                </div>
              </div>

              {/* Card 4: Store Health Score */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Store Health</span>
                  <div className="p-1.5 bg-sky-50 dark:bg-sky-950/40 rounded-lg text-sky-600 dark:text-sky-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                    {healthScore}%
                  </p>
                  <span className="text-xs font-semibold text-emerald-600">
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Setup'}
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Split Row: Today's Featured Special & Rotating Weekly Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Daily Special Focus */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <h3 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100">
                        Today's Active Daily Special
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-md">
                      {todayStr} ({currentDayName})
                    </span>
                  </div>

                  {todaysSpecial ? (
                    <div className="flex gap-4 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 mt-2">
                      <img
                        src={todaysSpecial.image}
                        alt={todaysSpecial.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded">
                            DAILY SPECIAL
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400">
                            {todaysSpecial.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate mt-1">
                          {todaysSpecial.title}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {todaysSpecial.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                            {formatPrice(todaysSpecial.price)}
                          </span>
                          <button
                            onClick={() => openEditModal(todaysSpecial)}
                            className="text-xs text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-semibold underline"
                          >
                            Edit Special
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl my-2">
                      <Clock className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        No Daily Special scheduled for today
                      </p>
                      <p className="text-[11px] text-stone-400 mt-1 max-w-xs mx-auto">
                        Daily specials create urgency and bring customers to your shop today!
                      </p>
                      <button
                        onClick={() => openCreateModal('SPECIAL')}
                        className="mt-3 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        + Create Today's Special Dish
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Total Daily Specials in catalog: {dailySpecials.length}</span>
                  <button
                    onClick={() => {
                      setMenuFilter('SPECIAL');
                      setTab('shop_menus');
                    }}
                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Manage Specials →
                  </button>
                </div>
              </div>

              {/* Weekly Rotating Menu Schedule Matrix */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100">
                        Weekly Rotating Schedule Matrix
                      </h3>
                    </div>
                    <button
                      onClick={() => openCreateModal('WEEKLY')}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Dish</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
                    Dishes rotated on fixed days of the week for customer predictability:
                  </p>

                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {DAYS_OF_WEEK.map((day) => {
                      const dayItems = weeklyItems.filter((m) =>
                        m.availableDays?.includes(day)
                      );
                      const isToday = day === currentDayName;
                      return (
                        <div
                          key={day}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[90px] transition-colors ${
                            isToday
                              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600'
                              : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          <div>
                            <span
                              className={`text-[11px] font-bold block ${
                                isToday
                                  ? 'text-amber-800 dark:text-amber-300'
                                  : 'text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              {day}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-bold text-amber-600 block uppercase">
                                Today
                              </span>
                            )}
                          </div>

                          <div className="my-1">
                            {dayItems.length > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center">
                                  {dayItems.length}
                                </span>
                                <span className="text-[9px] text-stone-500 dark:text-stone-400 truncate max-w-[40px]">
                                  {dayItems[0].title.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-stone-300 dark:text-stone-600 font-medium">
                                —
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] text-stone-400">
                            {dayItems.length} dishes
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Weekly dishes total: {weeklyItems.length}</span>
                  <button
                    onClick={() => {
                      setMenuFilter('WEEKLY');
                      setTab('shop_menus');
                    }}
                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    View Weekly List →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions & Store Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Location & Physical Address */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Store Location</span>
                  </div>
                  <span className="text-sm">{getCountryFlag(shop.country || 'Myanmar')}</span>
                </div>
                <p className="text-xs text-stone-800 dark:text-stone-200 font-semibold truncate">
                  {shop.address || 'No street address yet'}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {shop.city || 'Yangon'}, {shop.region || 'Yangon Region'}, {shop.country || 'Myanmar'}
                </p>
                <button
                  onClick={() => setTab('shop_profile')}
                  className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Edit Address Details →
                </button>
              </div>

              {/* Box 2: Direct Ordering Setup */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Ordering Channels</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    Direct Contact
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  WhatsApp, Viber, and Phone allow customers to order directly with zero commission fee.
                </p>
                <button
                  onClick={() => setTab('shop_profile')}
                  className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Update Contact Numbers →
                </button>
              </div>

              {/* Box 3: Master Menu Management */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                    <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                    <span>Regular Master Dishes</span>
                  </div>
                  <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">
                    {regularItems.length} dishes
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Everyday core dishes always available to customers browsing your menu.
                </p>
                <button
                  onClick={() => openCreateModal('PERMANENT')}
                  className="mt-3 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  + Add Regular Dish →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= TAB 2: 3-TIER MENU MANAGEMENT ================= */}
      {currentTab === 'shop_menus' && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setMenuFilter('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'ALL' ? 'bg-white font-semibold text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                All ({menuItems.length})
              </button>
              <button
                onClick={() => setMenuFilter('SPECIAL')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'SPECIAL' ? 'bg-rose-600 font-semibold text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                {t.dailySpecials} ({menuItems.filter((m) => m.menuType === 'SPECIAL').length})
              </button>
              <button
                onClick={() => setMenuFilter('WEEKLY')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'WEEKLY' ? 'bg-amber-600 font-semibold text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                {t.weeklyMenus} ({menuItems.filter((m) => m.menuType === 'WEEKLY').length})
              </button>
              <button
                onClick={() => setMenuFilter('PERMANENT')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'PERMANENT' ? 'bg-stone-800 font-semibold text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                {t.regularMaster} ({menuItems.filter((m) => m.menuType === 'PERMANENT').length})
              </button>
            </div>

            <button
              onClick={() => openCreateModal(menuFilter !== 'ALL' ? menuFilter : 'SPECIAL')}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewDish}</span>
            </button>
          </div>

          {/* Menu Items Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dietary</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        {t.noDishesFound} Click "{t.addNewDish}" above to add your first menu item.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-semibold text-stone-900">{item.title}</p>
                              <p className="text-stone-500 text-[11px] line-clamp-1 max-w-[180px]">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                              item.menuType === 'SPECIAL'
                                ? 'bg-rose-50 text-rose-700'
                                : item.menuType === 'WEEKLY'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {item.menuType === 'SPECIAL'
                              ? t.todaySpecial
                              : item.menuType === 'WEEKLY'
                              ? t.weeklyHighlight
                              : t.masterMenu}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-600">{item.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {item.isVegetarian && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                                Veg
                              </span>
                            )}
                            {item.isHalal && (
                              <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">
                                Halal
                              </span>
                            )}
                            {!item.isVegetarian && !item.isHalal && (
                              <span className="text-stone-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {item.menuType === 'SPECIAL' && (
                            <span className="text-[11px] text-rose-700 font-medium">
                              {item.specialDate || 'Today'}
                            </span>
                          )}
                          {item.menuType === 'WEEKLY' && (
                            <span className="text-[11px] text-amber-800">
                              {item.availableDays?.join(', ') || 'Weekly'}
                            </span>
                          )}
                          {item.menuType === 'PERMANENT' && (
                            <span className="text-[11px] text-stone-500">{t.everyday}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900 tabular-nums">
                          {formatPrice(item.price)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                              title="Edit dish"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteMenuItem(item.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                              title="Delete dish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SHOP PROFILE EDIT ================= */}
      {currentTab === 'shop_profile' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-3xl">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h2 className="text-lg font-bold font-display text-stone-900 mb-1">
              Shop Profile Details & Direct Contacts
            </h2>
            <p className="text-xs text-stone-500 mb-4">
              Update your shop bio, cover photo, and customer direct-ordering links (WhatsApp, Viber, LINE, Facebook).
            </p>

            {profileSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{t.shopInfoUpdated}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">{t.shopName}</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">{t.cuisineCategory}</label>
                <input
                  type="text"
                  required
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">{t.locationArea}</label>
                <input
                  type="text"
                  required
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Call)</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+95 9 123 456 789"
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Shop Bio / Story</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarImage}
                  onChange={(e) => setAvatarImage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {/* Address & Country Location Section */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {t.shopAddressLocation}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 78th Street, Between 31st & 32nd Street"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mandalay"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    {t.region}
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Mandalay Region"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    {t.country}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100 font-medium"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name} className="dark:bg-stone-800">
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs shrink-0 font-medium text-stone-700 dark:text-stone-300">
                      <span className="text-base">{getCountryFlag(country)}</span>
                      <span>{country}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                {t.contactChannels}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    WhatsApp Number (country code included)
                  </label>
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="959777123456"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Viber Number
                  </label>
                  <input
                    type="text"
                    value={viberPhone}
                    onChange={(e) => setViberPhone(e.target.value)}
                    placeholder="959777123456"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    LINE ID or Invite URL
                  </label>
                  <input
                    type="text"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    placeholder="@yourlineid"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 4: SHOP SETTINGS & ACCOUNT ================= */}
      {currentTab === 'shop_settings' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold font-display text-stone-900 mb-1">
              Shop Account & Platform Status
            </h2>
            <p className="text-xs text-stone-500">
              Review your registration standing, security, and sign out options.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Admin Approval Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  shop.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : shop.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {shop.status}
              </span>
            </div>
            {shop.status === 'PENDING' && (
              <p className="text-[11px] text-stone-500">
                {t.pendingApprovalMsg}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-stone-800">Sign out of Shop</p>
              <p className="text-[11px] text-stone-400">Close active shop manager session</p>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>
      )}

      {/* Item Modal (Create / Edit) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold font-display text-stone-900 mb-1">
              {editingItem ? t.editDish : t.addNewDish}
            </h2>
            <p className="text-xs text-stone-500 mb-4">
              Select one of the 3 menu classifications: Daily Special, Weekly Highlight, or Master Menu.
            </p>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Menu Section
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMenuType('SPECIAL')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      menuType === 'SPECIAL'
                        ? 'bg-rose-50 border-rose-500 text-rose-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {t.dailySpecials}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuType('WEEKLY')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      menuType === 'WEEKLY'
                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {t.weeklyMenus}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuType('PERMANENT')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      menuType === 'PERMANENT'
                        ? 'bg-stone-100 border-stone-700 text-stone-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {t.regularMaster}
                  </button>
                </div>
              </div>

              {menuType === 'SPECIAL' && (
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    {t.specialDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={specialDate}
                    onChange={(e) => setSpecialDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-rose-300 rounded-lg focus:outline-none"
                  />
                </div>
              )}

              {menuType === 'WEEKLY' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <label className="block text-xs font-semibold text-amber-900 mb-1.5">
                    {t.availabilityDays}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                          availableDays.includes(d)
                            ? 'bg-amber-600 border-amber-600 text-white font-semibold'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-amber-400'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">{t.dishTitle}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Fish Mohinga"
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t.price} ($ USD)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="6.50"
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{t.category}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  >
                    <option value="Noodles & Broth">Noodles & Broth</option>
                    <option value="Salads & Snacks">Salads & Snacks</option>
                    <option value="Breakfast Specials">Breakfast Specials</option>
                    <option value="Rice & Main Dishes">Rice & Main Dishes</option>
                    <option value="Desserts & Drinks">Desserts & Drinks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">{t.description}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, preparation style..."
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">{t.imageUrl}</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-400">
                  <span>Samples:</span>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg')}
                    className="text-amber-700 hover:underline"
                  >
                    Mohinga
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg')}
                    className="text-amber-700 hover:underline"
                  >
                    Tea Leaf
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg')}
                    className="text-amber-700 hover:underline"
                  >
                    Coconut Noodle
                  </button>
                </div>
              </div>

              {/* Dietary checkboxes */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{t.vegetarian}</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalal}
                    onChange={(e) => setIsHalal(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{t.halal}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? '...' : editingItem ? t.saveChanges : t.createDish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
