import React from 'react';
import { MenuItem } from '../types';
import { formatPrice } from '../utils/filter';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { Bookmark, Leaf, ShieldCheck, Store, ArrowRight, Calendar, Clock } from 'lucide-react';

import { getCountryFlag } from '../utils/countries';

interface MenuCardProps {
  item: MenuItem;
  onToggleSave: (item: MenuItem) => void;
  onSelectItem: (item: MenuItem) => void;
  onSelectShop?: (shopId: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onToggleSave,
  onSelectItem,
  onSelectShop,
}) => {
  const { t } = useLanguage();
  const { selectedCountry } = useLocation();

  // If item is from a specific shop, ALWAYS format price in that shop's country currency!
  // It must never change depending on which region the user is currently viewing.
  const itemCurrencyCountry = item.shopCountry || item.country || selectedCountry;

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Visual Image Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={item.image}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Dietary indicators (Clean, non-pill) */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {item.isVegetarian && (
            <span
              title="Vegetarian"
              className="bg-emerald-600/90 backdrop-blur text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5"
            >
              <Leaf className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">Veg</span>
            </span>
          )}
          {item.isHalal && (
            <span
              title="Halal"
              className="bg-sky-700/90 backdrop-blur text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5"
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">Halal</span>
            </span>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item);
          }}
          className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur transition-all ${
            item.isSaved
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-black/35 text-white hover:bg-black/60'
          }`}
          title={item.isSaved ? t.saved : t.saveItem}
          aria-label={`Save ${item.title}`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Menu Type & Price Pill */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur ${
              item.menuType === 'SPECIAL'
                ? 'bg-rose-600/95 text-white'
                : item.menuType === 'WEEKLY'
                ? 'bg-amber-600/95 text-white'
                : 'bg-stone-800/90 text-stone-100'
            }`}
          >
            {item.menuType === 'SPECIAL'
              ? t.todaySpecial
              : item.menuType === 'WEEKLY'
              ? t.weeklyHighlight
              : t.masterMenu}
          </span>

          <span className="bg-stone-900/85 backdrop-blur text-white font-bold text-[11px] sm:text-xs px-1.5 py-0.5 rounded tabular-nums">
            {formatPrice(item.price, itemCurrencyCountry)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop and Category unboxed metadata with dot separator */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
            {item.shopName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectShop && onSelectShop(item.shopId);
                }}
                className="font-semibold text-amber-700 hover:underline hover:text-amber-800 transition-colors truncate max-w-[120px] sm:max-w-[160px]"
              >
                {item.shopName}
              </button>
            )}
            {item.shopCountry && (
              <span className="text-xs shrink-0" title={item.shopCountry}>
                {getCountryFlag(item.shopCountry)}
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span className="truncate">{item.category}</span>
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1 mb-1">
            {item.title}
          </h3>

          <p className="text-stone-600 text-[11px] sm:text-xs line-clamp-2 mb-2 leading-relaxed">
            {item.description}
          </p>

          {/* Schedule availability */}
          {item.menuType === 'SPECIAL' && item.specialDate && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-rose-700 font-medium mb-2 bg-rose-50 px-1.5 py-0.5 rounded">
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.servedOn}: {item.specialDate}</span>
            </div>
          )}

          {item.menuType === 'WEEKLY' && item.availableDays && item.availableDays.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-800 font-medium mb-2 bg-amber-50 px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.availableDays.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Bottom card action: Visit Shop & Order Link (NO direct contact on items!) */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-[10px] text-stone-400 font-medium">
            Tap for Details
          </span>
          <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>{t.contactShop}</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
