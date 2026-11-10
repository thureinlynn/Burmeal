import React, { useState } from 'react';
import { MenuItem, MenuType, Shop } from '../types';
import { formatPrice } from '../utils/filter';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COUNTRIES, getCountryFlag, getCurrencyForCountry } from '../utils/countries';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  Save,
  Clock,
  Eye,
  Heart,
  LogOut,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Globe,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  PackageCheck,
  Users,
  ChevronRight,
  Power,
  Lock,
  Bookmark,
  Image as ImageIcon,
  User,
  Sparkles,
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
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // 4 Tabs: 'shop_overview' (Overview & Insights), 'shop_menus' (Menu Management), 'shop_profile' (Shop Profile Edit), 'shop_settings' (Shop Account / Settings)
  const [currentTab, setCurrentTab] = useState<'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings'>(
    activeSubTab || 'shop_overview'
  );

  const setTab = (tab: 'shop_overview' | 'shop_menus' | 'shop_profile' | 'shop_settings') => {
    setCurrentTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // Sync prop changes
  React.useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Tab 1 Weekly Matrix interactive filter day
  const [selectedMatrixDay, setSelectedMatrixDay] = useState<string | null>(null);

  // Tab 1 Quick Cover Image Uploader state
  const [quickCoverUrl, setQuickCoverUrl] = useState(shop.coverImage);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);
  const [coverUpdateSuccess, setCoverUpdateSuccess] = useState(false);

  const handleQuickCoverUpdate = async () => {
    if (!quickCoverUrl.trim()) return;
    setIsUpdatingCover(true);
    try {
      await onUpdateShopProfile({ coverImage: quickCoverUrl });
      setCoverUpdateSuccess(true);
      setTimeout(() => setCoverUpdateSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingCover(false);
    }
  };

  // Tab 4 Password Reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordResetFeedback, setPasswordResetFeedback] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordResetFeedback('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsResettingPassword(true);
    setTimeout(() => {
      setIsResettingPassword(false);
      setPasswordResetFeedback('Password updated successfully! Your account credentials have been secured.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordResetFeedback(''), 4000);
    }, 600);
  };

  // Shop Open / Closed status
  const [isOpen, setIsOpen] = useState<boolean>(shop.isOpen !== false);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);

  const handleToggleStoreOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    setIsTogglingOpen(true);
    try {
      await onUpdateShopProfile({ isOpen: nextState });
    } catch (err) {
      setIsOpen(!nextState);
    } finally {
      setIsTogglingOpen(false);
    }
  };

  // Sales Insights view toggle: Daily, Weekly, Monthly
  const [salesPeriod, setSalesPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  // Top selling mock metrics
  const topSellingItems = [
    { name: 'Royal Fish Mohinga', orders: 84, revenue: 546.00, rating: 4.9, category: 'Noodles & Broth' },
    { name: 'Ohn No Khao Swè', orders: 62, revenue: 434.00, rating: 4.8, category: 'Noodles & Broth' },
    { name: 'Crispy Split-Pea Fritters', orders: 48, revenue: 144.00, rating: 4.9, category: 'Salads & Snacks' },
    { name: 'Fermented Tea Leaf Salad', orders: 36, revenue: 234.00, rating: 4.7, category: 'Salads & Snacks' },
  ];

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

  // Shop Profile state (Tab 3: Page Info)
  const [shopName, setShopName] = useState(shop.name);
  const [bio, setBio] = useState(shop.bio);
  const [cuisineType, setCuisineType] = useState(shop.cuisineType);
  const [locationArea, setLocationArea] = useState(shop.locationArea);
  const [operatingHours, setOperatingHours] = useState(shop.operatingHours || '7:00 AM - 8:30 PM');
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
    setOperatingHours(shop.operatingHours || '7:00 AM - 8:30 PM');
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
    if (shop.isOpen !== undefined) {
      setIsOpen(shop.isOpen);
    }
  }, [shop]);

  const shopCountry = country || shop.country || 'Myanmar';
  const shopCurrency = getCurrencyForCountry(shopCountry);

  const openCreateModal = (presetType: MenuType = 'SPECIAL') => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setImage('/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg');
    setPrice(shopCurrency.placeholder);
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
    const initialPrice =
      shopCurrency.code === 'MMK' && item.price < 50
        ? (item.price * 1000).toString()
        : shopCurrency.code === 'JPY' && item.price < 50
        ? Math.round(item.price * 130).toString()
        : shopCurrency.code === 'KRW' && item.price < 50
        ? Math.round(item.price * 1300).toString()
        : item.price.toString();
    setPrice(initialPrice);
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
      operatingHours,
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
      isOpen,
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
      {/* Top Banner Status Bar with Live Store Open/Closed Toggle & 3 Tab Selector */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <img
            src={shop.avatarImage}
            alt={shop.name}
            className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 bg-stone-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100">{shop.name}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  shop.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : shop.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {shop.status === 'APPROVED' ? t.approved : shop.status === 'PENDING' ? t.pending : t.rejected}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {shop.cuisineType} · {shop.city || shop.locationArea} · {shop.country || 'Myanmar'}
            </p>
          </div>
        </div>

        {/* Live Shop Open / Closed Toggle Switch and 3 Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Quick Open/Closed Status Toggle */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOpen ? 'bg-emerald-500 shadow-xs shadow-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              {isOpen ? 'Shop Open' : 'Shop Closed'}
            </span>
            <button
              type="button"
              onClick={handleToggleStoreOpen}
              disabled={isTogglingOpen}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOpen ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-600'
              }`}
              title="Toggle shop open or closed for incoming orders"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  isOpen ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4 Dedicated Tabs Navigation Selector (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setTab('shop_overview')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentTab === 'shop_overview'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('shop_menus')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentTab === 'shop_menus'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>Menus</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('shop_profile')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentTab === 'shop_profile'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>Shop Info</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('shop_settings')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentTab === 'shop_settings'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: "HOME" (OVERVIEW & SALES INSIGHTS) ================= */}
      {currentTab === 'shop_overview' && (() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDayName = dayNames[new Date().getDay()];

        const dailySpecials = menuItems.filter((m) => m.menuType === 'SPECIAL');
        const weeklyItems = menuItems.filter((m) => m.menuType === 'WEEKLY');
        const regularItems = menuItems.filter((m) => m.menuType === 'PERMANENT');

        const todaysSpecial = dailySpecials.find((m) => m.specialDate === todayStr) || dailySpecials[0];

        const activeChannelsList = [
          whatsappPhone || shop.whatsappPhone,
          viberPhone || shop.viberPhone,
          lineId || shop.lineId,
          facebookUrl || shop.facebookUrl,
          phoneNumber || shop.phoneNumber,
        ].filter(Boolean);
        const activeChannelsCount = activeChannelsList.length > 0 ? activeChannelsList.length : 5;
        const todayDateBadge = `${todayStr} (${currentDayName})`;

        // Sales Metrics according to period
        const revenueAmount =
          salesPeriod === 'DAILY' ? '$185.00' : salesPeriod === 'WEEKLY' ? '$1,420.00' : '$5,840.00';
        const ordersCount = salesPeriod === 'DAILY' ? 24 : salesPeriod === 'WEEKLY' ? 186 : 728;
        const avgTicket = salesPeriod === 'DAILY' ? '$7.70' : salesPeriod === 'WEEKLY' ? '$7.63' : '$8.02';
        const growthPercentage =
          salesPeriod === 'DAILY' ? '+18.5% vs yesterday' : salesPeriod === 'WEEKLY' ? '+14.2% vs last week' : '+22.8% vs last month';

        return (
          <div className="space-y-6">
            {/* 1. Warm Orange Welcome Banner with Verified Storefront Badge & Watermark */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EA580C] via-[#E05306] to-[#C2410C] p-6 sm:p-8 text-white shadow-sm">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Storefront</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-3.5 font-display">
                  Welcome to {shop.name}
                </h1>

                <p className="text-white/95 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl font-medium">
                  Manage your multi-tier culinary offerings (Daily Specials, Weekly Rotating Menus, and Regular Master Dishes) and connect with hungry customers across your city.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => openCreateModal('SPECIAL')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs sm:text-sm hover:bg-stone-50 transition-colors shadow-xs active:scale-98 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-stone-900" />
                    <span>+ Add Today's Special</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openCreateModal('WEEKLY')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm transition-colors backdrop-blur-xs border border-white/20 active:scale-98 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>+ Add Weekly Dish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onVisitShop && onVisitShop(shop.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm transition-colors backdrop-blur-xs border border-white/20 active:scale-98 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span>View Public Storefront</span>
                  </button>
                </div>
              </div>

              {/* Watermark Storefront Icon */}
              <div className="absolute right-3 sm:right-6 -bottom-6 text-white/10 pointer-events-none select-none">
                <Store className="w-44 h-44 sm:w-56 sm:h-56 -rotate-6 transform" strokeWidth={1.5} />
              </div>
            </div>

            {/* 2. Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: ACTIVE DISHES */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                    ACTIVE DISHES
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-stone-900 dark:text-white font-display">
                    {menuItems.length}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-rose-600 font-semibold">{dailySpecials.length} daily</span>
                    <span>·</span>
                    <span className="text-amber-600 font-semibold">{weeklyItems.length} weekly</span>
                    <span>·</span>
                    <span className="text-stone-600 dark:text-stone-300 font-semibold">{regularItems.length} reg</span>
                  </div>
                </div>
              </div>

              {/* Card 2: SHOP FOLLOWERS */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                    SHOP FOLLOWERS
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-stone-900 dark:text-white font-display">
                    {shop.followerCount ?? 1}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    Engaged customers receiving updates in their Following feed
                  </p>
                </div>
              </div>

              {/* Card 3: ORDERING CHANNELS */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                    ORDERING CHANNELS
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-stone-900 dark:text-white font-display flex items-baseline">
                    <span>{activeChannelsCount}</span>
                    <span className="text-xs font-normal text-stone-500 dark:text-stone-400 ml-1.5">
                      / 5 Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      WA
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                      Viber
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300">
                      LINE
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                      FB
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: STORE HEALTH */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                    STORE HEALTH
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-stone-900 dark:text-white font-display">100%</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Excellent</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Middle Row: Today's Active Daily Special & Weekly Rotating Schedule Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Today's Active Daily Special */}
              <div className="lg:col-span-5 bg-white dark:bg-stone-850 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white font-display">
                        Today's Active Daily Special
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                      {todayDateBadge}
                    </span>
                  </div>

                  {todaysSpecial ? (
                    <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-start gap-3.5">
                      <img
                        src={todaysSpecial.image}
                        alt={todaysSpecial.title}
                        className="w-20 h-20 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-stone-700 bg-stone-100"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white uppercase tracking-wider">
                            DAILY SPECIAL
                          </span>
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate">
                            {todaysSpecial.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white mt-1 truncate">
                          {todaysSpecial.title}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {todaysSpecial.description}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="font-extrabold text-base text-amber-600 dark:text-amber-500 font-display">
                            {formatPrice(todaysSpecial.price, shopCountry)}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditModal(todaysSpecial)}
                            className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer"
                          >
                            Edit Special
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-6 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-dashed border-stone-300 dark:border-stone-700 text-center">
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        No daily special designated for today.
                      </p>
                      <button
                        type="button"
                        onClick={() => openCreateModal('SPECIAL')}
                        className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Today's Special</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400">
                    Total Daily Specials in catalog: {dailySpecials.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuFilter('SPECIAL');
                      setTab('shop_menus');
                    }}
                    className="font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Specials</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Right: Weekly Rotating Schedule Matrix */}
              <div className="lg:col-span-7 bg-white dark:bg-stone-850 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white font-display">
                        Weekly Rotating Schedule Matrix
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreateModal('WEEKLY')}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Dish</span>
                    </button>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Dishes rotated on fixed days of the week for customer predictability:
                  </p>

                  {/* 7 Day Cards Row */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-4">
                    {DAYS_OF_WEEK.map((day) => {
                      const isToday = day === currentDayName;
                      const isSelected = selectedMatrixDay === day;
                      const dayItems = weeklyItems.filter((item) =>
                        item.availableDays && item.availableDays.includes(day)
                      );
                      const hasItems = dayItems.length > 0;
                      const previewDish = dayItems[0];

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedMatrixDay(isSelected ? null : day)}
                          className={`flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[96px] ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 ring-2 ring-amber-500/30'
                              : isToday
                              ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-500/50'
                              : 'border-stone-200 dark:border-stone-750 bg-stone-50/60 dark:bg-stone-900/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <div>
                            <span className={`text-[11px] font-bold block ${isToday ? 'text-amber-700 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'}`}>
                              {day}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block tracking-tight">
                                TODAY
                              </span>
                            )}
                          </div>

                          <div className="my-1.5 flex flex-col items-center">
                            {hasItems ? (
                              <>
                                <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                                  {dayItems.length}
                                </div>
                                <span className="text-[10px] text-stone-600 dark:text-stone-300 truncate max-w-[42px] sm:max-w-[56px] block mt-1 font-medium">
                                  {previewDish.title.slice(0, 7)}...
                                </span>
                              </>
                            ) : (
                              <span className="text-stone-400 dark:text-stone-600 text-sm font-semibold my-1">
                                —
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] text-stone-400 dark:text-stone-500 font-medium">
                            {dayItems.length} dishes
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Filtered dishes highlight when a day is selected */}
                  {selectedMatrixDay && (
                    <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 dark:text-amber-200">
                          Dishes Scheduled for {selectedMatrixDay}:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedMatrixDay(null)}
                          className="text-[11px] text-amber-700 dark:text-amber-300 underline font-semibold hover:text-amber-900 cursor-pointer"
                        >
                          Clear filter
                        </button>
                      </div>
                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                        {weeklyItems
                          .filter((item) => item.availableDays && item.availableDays.includes(selectedMatrixDay))
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs bg-white dark:bg-stone-850 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-7 h-7 rounded object-cover shrink-0"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg';
                                  }}
                                />
                                <span className="font-semibold text-stone-900 dark:text-white truncate">
                                  {item.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-amber-600">
                                  {formatPrice(item.price, shopCountry)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="text-stone-500 hover:text-amber-600 p-1 cursor-pointer"
                                  title="Edit dish"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        {weeklyItems.filter((item) => item.availableDays && item.availableDays.includes(selectedMatrixDay)).length === 0 && (
                          <p className="text-xs text-stone-500 italic py-1">
                            No dishes set for this day yet. Click "+ Add Dish" above to assign one.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400">
                    Weekly dishes total: {weeklyItems.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuFilter('WEEKLY');
                      setTab('shop_menus');
                    }}
                    className="font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Weekly List</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Bottom Row: 3 Operational Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Store Location */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">Store Location</h4>
                    </div>
                    <span className="text-base">{getCountryFlag(country || shop.country)}</span>
                  </div>

                  <div className="mt-3">
                    <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                      {address || shop.address || '78th Street, Between 26th & 27th'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      {city || shop.city || 'Mandalay'}, {region || shop.region || 'Mandalay Region'}, {country || shop.country || 'Myanmar'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTab('shop_profile')}
                  className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit Address Details</span>
                  <span>→</span>
                </button>
              </div>

              {/* Card 2: Ordering Channels */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">Ordering Channels</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      Direct Contact
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    WhatsApp, Viber, and Phone allow customers to order directly with zero commission fee.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTab('shop_profile')}
                  className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Update Contact Numbers</span>
                  <span>→</span>
                </button>
              </div>

              {/* Card 3: Regular Master Dishes */}
              <div className="bg-white dark:bg-stone-850 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">Regular Master Dishes</h4>
                    </div>
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {regularItems.length} dishes
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Everyday core dishes always available to customers browsing your menu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateModal('PERMANENT')}
                  className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Add Regular Dish</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= TAB 2: "MENU MANAGEMENT" ================= */}
      {currentTab === 'shop_menus' && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setMenuFilter('ALL')}
                className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium rounded-lg text-center ${
                  menuFilter === 'ALL'
                    ? 'bg-white dark:bg-stone-700 font-semibold text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                All ({menuItems.length})
              </button>
              <button
                onClick={() => setMenuFilter('SPECIAL')}
                className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium rounded-lg text-center ${
                  menuFilter === 'SPECIAL' ? 'bg-rose-600 font-semibold text-white shadow-xs' : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Today's ({menuItems.filter((m) => m.menuType === 'SPECIAL').length})
              </button>
              <button
                onClick={() => setMenuFilter('WEEKLY')}
                className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium rounded-lg text-center ${
                  menuFilter === 'WEEKLY' ? 'bg-amber-600 font-semibold text-white shadow-xs' : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Weekly ({menuItems.filter((m) => m.menuType === 'WEEKLY').length})
              </button>
              <button
                onClick={() => setMenuFilter('PERMANENT')}
                className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium rounded-lg text-center ${
                  menuFilter === 'PERMANENT'
                    ? 'bg-stone-800 dark:bg-stone-600 font-semibold text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Master ({menuItems.filter((m) => m.menuType === 'PERMANENT').length})
              </button>
            </div>

            <button
              onClick={() => openCreateModal(menuFilter !== 'ALL' ? menuFilter : 'SPECIAL')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewDish}</span>
            </button>
          </div>

          {/* Menu Items Container */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs transition-colors">
            {/* Desktop Table View (md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Menu Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dietary</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        {t.noDishesFound} Click "{t.addNewDish}" above to add your first menu item.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 dark:bg-stone-800"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</p>
                              <p className="text-stone-500 dark:text-stone-400 text-[11px] line-clamp-1 max-w-[180px]">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                              item.menuType === 'SPECIAL'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : item.menuType === 'WEEKLY'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {item.menuType === 'SPECIAL'
                              ? "Today's Special"
                              : item.menuType === 'WEEKLY'
                              ? "Weekly Special"
                              : "Master Menu"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">{item.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {item.isVegetarian && (
                              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                Veg
                              </span>
                            )}
                            {item.isHalal && (
                              <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-medium">
                                Halal
                              </span>
                            )}
                            {!item.isVegetarian && !item.isHalal && (
                              <span className="text-stone-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                          {item.menuType === 'SPECIAL' && (
                            <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                              {item.specialDate || 'Today'}
                            </span>
                          )}
                          {item.menuType === 'WEEKLY' && (
                            <span className="text-[11px] text-amber-800 dark:text-amber-400">
                              {item.availableDays?.join(', ') || 'Weekly'}
                            </span>
                          )}
                          {item.menuType === 'PERMANENT' && (
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">{t.everyday}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                          {formatPrice(item.price, shopCountry)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
                              title="Edit dish"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteMenuItem(item.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
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

            {/* Mobile-Focused Stacked Card List (< md) */}
            <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800">
              {filteredItems.length === 0 ? (
                <div className="py-10 px-4 text-center text-stone-400 text-xs">
                  {t.noDishesFound} Tap "{t.addNewDish}" above to add your first menu item.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="p-4 space-y-3">
                    {/* Top Row: Thumbnail + Title + Price */}
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                            {item.title}
                          </h4>
                          <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 shrink-0 tabular-nums font-display">
                            {formatPrice(item.price, shopCountry)}
                          </span>
                        </div>

                        {/* Menu Type Pill & Category */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span
                            className={`font-semibold text-[10px] px-2 py-0.5 rounded ${
                              item.menuType === 'SPECIAL'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : item.menuType === 'WEEKLY'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {item.menuType === 'SPECIAL'
                              ? "Today's Special"
                              : item.menuType === 'WEEKLY'
                              ? "Weekly Special"
                              : "Master Menu"}
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata & Actions row */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100/80 dark:border-stone-800/80">
                      {/* Dietary & Schedule */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.isVegetarian && (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                            Veg
                          </span>
                        )}
                        {item.isHalal && (
                          <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-medium">
                            Halal
                          </span>
                        )}
                        {item.menuType === 'SPECIAL' && (
                          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                            {item.specialDate || 'Today'}
                          </span>
                        )}
                        {item.menuType === 'WEEKLY' && item.availableDays && item.availableDays.length > 0 && (
                          <span className="text-[11px] text-amber-800 dark:text-amber-400">
                            {item.availableDays.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMenuItem(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: "PAGE INFO" (SHOP CONFIGURATION & CONTACTS) ================= */}
      {currentTab === 'shop_profile' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs transition-colors">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 mb-1">
                  Public Storefront Configuration & Information
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Update your shop profile details, operating hours, physical address, and assigned country/region to scope your dishes to the correct customer feeds.
                </p>
              </div>

              {profileSaved && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t.shopInfoUpdated}</span>
                </div>
              )}

              {/* Basic Shop Identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cuisine Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Location Area / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationArea}
                    onChange={(e) => setLocationArea(e.target.value)}
                    placeholder="e.g. Downtown Heritage District"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Operating Hours *
                  </label>
                  <input
                    type="text"
                    required
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="e.g. 7:00 AM - 8:30 PM (Daily)"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Shop Story / Bio & Tagline
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your kitchen heritage, specialties, and preparation philosophy..."
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={avatarImage}
                    onChange={(e) => setAvatarImage(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Mandatory Country & Region Setting */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Mandatory Country & Region Assignment
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Assigned Country * (Controls regional customer feed visibility)
                    </label>
                    <div className="flex items-center gap-3">
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
                      <div className="flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs shrink-0 font-medium text-stone-700 dark:text-stone-300">
                        <span className="text-base">{getCountryFlag(country)}</span>
                        <span>{country}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Yangon, Mandalay, Bangkok"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Region / State *
                    </label>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. Yangon Region, Shan State"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Physical Street Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 78th Street, Between 26th & 27th"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Ordering Channels */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Direct Customer Contact & Ordering Channels
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      WhatsApp Number (country code included)
                    </label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="959777123456"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Viber Number
                    </label>
                    <input
                      type="text"
                      value={viberPhone}
                      onChange={(e) => setViberPhone(e.target.value)}
                      placeholder="959777123456"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      LINE ID
                    </label>
                    <input
                      type="text"
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                      placeholder="@yourshopline"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Facebook Page URL
                    </label>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number (Direct Call)
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+95 9 777 123 456"
                      className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Page Info Changes</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* ================= TAB 4: "SHOP ACCOUNT / SETTINGS" ================= */}
      {currentTab === 'shop_settings' && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <span>Shop Account & Settings</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Manage your credentials, password security, administrative review standing, and operational preferences.
            </p>
          </div>

          {/* Section 1: Admin Review Status Indicator */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs transition-colors space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {shop.status === 'APPROVED' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : shop.status === 'PENDING' ? (
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100">
                    Administrative Review Status
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Platform verification and public visibility status
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center font-bold px-3 py-1 rounded-xl text-xs uppercase tracking-wider shrink-0 ${
                  shop.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : shop.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                {shop.status === 'APPROVED' ? 'Approved & Public' : shop.status === 'PENDING' ? 'Pending Review' : 'Action Required'}
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800">
              {shop.status === 'APPROVED' ? (
                <>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">✓ Your shop is verified and live.</span> Customer feeds in <strong>{shop.country || 'Myanmar'} ({shop.city || 'Yangon'})</strong> display your daily specials, weekly highlights, and master menus with direct contact ordering enabled.
                </>
              ) : (
                <>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">⏳ Your registration is under review.</span> You can configure your menus and update profile information now. Once approved by BurMeal administrators, your dishes will automatically become discoverable to diners in {shop.country || 'Myanmar'}.
                </>
              )}
            </p>
          </div>

          {/* Section 2: Account Management & Owner Profile */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>Owner Account Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Shop Owner Name</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{user?.name || shop.name}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Registered Email</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{user?.email || 'owner@burmeal.com'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Account Role</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">Shop Owner (Culinary Partner)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Shop Identifier</span>
                <span className="font-mono text-stone-700 dark:text-stone-300">{shop.id}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Password Reset Form */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Password & Security</span>
            </h3>

            {passwordResetFeedback && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{passwordResetFeedback}</span>
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{passwordError}</p>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  {isResettingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 4: Interface & System Preferences */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>Shop Platform Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language Preference */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">Dashboard Language</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLang('en')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      lang === 'en'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/20'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => setLang('my')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      lang === 'my'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/20'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    🇲🇲 မြန်မာ
                  </button>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">Visual Appearance</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/20'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    ☀️ Light Mode
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-xs ring-1 ring-amber-500/20'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    🌙 Dark Mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Sign Out */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Sign Out of Shop Dashboard</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                End your shop management session safely. Incoming orders remain saved.
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Item Modal (Create / Edit Dish with Menu Type Selector: Today's Special, Weekly Special, Master Menu) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100 mb-1">
              {editingItem ? t.editDish : t.addNewDish}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Select one of the 3 menu classifications: Today's Special, Weekly Special, or standard Master Menu.
            </p>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Menu Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Menu Type Classification *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMenuType('SPECIAL')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      menuType === 'SPECIAL'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-300 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    Today's Special
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuType('WEEKLY')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      menuType === 'WEEKLY'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-300 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    Weekly Special
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuType('PERMANENT')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      menuType === 'PERMANENT'
                        ? 'bg-stone-800 dark:bg-stone-700 border-stone-800 dark:border-stone-600 text-white font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    Master Menu
                  </button>
                </div>
              </div>

              {menuType === 'SPECIAL' && (
                <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
                  <label className="block text-xs font-semibold text-rose-900 dark:text-rose-300 mb-1">
                    Special Feature Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={specialDate}
                    onChange={(e) => setSpecialDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-white dark:bg-stone-800 border border-rose-300 dark:border-rose-800 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none"
                  />
                </div>
              )}

              {menuType === 'WEEKLY' && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg">
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1.5">
                    Available Rotating Days
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
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Dish Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Fish Mohinga"
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                    <span>Price ({shopCurrency.symbol} {shopCurrency.code}) *</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">{shopCurrency.name}</span>
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-stone-500 dark:text-stone-400 font-bold text-xs">{shopCurrency.symbol}</span>
                    </div>
                    <input
                      type="number"
                      step={shopCurrency.step}
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={shopCurrency.placeholder}
                      className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category Tag *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
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
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, preparation style, allergen notes..."
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                />
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-400">
                  <span>Samples:</span>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg')}
                    className="text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Mohinga
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg')}
                    className="text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Tea Leaf
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg')}
                    className="text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Coconut Noodle
                  </button>
                </div>
              </div>

              {/* Dietary checkboxes */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{t.vegetarian}</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalal}
                    onChange={(e) => setIsHalal(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>{t.halal}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 rounded-lg"
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
