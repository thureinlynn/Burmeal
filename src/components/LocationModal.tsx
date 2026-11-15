import React, { useState, useEffect, useRef } from 'react';
import { useLocation, REGIONS } from '../context/LocationContext';
import { COUNTRIES, CountryOption } from '../utils/countries';
import {
  canConfirmLocationSelection,
  getInitialOnboardingStep,
  getLocationSelectionStatus,
  LocationOnboardingStep,
} from '../utils/locationOnboardingHelpers';
import {
  MapPin,
  Globe,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Store,
  Utensils,
  Compass,
  X,
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
  isFirstTime?: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
  isFirstTime = false,
}) => {
  const { selectedCountry, selectedRegionId, setLocation } = useLocation();

  const [step, setStep] = useState<LocationOnboardingStep>(() =>
    getInitialOnboardingStep(!isFirstTime)
  );
  const [activeCountry, setActiveCountry] = useState<string>(() =>
    isFirstTime ? '' : selectedCountry || 'Myanmar'
  );
  const [activeRegionId, setActiveRegionId] = useState<string>(() =>
    isFirstTime ? '' : selectedRegionId || 'MM-ALL'
  );
  const [imgFailed, setImgFailed] = useState(false);

  const regionListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(getInitialOnboardingStep(!isFirstTime));
    if (isFirstTime) {
      setActiveCountry('');
      setActiveRegionId('');
    } else {
      setActiveCountry(selectedCountry || 'Myanmar');
      setActiveRegionId(selectedRegionId || 'MM-ALL');
    }
  }, [isOpen, isFirstTime, selectedCountry, selectedRegionId]);

  if (!isOpen) return null;

  const filteredRegions = activeCountry
    ? REGIONS.filter((r) => r.countryName.toLowerCase() === activeCountry.toLowerCase())
    : [];

  const handleSelectCountry = (country: CountryOption) => {
    setActiveCountry(country.name);
    if (isFirstTime) {
      // Prompt user to explicitly pick a region after selecting country
      setActiveRegionId('');
    } else {
      const firstRegion = REGIONS.find((r) => r.countryCode === country.code);
      setActiveRegionId(firstRegion ? firstRegion.id : `${country.code}-ALL`);
    }
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setTimeout(() => {
        regionListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  const canConfirm = canConfirmLocationSelection(activeCountry, activeRegionId);
  const activeRegionObj = REGIONS.find((r) => r.id === activeRegionId);
  const statusText = getLocationSelectionStatus(
    activeCountry,
    activeRegionObj?.name,
    canConfirm
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    setLocation(activeCountry, activeRegionId);
    onClose();
  };

  // Stage 1: Welcome Alert Box with 2D Flat Design Humans Illustration
  if (step === 'intro') {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="choose-region-alert-title"
        aria-describedby="choose-region-alert-desc"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-fadeIn"
      >
        <div className="bg-[#FFFBF5] dark:bg-stone-900 rounded-3xl max-w-lg w-full border border-amber-200/90 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Illustration Frame */}
          <div className="relative w-full aspect-[16/9] bg-[#FFFBF5] dark:bg-stone-950 border-b border-amber-100 dark:border-stone-800 overflow-hidden shrink-0">
            {!imgFailed ? (
              <img
                src="/src/assets/images/choose_region_humans_1794741472119.jpg"
                alt="2D flat design illustration of people choosing their food region on a map"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 400 225"
                className="w-full h-full"
                aria-label="2D flat design people choosing region illustration"
              >
                <rect width="400" height="225" fill="#FFFBF5" />
                <rect x="200" y="34" width="160" height="145" rx="14" fill="#FDE68A" />
                <path d="M210 110 Q260 65 350 95" stroke="#D97706" strokeWidth="5" fill="none" />
                <circle cx="280" cy="86" r="18" fill="#C2410C" />
                <circle cx="280" cy="84" r="6" fill="#FFFBF5" />
                <circle cx="105" cy="78" r="18" fill="#78350F" />
                <rect x="85" y="100" width="40" height="58" rx="14" fill="#D97706" />
                <circle cx="160" cy="70" r="19" fill="#451A03" />
                <rect x="138" y="94" width="44" height="64" rx="14" fill="#334155" />
              </svg>
            )}
          </div>

          {/* Alert Information Body */}
          <div className="p-6 sm:p-7 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <MapPin className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Regional Location Notice</span>
            </div>

            <div>
              <h2
                id="choose-region-alert-title"
                className="text-2xl font-extrabold font-display text-stone-900 dark:text-stone-100 tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Choose Your Region
              </h2>
              <p
                id="choose-region-alert-desc"
                className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed"
              >
                First-time visitors need to pick a country and region so BurMeal can show local menus, daily specials, and nearby home kitchens.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 border-t border-amber-100 dark:border-stone-800">
              <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300 pt-2">
                <Utensils className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>View authentic Burmese dishes and rotating specials served in your city.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
                <Store className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Connect directly with verified kitchens and local food shops around you.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
                <Compass className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Change your country or region anytime later from the top header.</span>
              </div>
            </div>
          </div>

          {/* Alert Footer with Next Button */}
          <div className="shrink-0 px-6 py-4 sm:px-7 bg-amber-50/70 dark:bg-stone-950/60 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Step 1 of 2 · Introduction
            </span>
            <button
              type="button"
              onClick={() => setStep('select')}
              data-testid="location-onboarding-next"
              className="min-h-[44px] px-6 py-2.5 bg-amber-700 hover:bg-amber-800 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Country & Region Selection Section
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-6 bg-gradient-to-br from-amber-700 via-orange-600 to-amber-700 text-white relative overflow-hidden border-b border-amber-500/30">
          <div className="flex items-center justify-between gap-3 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-2">
              {isFirstTime && (
                <button
                  type="button"
                  onClick={() => setStep('intro')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-100">
                <Globe className="w-3.5 h-3.5" />
                <span>{isFirstTime ? 'Step 2 of 2 · Location Setup' : 'Regional Food Community'}</span>
              </span>
            </div>

            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/90 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-colors cursor-pointer"
                aria-label="Close location modal"
                title="Close location modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 id="location-picker-title" className="text-lg sm:text-2xl font-extrabold font-display leading-tight">
            Select Country & Region
          </h2>
          <p className="text-xs sm:text-sm text-amber-50/95 mt-1 leading-relaxed max-w-lg">
            Choose your country first, then pick your city or region to see local dishes and kitchens.
          </p>
        </div>

        {/* Content Body: Dual Column Country + Region Picker */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-stone-800">
          {/* Step 1: Country Picker */}
          <div className="p-3 sm:p-4 overflow-y-auto max-h-[26vh] sm:max-h-[50vh] space-y-1.5 bg-white dark:bg-stone-900">
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300 px-2 mb-1.5">
              1. Country
            </p>
            {COUNTRIES.map((c) => {
              const isSelected = activeCountry.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100 border border-amber-500 shadow-xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/70 border border-stone-200/70 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-700 dark:text-amber-400 translate-x-0.5' : 'text-stone-400 dark:text-stone-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Step 2: Specific Region / Province */}
          <div
            ref={regionListRef}
            className="p-3 sm:p-4 overflow-y-auto max-h-[30vh] sm:max-h-[50vh] space-y-1.5 bg-stone-50 dark:bg-stone-950/60"
          >
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300 px-2 mb-1.5">
              2. Region / City Area
            </p>

            {!activeCountry ? (
              <div className="p-5 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center space-y-2 my-1">
                <MapPin className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Pick a country first
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Choose a country from the list to view its supported regions and cities.
                </p>
              </div>
            ) : filteredRegions.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400">
                All regions in {activeCountry} are supported.
              </div>
            ) : (
              filteredRegions.map((reg) => {
                const isSelected = activeRegionId === reg.id;
                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setActiveRegionId(reg.id)}
                    className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-amber-600 shadow-xs'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800'
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
        <div className="shrink-0 p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate">
            {statusText}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            data-testid="location-onboarding-confirm"
            className={`min-h-[44px] px-5 py-2.5 font-bold text-xs rounded-xl transition-all shrink-0 whitespace-nowrap ${
              canConfirm
                ? 'bg-amber-700 hover:bg-amber-800 active:scale-[0.98] text-white shadow-md cursor-pointer'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
            }`}
          >
            Explore Feeds in This Region
          </button>
        </div>
      </div>
    </div>
  );
};
