import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Heart,
  Bookmark,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronDown,
  LogIn,
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
    <header className="sticky top-0 z-40 bg-white/65 dark:bg-stone-950/85 backdrop-blur-2xl backdrop-saturate-200 border-b border-white/50 dark:border-stone-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Liquid Glass Prismatic Specular Top Sheen */}
        <div className="absolute inset-x-0 -top-px h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-amber-500/20 to-transparent pointer-events-none" />
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
                  type="button"
                  onClick={() => onSelectTab('feed')}
                  className={`relative pb-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'feed' ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                  }`}
                >
                  {t.navFeed}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                      currentTab === 'feed' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('following')}
                  className={`relative pb-1.5 flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'following' ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.navFollowing}</span>
                  {hasFollowedShops && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5"></span>
                  )}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                      currentTab === 'following' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('shops')}
                  className={`relative pb-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'shops' ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                  }`}
                >
                  {t.navShops}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                      currentTab === 'shops' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('saved')}
                  className={`relative pb-1.5 flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'saved' ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{t.navSaved}</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                      currentTab === 'saved' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={() => onSelectTab('profile')}
                    className={`relative pb-1.5 flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                      currentTab === 'profile' ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.navProfile}</span>
                    <span
                      className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                        currentTab === 'profile' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectTab('settings')}
                  className={`relative pb-1.5 flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'settings' ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                  }`}
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>{t.navSettings}</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                      currentTab === 'settings' ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />
                </button>
              </>
            )}

            {user?.role === 'SHOP_OWNER' && (
              <>
                {[
                  { id: 'shop_overview', label: t.shopNavOverview },
                  { id: 'shop_menus', label: t.shopNavMenus },
                  { id: 'shop_profile', label: t.shopNavProfile },
                  { id: 'shop_settings', label: t.shopNavSettings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`relative pb-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                      currentTab === tab.id ? 'text-amber-700 dark:text-amber-400 font-bold' : ''
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400 origin-center transition-all duration-250 ${
                        currentTab === tab.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                    />
                  </button>
                ))}
              </>
            )}
          </nav>

          {/* Zone 3: Desktop Theme toggle, Mobile Saved button, Auth button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dark / Light Mode quick toggle button (Desktop only — replaced by Saved on mobile) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden md:flex p-1.5 sm:p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? t.lightMode : t.darkMode}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* Mobile Saved button (replaces Dark Theme toggle on mobile header) */}
            {user?.role !== 'SHOP_OWNER' && (
              <button
                type="button"
                onClick={() => onSelectTab('saved')}
                className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
                  currentTab === 'saved'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-stone-50/90 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title={t.navSaved}
                aria-label={t.navSaved}
              >
                <Bookmark className={`w-4 h-4 ${currentTab === 'saved' ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* User Account Badge or Sign In Button */}
            {user ? (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/50 dark:bg-stone-800/80 backdrop-blur-md border border-white/60 dark:border-stone-700 rounded-xl shadow-2xs">
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
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('CUSTOMER')}
                aria-label={t.signIn}
                title={t.signIn}
                className="flex items-center justify-center gap-1.5 p-2 md:px-3 md:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 md:w-3.5 md:h-3.5" />
                <span className="hidden md:inline">{t.signIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
