import React from 'react';
import { MenuType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, Sparkles, Leaf, ShieldCheck, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMenuType: MenuType | 'ALL';
  onMenuTypeChange: (type: MenuType | 'ALL') => void;
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
    <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
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

      {/* Menu Sections & Dietary Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-100">
        {/* 3 Menu Types Filter */}
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => onMenuTypeChange('ALL')}
            className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedMenuType === 'ALL'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.allMenus}
          </button>
          <button
            onClick={() => onMenuTypeChange('SPECIAL')}
            className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedMenuType === 'SPECIAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-rose-600'
            }`}
          >
            {t.dailySpecials}
          </button>
          <button
            onClick={() => onMenuTypeChange('WEEKLY')}
            className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedMenuType === 'WEEKLY'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-amber-600'
            }`}
          >
            {t.weeklyMenus}
          </button>
          <button
            onClick={() => onMenuTypeChange('PERMANENT')}
            className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedMenuType === 'PERMANENT'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.regularMaster}
          </button>
        </div>

        {/* Dietary and Category Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-[11px] sm:text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-700 font-medium focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? t.allCategories : cat}
              </option>
            ))}
          </select>

          <button
            onClick={onVegetarianToggle}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg border transition-colors ${
              isVegetarian
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300'
            }`}
          >
            <Leaf className={`w-3 h-3 ${isVegetarian ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>{t.vegetarian}</span>
          </button>

          <button
            onClick={onHalalToggle}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-lg border transition-colors ${
              isHalal
                ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                : 'bg-white border-stone-200 text-stone-600 hover:border-sky-300'
            }`}
          >
            <ShieldCheck className={`w-3 h-3 ${isHalal ? 'text-sky-600' : 'text-stone-400'}`} />
            <span>{t.halal}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
