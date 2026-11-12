import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  UtensilsCrossed,
  ShieldAlert,
  Store,
  Heart,
  Bookmark,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (role?: 'CUSTOMER' | 'SHOP_OWNER') => void;
  hasFollowedShops?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  hasFollowedShops,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { selectedCountry, selectedRegionName, selectedFlag, openLocationModal } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/65 dark:bg-stone-950/65 backdrop-blur-2xl backdrop-saturate-200 border-b border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Liquid Glass Prismatic Specular Top Sheen */}
        <div className="absolute inset-x-0 -top-px h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-500/20 dark:via-amber-400/10 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between gap-2 sm:gap-3 h-16">
          {/* Zone 1: Brand Wordmark + Location Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => onSelectTab(user?.role === 'SHOP_OWNER' ? 'shop_overview' : 'feed')}
              className="flex items-center gap-2 text-stone-900 dark:text-stone-100 group focus:outline-none shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_seoyymseoyymseoy_d7564f40.png"
                  alt="BurMeal Sacred Lacquer Hsun-ok Stupa Logo"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight font-display text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0">
                {t.brandName}
              </span>
            </button>

            {/* Region & Location Selector Button - Only for Customers/Public, Hidden for Shop Owners */}
            {user?.role !== 'SHOP_OWNER' && (
              <button
                onClick={openLocationModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/60 dark:bg-stone-800/60 backdrop-blur-md hover:bg-white/80 dark:hover:bg-stone-800/80 border border-white/60 dark:border-stone-700/60 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-all shadow-2xs active:scale-95 hover:border-amber-400/50"
                title="Change your dining country and region"
              >
                <span className="text-sm shrink-0">{selectedFlag}</span>
                <span className="hidden sm:inline max-w-[130px] truncate">{selectedRegionName}</span>
                <span className="sm:hidden font-bold">{selectedCountry}</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              </button>
            )}
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">
            {user?.role !== 'SHOP_OWNER' && (
              <>
                <button
                  onClick={() => onSelectTab('feed')}
                  className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'feed' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  {t.navFeed}
                </button>
                <button
                  onClick={() => onSelectTab('following')}
                  className={`flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'following' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.navFollowing}</span>
                  {hasFollowedShops && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5"></span>
                  )}
                </button>
                <button
                  onClick={() => onSelectTab('shops')}
                  className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'shops' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  {t.navShops}
                </button>
                <button
                  onClick={() => onSelectTab('saved')}
                  className={`flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'saved' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{t.navSaved}</span>
                </button>
                {user && (
                  <button
                    onClick={() => onSelectTab('profile')}
                    className={`flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                      currentTab === 'profile' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.navProfile}</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectTab('settings')}
                  className={`flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'settings' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>{t.navSettings}</span>
                </button>
              </>
            )}

            {user?.role === 'SHOP_OWNER' && (
              <>
                <button
                  onClick={() => onSelectTab('shop_overview')}
                  className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'shop_overview' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  {t.shopNavOverview}
                </button>
                <button
                  onClick={() => onSelectTab('shop_menus')}
                  className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'shop_menus' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  {t.shopNavMenus}
                </button>
                <button
                  onClick={() => onSelectTab('shop_profile')}
                  className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'shop_profile' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  {t.shopNavProfile}
                </button>
                <button
                  onClick={() => onSelectTab('shop_settings')}
                  className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'shop_settings' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  {t.shopNavSettings}
                </button>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'admin' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{t.navAdmin}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Combined Auth button, Theme toggle, Language */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dark / Light Mode quick toggle button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={theme === 'dark' ? t.lightMode : t.darkMode}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* User Account Badge for Mobile & Desktop */}
            {user ? (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/50 dark:bg-stone-850/60 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl shadow-2xs">
                <img
                  src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                  alt={user.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden sm:inline text-xs font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[100px]">
                  {user.name}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
