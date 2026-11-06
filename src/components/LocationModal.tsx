import React, { useState } from 'react';
import { useLocation, REGIONS } from '../context/LocationContext';
import { COUNTRIES, CountryOption } from '../utils/countries';
import { MapPin, Globe, Check, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, canDismiss = true }) => {
  const { t } = useLanguage();
  const { selectedCountry, selectedRegionId, setLocation } = useLocation();

  const [activeCountry, setActiveCountry] = useState<string>(selectedCountry || 'Myanmar');
  const [activeRegionId, setActiveRegionId] = useState<string>(selectedRegionId || 'MM-ALL');

  if (!isOpen) return null;

  // Regions under the active country
  const filteredRegions = REGIONS.filter(
    (r) => r.countryName.toLowerCase() === activeCountry.toLowerCase()
  );

  const handleSelectCountry = (country: CountryOption) => {
    setActiveCountry(country.name);
    const firstRegion = REGIONS.find((r) => r.countryCode === country.code);
    setActiveRegionId(firstRegion ? firstRegion.id : `${country.code}-ALL`);
  };

  const handleConfirm = () => {
    setLocation(activeCountry, activeRegionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white relative">
          {canDismiss && selectedCountry && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Regional Food Community</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-display leading-tight">
            Select Your Location & Region
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 leading-relaxed">
            BurMeal customizes dishes, daily specials, and approved food kitchens based on where you live or dine.
          </p>
        </div>

        {/* Content Body: Dual Column (Country on Left, Region on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-stone-800">
          {/* Step 1: Country Picker */}
          <div className="p-4 overflow-y-auto max-h-[42vh] sm:max-h-[50vh] space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2 mb-2 flex items-center gap-1.5">
              <span>Step 1: Country</span>
            </p>
            {COUNTRIES.map((c) => {
              const isSelected = activeCountry.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelectCountry(c)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-600 translate-x-0.5' : 'text-stone-300 dark:text-stone-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Step 2: Specific Region / Province */}
          <div className="p-4 overflow-y-auto max-h-[42vh] sm:max-h-[50vh] space-y-1.5 bg-stone-50/50 dark:bg-stone-900/50">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2 mb-2 flex items-center gap-1.5">
              <span>Step 2: Region / City Area</span>
            </p>

            {filteredRegions.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                All regions in {activeCountry} are supported.
              </div>
            ) : (
              filteredRegions.map((reg) => {
                const isSelected = activeRegionId === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setActiveRegionId(reg.id)}
                    className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-amber-600 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-800/80 border border-stone-200/60 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span className="truncate">{reg.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
            Current: <strong className="text-stone-800 dark:text-stone-200">{activeCountry}</strong> · {REGIONS.find((r) => r.id === activeRegionId)?.name || 'All'}
          </div>

          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            Explore Feeds in This Region
          </button>
        </div>
      </div>
    </div>
  );
};
