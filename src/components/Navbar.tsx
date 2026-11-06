import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  UtensilsCrossed,
  ShieldAlert,
  Store,
  LogOut,
  Globe,
  Heart,
  Bookmark,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from 'lucide-react';

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
  const { user, logout, switchDemoRole } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onSelectTab('feed')}
            className="flex items-center gap-2 text-stone-900 dark:text-stone-100 group focus:outline-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/assets/aistudio/burmeal_logo_icon.png"
                alt="BurMeal Vector Logo"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight font-display text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0">
              {t.brandName}
            </span>
          </button>

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
                  onClick={() => onSelectTab('settings')}
                  className={`flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'settings' ? 'text-amber-700 dark:text-amber-400 font-bold border-b-2 border-amber-600 pb-1' : ''
                  }`}
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>{t.navSettings}</span>
                </button>
                <button
                  onClick={() => onSelectTab('feed')}
                  className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-xs ml-2"
                >
                  (Public Feed)
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

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 sm:px-2 py-1 rounded transition-colors font-medium text-[11px] sm:text-xs ${
                  lang === 'en'
                    ? 'bg-white dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('my')}
                className={`px-1.5 sm:px-2 py-1 rounded transition-colors font-medium text-[11px] sm:text-xs ${
                  lang === 'my'
                    ? 'bg-white dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
                }`}
                title="မြန်မာ"
              >
                မြန်မာ
              </button>
            </div>

            {/* Quick Demo Switcher (Desktop only) */}
            <div className="hidden xl:flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => switchDemoRole('CUSTOMER')}
                className={`px-2 py-1 rounded transition-colors ${
                  user?.role === 'CUSTOMER' ? 'bg-white dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500'
                }`}
              >
                {t.customerRole}
              </button>
              <button
                onClick={() => switchDemoRole('SHOP_OWNER')}
                className={`px-2 py-1 rounded transition-colors ${
                  user?.role === 'SHOP_OWNER' ? 'bg-white dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500'
                }`}
              >
                {t.shopRole}
              </button>
              <button
                onClick={() => switchDemoRole('ADMIN')}
                className={`px-2 py-1 rounded transition-colors ${
                  user?.role === 'ADMIN' ? 'bg-white dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500'
                }`}
              >
                {t.adminRole}
              </button>
            </div>

            {/* User Account / Combined Login Button for Mobile & Desktop */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={user.name}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[80px]">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title={t.signOut}
                  className="p-1.5 sm:p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* COMBINED SPACE-SAVING LOGIN BUTTON FOR MOBILE UI */
              <div className="flex items-center">
                {/* On mobile: Single combined button opening role-select modal */}
                <div className="sm:hidden">
                  <button
                    onClick={() => onOpenAuth('CUSTOMER')}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                  >
                    {t.loginJointButton}
                  </button>
                </div>

                {/* On tablet/desktop: Clean segmented dual buttons */}
                <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
                  <button
                    onClick={() => onOpenAuth('CUSTOMER')}
                    className="px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded"
                  >
                    {t.customerRole}
                  </button>
                  <span className="text-stone-300 dark:text-stone-600">|</span>
                  <button
                    onClick={() => onOpenAuth('SHOP_OWNER')}
                    className="px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 rounded"
                  >
                    {t.shopRole}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
