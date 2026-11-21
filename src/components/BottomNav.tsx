import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Home,
  Heart,
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

const SLIDE_CLASSES_5 = [
  'translate-x-0',
  'translate-x-full',
  'translate-x-[200%]',
  'translate-x-[300%]',
  'translate-x-[400%]',
] as const;

const SLIDE_CLASSES_4 = [
  'translate-x-0',
  'translate-x-full',
  'translate-x-[200%]',
  'translate-x-[300%]',
] as const;

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  role,
  hasFollowedShops,
}) => {
  const { t } = useLanguage();

  if (role === 'CUSTOMER') {
    const customerTabs = [
      { id: 'feed', label: t.navFeed, icon: Home },
      { id: 'following', label: t.navFollowing, icon: Heart, badge: Boolean(hasFollowedShops) },
      { id: 'shops', label: t.navShops, icon: Store },
      { id: 'profile', label: t.navProfile, icon: User },
      { id: 'settings', label: t.navSettings, icon: SettingsIcon },
    ];
    const activeIndex = customerTabs.findIndex((tab) => tab.id === currentTab);

    return (
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40 bg-white/75 dark:bg-stone-900/75 backdrop-blur-2xl backdrop-saturate-200 border border-white/60 dark:border-stone-700/60 px-2.5 py-1.5 shadow-[0_16px_40px_0_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_0_rgba(0,0,0,0.7)] rounded-full transition-all"
      >
        <div className="relative grid grid-cols-5 items-center">
          {activeIndex >= 0 && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-0.5 bottom-0.5 left-0 w-1/5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 border border-amber-500/25 dark:border-amber-400/25 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                SLIDE_CLASSES_5[activeIndex] || 'translate-x-0'
              }`}
            />
          )}
          {customerTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`bottom-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative z-10 flex flex-col items-center justify-center py-1.5 rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
                  isActive
                    ? 'text-amber-700 dark:text-amber-300 font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <div
                  className={`relative transition-transform duration-200 ${
                    isActive ? 'scale-110 -translate-y-0.5' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  {tab.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-stone-900" />
                  )}
                </div>
                <span className="text-[10px] leading-tight truncate max-w-[55px]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // SHOP_OWNER Navigation: Responsive 4-tab mobile layout (Overview, Menus, Shop Info, Settings)
  const ownerTabs = [
    { id: 'shop_overview', label: t.shopNavOverview, icon: LayoutDashboard },
    { id: 'shop_menus', label: t.shopNavMenus, icon: UtensilsCrossed },
    { id: 'shop_profile', label: t.shopNavProfile, icon: Store },
    { id: 'shop_settings', label: t.shopNavSettings, icon: SettingsIcon },
  ];
  const activeOwnerIndex = ownerTabs.findIndex((tab) => tab.id === currentTab);

  return (
    <nav
      aria-label="Shop Owner Navigation"
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40 bg-white/75 dark:bg-stone-900/75 backdrop-blur-2xl backdrop-saturate-200 border border-white/60 dark:border-stone-700/60 px-2.5 py-1.5 shadow-[0_16px_40px_0_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_0_rgba(0,0,0,0.7)] rounded-full transition-all"
    >
      <div className="relative grid grid-cols-4 items-center">
        {activeOwnerIndex >= 0 && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-0.5 bottom-0.5 left-0 w-1/4 rounded-full bg-amber-500/15 dark:bg-amber-400/20 border border-amber-500/25 dark:border-amber-400/25 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              SLIDE_CLASSES_4[activeOwnerIndex] || 'translate-x-0'
            }`}
          />
        )}
        {ownerTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`bottom-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative z-10 flex flex-col items-center justify-center py-1.5 rounded-full transition-all duration-200 active:scale-90 cursor-pointer ${
                isActive
                  ? 'text-amber-700 dark:text-amber-300 font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div
                className={`relative transition-transform duration-200 ${
                  isActive ? 'scale-110 -translate-y-0.5' : ''
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
              </div>
              <span className="text-[10px] leading-tight font-semibold truncate max-w-[65px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
