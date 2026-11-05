import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Home,
  Heart,
  Bookmark,
  User,
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Settings as SettingsIcon,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: 'CUSTOMER' | 'SHOP_OWNER';
  hasFollowedShops?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  role,
  hasFollowedShops,
}) => {
  const { t } = useLanguage();

  if (role === 'CUSTOMER') {
    return (
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-t border-stone-200 dark:border-stone-800 px-1 py-1 shadow-lg transition-colors">
        <div className="grid grid-cols-5 items-center">
          {/* Tab 1: Home Feed */}
          <button
            onClick={() => onSelectTab('feed')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'feed'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.navFeed}</span>
          </button>

          {/* Tab 2: Following Feed */}
          <button
            onClick={() => onSelectTab('following')}
            className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
              currentTab === 'following'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Heart className="w-4 h-4 mb-0.5" />
              {hasFollowedShops && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-stone-900"></span>
              )}
            </div>
            <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.navFollowing}</span>
          </button>

          {/* Tab 3: Saved Items */}
          <button
            onClick={() => onSelectTab('saved')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'saved'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Bookmark className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.navSaved}</span>
          </button>

          {/* Tab 4: Customer Profile */}
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'profile'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.navProfile}</span>
          </button>

          {/* Tab 5: Settings (New Tab!) */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'settings'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <SettingsIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.navSettings}</span>
          </button>
        </div>
      </nav>
    );
  }

  // SHOP_OWNER Navigation with Settings
  return (
    <nav aria-label="Shop Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-t border-stone-200 dark:border-stone-800 px-1 py-1 shadow-lg transition-colors">
      <div className="grid grid-cols-5 items-center">
        {/* Tab 1: Overview */}
        <button
          onClick={() => onSelectTab('shop_overview')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'shop_overview'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.shopNavOverview}</span>
        </button>

        {/* Tab 2: Menus */}
        <button
          onClick={() => onSelectTab('shop_menus')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'shop_menus'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.shopNavMenus}</span>
        </button>

        {/* Tab 3: Shop Info */}
        <button
          onClick={() => onSelectTab('shop_profile')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'shop_profile'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <Store className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.shopNavProfile}</span>
        </button>

        {/* Tab 4: Shop Settings */}
        <button
          onClick={() => onSelectTab('shop_settings')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'shop_settings'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.shopNavSettings}</span>
        </button>

        {/* Tab 5: App Settings */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'settings'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-[55px]">{t.navSettings}</span>
        </button>
      </div>
    </nav>
  );
};
