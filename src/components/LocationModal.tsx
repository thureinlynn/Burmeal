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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/50 backdrop-blur-md animate-fadeIn">
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl max-w-xl w-full border border-white/60 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Header - Liquid Glass with specular shine & light glow */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-600/90 via-orange-600/85 to-amber-700/90 backdrop-blur-xl text-white relative overflow-hidden border-b border-white/30">
          {/* Specular Liquid Glass Top Sheen & Prismatic Flare */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          {canDismiss && selectedCountry && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 rounded-full transition-all shadow-xs"
              title="Close location modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-2 shadow-xs">
            <Globe className="w-3.5 h-3.5" />
            <span>Regional Food Community</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-display leading-tight drop-shadow-xs">
            Select Your Location & Region
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/95 mt-1 leading-relaxed max-w-md">
            BurMeal customizes dishes, daily specials, and approved food kitchens based on where you live or dine.
          </p>
        </div>

        {/* Content Body: Dual Column with Frosted Glass Panels */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/50 dark:divide-white/10">
          {/* Step 1: Country Picker */}
          <div className="p-4 overflow-y-auto max-h-[42vh] sm:max-h-[50vh] space-y-1.5 bg-white/30 dark:bg-stone-900/30 backdrop-blur-md">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 mb-2 flex items-center gap-1.5">
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
                      ? 'bg-white/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100 border border-amber-500/60 shadow-[0_4px_16px_rgba(217,119,6,0.15)] backdrop-blur-md'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-800/60 border border-white/40 dark:border-white/5 backdrop-blur-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0 filter drop-shadow-2xs">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-600 translate-x-0.5' : 'text-stone-300 dark:text-stone-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Step 2: Specific Region / Province */}
          <div className="p-4 overflow-y-auto max-h-[42vh] sm:max-h-[50vh] space-y-1.5 bg-stone-100/40 dark:bg-stone-950/40 backdrop-blur-md">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 mb-2 flex items-center gap-1.5">
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
                        ? 'bg-white/95 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border-2 border-amber-600 shadow-[0_4px_20px_rgba(217,119,6,0.18)] backdrop-blur-md'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-white/70 dark:hover:bg-stone-800/60 border border-white/60 dark:border-white/5 backdrop-blur-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span className="truncate">{reg.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer with Liquid Glass Backing */}
        <div className="p-4 sm:p-5 border-t border-white/50 dark:border-white/10 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="text-xs text-stone-600 dark:text-stone-300 truncate">
            Current: <strong className="text-stone-900 dark:text-stone-100">{activeCountry}</strong> · {REGIONS.find((r) => r.id === activeRegionId)?.name || 'All'}
          </div>

          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(217,119,6,0.28)] border border-white/30 transition-all shrink-0 cursor-pointer"
          >
            Explore Feeds in This Region
          </button>
        </div>
      </div>
    </div>
  );
};
