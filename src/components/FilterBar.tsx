import React, { useState } from 'react';
import { MenuType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { FILTER_CATEGORIES } from '../utils/foodCategories';
import { Search, Leaf, ShieldCheck, X, Utensils, Soup, Flame, ChefHat, Salad, Cake, Coffee, Fish, Beef, ChevronDown } from 'lucide-react';

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

const CATEGORIES = FILTER_CATEGORIES;

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case 'ALL':
      return <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
    case 'Noodles & Broth':
      return <Soup className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
    case 'Shan & Regional Noodles':
      return <Utensils className="w-4 h-4 text-orange-600 shrink-0" />;
    case 'Burmese Curries & Stews':
      return <Flame className="w-4 h-4 text-red-600 shrink-0" />;
    case 'Rice & Biryani':
    case 'Rice & Main Dishes':
      return <ChefHat className="w-4 h-4 text-amber-700 shrink-0" />;
    case 'Salads & Let-Thoke':
    case 'Salads & Snacks':
      return <Salad className="w-4 h-4 text-emerald-600 shrink-0" />;
    case 'Desserts & Traditional Sweets':
      return <Cake className="w-4 h-4 text-pink-600 shrink-0" />;
    case 'Tea, Coffee & Beverages':
      return <Coffee className="w-4 h-4 text-amber-800 shrink-0" />;
    case 'Seafood':
      return <Fish className="w-4 h-4 text-blue-600 shrink-0" />;
    case 'Grilled, BBQ & Roasted':
    case 'Stir-Fry & Wok Dishes':
      return <Beef className="w-4 h-4 text-rose-600 shrink-0" />;
    default:
      return <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
  }
};

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-200/90 dark:border-stone-800/90 p-3 sm:p-4 shadow-xs transition-colors relative z-10">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-10 pr-9 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs border rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-amber-500/25 focus:border-amber-600 transition-all duration-300 ${
              searchQuery.length > 0
                ? 'py-3 sm:py-3.5 text-sm sm:text-base shadow-lg border-amber-500 scale-[1.01]'
                : 'py-2 text-xs sm:text-sm shadow-2xs border-stone-200/80 dark:border-stone-700/80'
            }`}
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

        {/* Menu Sections & Badges: Categories placed BEFORE Vegetarian and Halal */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
          <div className="flex flex-wrap items-center gap-1 bg-stone-100/80 dark:bg-stone-800/80 backdrop-blur-xs p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
            <button
              type="button"
              onClick={() => onMenuTypeChange('ALL')}
              className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedMenuType === 'ALL'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400'
              }`}
            >
              {t.allMenus}
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

          {/* Right side: Category Dropdown FIRST, then Vegetarian & Halal */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Custom Category Dropdown with Icons */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all cursor-pointer shadow-2xs"
              >
                {getCategoryIcon(selectedCategory)}
                <span className="max-w-[130px] truncate">
                  {selectedCategory === 'ALL' ? (t.allCategories || 'All Categories') : selectedCategory}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-2xs"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="fixed inset-x-4 top-24 sm:absolute sm:right-0 sm:left-auto sm:mt-1.5 sm:w-72 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl z-[9999] p-1.5 max-h-[70vh] overflow-y-auto">
                    <div className="p-2 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Select Category</span>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            onCategoryChange(cat);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-amber-600 text-white font-bold'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          {getCategoryIcon(cat)}
                          <span className="truncate">
                            {cat === 'ALL' ? (t.allCategories || 'All Categories') : cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Vegetarian Badge */}
            <button
              type="button"
              onClick={onVegetarianToggle}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isVegetarian
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300'
              }`}
            >
              <Leaf className={`w-3 h-3 ${isVegetarian ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{t.vegetarian}</span>
            </button>

            {/* Halal Badge */}
            <button
              type="button"
              onClick={onHalalToggle}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isHalal
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-bold'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-sky-300'
              }`}
            >
              <ShieldCheck className={`w-3 h-3 ${isHalal ? 'text-sky-600' : 'text-stone-400'}`} />
              <span>{t.halal}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
