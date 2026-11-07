import React, { useState } from 'react';
import { MenuItem, MenuType, Shop } from '../types';
import { formatPrice } from '../utils/filter';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COUNTRIES, getCountryFlag } from '../utils/countries';
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

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';

interface OrderItem {
  id: string;
  customerName: string;
  itemsSummary: string;
  total: number;
  time: string;
  type: 'Pickup' | 'Delivery' | 'Dine-in';
  status: OrderStatus;
}

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

  // Interactive Live Orders Pipeline
  const [activeOrderFilter, setActiveOrderFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'ORD-308',
      customerName: 'Kyaw Swar',
      itemsSummary: '2x Royal Fish Mohinga, 1x Tea Leaf Salad',
      total: 19.50,
      time: '12:35 PM',
      type: 'Pickup',
      status: 'PENDING',
    },
    {
      id: 'ORD-307',
      customerName: 'Ma May Thant',
      itemsSummary: '1x Ohn No Khao Swè, 1x Burmese Milk Tea',
      total: 9.50,
      time: '12:28 PM',
      type: 'Delivery',
      status: 'PENDING',
    },
    {
      id: 'ORD-306',
      customerName: 'David Lee',
      itemsSummary: '1x Shan Warm Tofu Noodles, 2x Split-Pea Fritters',
      total: 11.50,
      time: '12:15 PM',
      type: 'Dine-in',
      status: 'PREPARING',
    },
    {
      id: 'ORD-305',
      customerName: 'Ko Aung Myo',
      itemsSummary: '2x Mandalay Nan Gyi Thoke',
      total: 16.00,
      time: '12:04 PM',
      type: 'Pickup',
      status: 'PREPARING',
    },
    {
      id: 'ORD-304',
      customerName: 'Su Su Hlaing',
      itemsSummary: '1x Royal Fish Mohinga',
      total: 6.50,
      time: '11:50 AM',
      type: 'Pickup',
      status: 'READY',
    },
    {
      id: 'ORD-303',
      customerName: 'U Tin Win',
      itemsSummary: '3x Crispy Split-pea Fritters, 2x Sweet Tea',
      total: 12.00,
      time: '11:32 AM',
      type: 'Dine-in',
      status: 'READY',
    },
    {
      id: 'ORD-302',
      customerName: 'Htet Htet',
      itemsSummary: '1x Ohn No Khao Swè, 1x Fermented Tea Leaf Salad',
      total: 13.50,
      time: '11:15 AM',
      type: 'Delivery',
      status: 'COMPLETED',
    },
    {
      id: 'ORD-301',
      customerName: 'Zayar Min',
      itemsSummary: '2x Royal Fish Mohinga',
      total: 13.00,
      time: '10:45 AM',
      type: 'Pickup',
      status: 'COMPLETED',
    },
  ]);

  const advanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === 'PENDING') return { ...o, status: 'PREPARING' };
        if (o.status === 'PREPARING') return { ...o, status: 'READY' };
        if (o.status === 'READY') return { ...o, status: 'COMPLETED' };
        return o;
      })
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (activeOrderFilter === 'ALL') return true;
    return o.status === activeOrderFilter;
  });

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
          <div className="hidden md:flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setTab('shop_overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'shop_overview'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.shopNavOverview}</span>
            </button>
            <button
              onClick={() => setTab('shop_menus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'shop_menus'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{t.shopNavMenus}</span>
            </button>
            <button
              onClick={() => setTab('shop_profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'shop_profile'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.shopNavProfile}</span>
            </button>
            <button
              onClick={() => setTab('shop_settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'shop_settings'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>{t.shopNavSettings}</span>
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

        // Sales Metrics according to period
        const revenueAmount =
          salesPeriod === 'DAILY' ? '$185.00' : salesPeriod === 'WEEKLY' ? '$1,420.00' : '$5,840.00';
        const ordersCount = salesPeriod === 'DAILY' ? 24 : salesPeriod === 'WEEKLY' ? 186 : 728;
        const avgTicket = salesPeriod === 'DAILY' ? '$7.70' : salesPeriod === 'WEEKLY' ? '$7.63' : '$8.02';
        const growthPercentage =
          salesPeriod === 'DAILY' ? '+18.5% vs yesterday' : salesPeriod === 'WEEKLY' ? '+14.2% vs last week' : '+22.8% vs last month';

        return (
          <div className="space-y-6">
            {/* Real-Time Key Performance Metrics & Sales Volume */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span>Real-Time Sales & Revenue Insights</span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Live performance metrics across customer dining and takeout orders.
                  </p>
                </div>

                {/* Daily, Weekly, Monthly view toggles */}
                <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold">
                  <button
                    onClick={() => setSalesPeriod('DAILY')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      salesPeriod === 'DAILY'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setSalesPeriod('WEEKLY')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      salesPeriod === 'WEEKLY'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setSalesPeriod('MONTHLY')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      salesPeriod === 'MONTHLY'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* 5 Metric KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Metric 1: Total Revenue */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/50">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                    {revenueAmount}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {growthPercentage}
                  </span>
                </div>

                {/* Metric 2: Sales Volume */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Sales Volume</span>
                    <ShoppingBag className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                    {ordersCount} <span className="text-xs font-normal text-stone-400">orders</span>
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                    Active fulfillment
                  </span>
                </div>

                {/* Metric 3: Followers */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Followers</span>
                    <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                    {shop.followerCount || 24}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                    Feed subscribers
                  </span>
                </div>

                {/* Metric 4: Saved Item Counts */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Saved Items</span>
                    <Bookmark className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                    {menuItems.reduce((acc, m) => acc + (m.isSaved ? 1 : 0), 0) + 18}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                    Customer bookmarks
                  </span>
                </div>

                {/* Metric 5: Average Ticket */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Avg Ticket</span>
                    <PackageCheck className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold font-display text-stone-900 dark:text-stone-100 tabular-nums">
                    {avgTicket}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                    Per customer order
                  </span>
                </div>
              </div>
            </div>

            {/* Active Orders & Live Pipeline Breakdown */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Active Orders & Kitchen Pipeline</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Live queue of incoming customer requests with one-tap status advancement.
                  </p>
                </div>

                {/* Order Status Filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setActiveOrderFilter(st)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        activeOrderFilter === st
                          ? 'bg-amber-600 text-white shadow-2xs font-bold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900'
                      }`}
                    >
                      {st === 'ALL' ? 'All Orders' : st}
                      {st !== 'ALL' && (
                        <span className="ml-1 opacity-75">
                          ({orders.filter((o) => o.status === st).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-400">
                          {order.id}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            order.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : order.status === 'PREPARING'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : order.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {order.customerName}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mt-0.5">
                        {order.itemsSummary}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                        <span>{order.type} · {order.time}</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => advanceOrderStatus(order.id)}
                        className="w-full py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1"
                      >
                        <span>
                          {order.status === 'PENDING'
                            ? 'Accept & Prepare'
                            : order.status === 'PREPARING'
                            ? 'Mark as Ready'
                            : 'Complete Order'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fulfilled</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Split Row: Top Selling Dishes & Today's Special Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top-Selling Items List */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    <span>Top-Selling Menu Items</span>
                  </h3>
                  <button
                    onClick={() => setTab('shop_menus')}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    View All Dishes →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {topSellingItems.map((item, idx) => (
                    <div
                      key={item.name}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {item.category} · {item.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 tabular-nums">
                          ${item.revenue.toFixed(2)}
                        </p>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          ★ {item.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Special Spotlight & Quick Action */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between transition-colors">
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCreateModal('SPECIAL')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                    >
                      + Add Special
                    </button>
                    <button
                      onClick={() => openCreateModal('WEEKLY')}
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 rounded-lg text-xs font-bold transition-all"
                    >
                      + Add Weekly
                    </button>
                  </div>
                  {onVisitShop && (
                    <button
                      onClick={() => onVisitShop(shop.id)}
                      className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Public Storefront</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab 1: Shop Cover Image Uploader/Changer & Basic Shop Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cover Image Changer / Uploader */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100">
                      Shop Cover Banner Changer
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-400">Public store header</span>
                </div>

                {coverUpdateSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Shop cover banner updated successfully!</span>
                  </div>
                )}

                {/* Banner Preview */}
                <div className="relative h-28 sm:h-36 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
                  <img
                    src={quickCoverUrl || shop.coverImage}
                    alt="Shop Cover Banner Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                    <div className="flex items-center gap-2.5 text-white">
                      <img
                        src={shop.avatarImage}
                        alt={shop.name}
                        className="w-8 h-8 rounded-lg object-cover border border-white/60 shadow-xs"
                      />
                      <div>
                        <p className="text-xs font-bold leading-tight drop-shadow-xs">{shop.name}</p>
                        <p className="text-[10px] text-white/80">{shop.cuisineType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input & Update Button */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Cover Banner Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={quickCoverUrl}
                      onChange={(e) => setQuickCoverUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="flex-1 text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                    />
                    <button
                      type="button"
                      onClick={handleQuickCoverUpdate}
                      disabled={isUpdatingCover || !quickCoverUrl.trim()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
                    >
                      {isUpdatingCover ? 'Saving...' : 'Update Cover'}
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1.5">
                    Preset Authentic Culinary Themes:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setQuickCoverUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-amber-500 text-left text-stone-700 dark:text-stone-300 truncate"
                    >
                      🍲 Tea House & Soup
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCoverUrl('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-amber-500 text-left text-stone-700 dark:text-stone-300 truncate"
                    >
                      🥗 Artisanal Shan Kitchen
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCoverUrl('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-amber-500 text-left text-stone-700 dark:text-stone-300 truncate"
                    >
                      🍜 Burmese Noodle Stall
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCoverUrl('https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-amber-500 text-left text-stone-700 dark:text-stone-300 truncate"
                    >
                      🛕 Golden Pagoda Dining
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Shop Settings */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold font-display text-stone-900 dark:text-stone-100">
                      Basic Shop Settings
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-400">Quick Operations</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Shop Open / Closed Live Switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">
                          {isOpen ? 'Store Is Open For Orders' : 'Store Is Currently Closed'}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {isOpen ? 'Customers can view active menus and place orders' : 'Direct order links are paused'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleStoreOpen}
                      disabled={isTogglingOpen}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isOpen ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Operating Hours Quick Info */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">Daily Operating Hours</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">{operatingHours}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTab('shop_profile')}
                      className="text-amber-700 dark:text-amber-400 font-bold hover:underline shrink-0 text-xs"
                    >
                      Edit in Profile →
                    </button>
                  </div>

                  {/* Scoping Location Quick Info */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">Regional Visibility</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {getCountryFlag(country)} {country} · {city || locationArea}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Scoped
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= TAB 2: "MENU MANAGEMENT" ================= */}
      {currentTab === 'shop_menus' && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setMenuFilter('ALL')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'ALL'
                    ? 'bg-white dark:bg-stone-700 font-semibold text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                All ({menuItems.length})
              </button>
              <button
                onClick={() => setMenuFilter('SPECIAL')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'SPECIAL' ? 'bg-rose-600 font-semibold text-white shadow-xs' : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Today's Specials ({menuItems.filter((m) => m.menuType === 'SPECIAL').length})
              </button>
              <button
                onClick={() => setMenuFilter('WEEKLY')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'WEEKLY' ? 'bg-amber-600 font-semibold text-white shadow-xs' : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Weekly Specials ({menuItems.filter((m) => m.menuType === 'WEEKLY').length})
              </button>
              <button
                onClick={() => setMenuFilter('PERMANENT')}
                className={`px-3 py-1 text-xs font-medium rounded-lg ${
                  menuFilter === 'PERMANENT'
                    ? 'bg-stone-800 dark:bg-stone-600 font-semibold text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Master Menu ({menuItems.filter((m) => m.menuType === 'PERMANENT').length})
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
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs transition-colors">
            <div className="overflow-x-auto">
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
                          {formatPrice(item.price)}
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
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="6.50"
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                  />
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
