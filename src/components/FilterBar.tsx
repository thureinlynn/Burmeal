import React from 'react';
import { MenuType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, Leaf, ShieldCheck, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMenuType: MenuType;
  onMenuTypeChange: (type: MenuType) => void;
  isVegetarian: boolean;
  onVegetarianToggle: () => void;
  isHalal: boolean;
  onHalalToggle: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

const CATEGORIES = ['ALL', 'Noodles & Broth', 'Salads & Snacks', 'Breakfast Specials', 'Rice & Main Dishes'];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedMenuType,
  onMenuTypeChange,
  isVegetarian,
  onVegetarianToggle,
  isHalal,
  onHalalToggle,
  selectedCategory,
  onCategoryChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-200/90 dark:border-stone-800/90 p-3 sm:p-4 shadow-xs transition-colors">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-9 py-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs border border-stone-200/80 dark:border-stone-700/80 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Menu Sections & Dietary Badges (Daily Specials default, no All Menus) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
          <div className="flex flex-wrap items-center gap-1 bg-stone-100/80 dark:bg-stone-800/80 backdrop-blur-xs p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
            <button
              type="button"
              onClick={() => onMenuTypeChange('SPECIAL')}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedMenuType === 'SPECIAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              {t.dailySpecials}
            </button>
            <button
              type="button"
              onClick={() => onMenuTypeChange('WEEKLY')}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedMenuType === 'WEEKLY'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              {t.weeklyMenus}
            </button>
            <button
              type="button"
              onClick={() => onMenuTypeChange('PERMANENT')}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedMenuType === 'PERMANENT'
                  ? 'bg-stone-800 dark:bg-stone-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {t.regularMaster}
            </button>
          </div>

          {selectedMenuType !== 'SPECIAL' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="text-[11px] sm:text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-stone-700 dark:text-stone-200 font-medium focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? t.allCategories : cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onVegetarianToggle}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isVegetarian
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300'
                }`}
              >
                <Leaf className={`w-3 h-3 ${isVegetarian ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span>{t.vegetarian}</span>
              </button>

              <button
                type="button"
                onClick={onHalalToggle}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isHalal
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-sky-300'
                }`}
              >
                <ShieldCheck className={`w-3 h-3 ${isHalal ? 'text-sky-600' : 'text-stone-400'}`} />
                <span>{t.halal}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

