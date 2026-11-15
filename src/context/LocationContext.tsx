import React, { createContext, useContext, useState } from 'react';
import { COUNTRIES, REGIONS, RegionOption } from '../utils/countries';
import { shouldForceRegionOnboarding } from '../utils/locationOnboardingHelpers';
import { parseShareTargetFromSearch } from '../utils/shareHelpers';

export type { RegionOption };
export { REGIONS };

interface LocationContextType {
  selectedCountry: string; // e.g. "Myanmar"
  selectedRegionId: string; // e.g. "MM-YGN" or "MM-ALL"
  selectedRegionName: string;
  selectedFlag: string;
  hasChosenLocation: boolean;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setLocation: (countryName: string, regionId?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const hasInitialDeepLink = () => {
  if (typeof window === 'undefined') return false;
  const target = parseShareTargetFromSearch(window.location.search);
  return Boolean(target.itemId || target.shopId);
};

const getInitialSearch = () => (typeof window !== 'undefined' ? window.location.search : '');

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('burmeal_country') || (hasInitialDeepLink() ? 'Myanmar' : '');
  });

  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    return localStorage.getItem('burmeal_region_id') || (hasInitialDeepLink() ? 'MM-ALL' : '');
  });

  const [hasChosenLocation, setHasChosenLocation] = useState<boolean>(() => {
    const c = localStorage.getItem('burmeal_country');
    const r = localStorage.getItem('burmeal_region_id');
    return Boolean(c?.trim() && r?.trim());
  });

  // Enforce onboarding alert + country/region selection for first-time users (skip when arriving via shared deep link)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    return shouldForceRegionOnboarding(
      localStorage.getItem('burmeal_country'),
      localStorage.getItem('burmeal_region_id'),
      getInitialSearch()
    );
  });

  const setLocation = (countryName: string, regionId?: string) => {
    const matchedCountry = COUNTRIES.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
    );
    const cName = matchedCountry ? matchedCountry.name : countryName;
    const cCode = matchedCountry ? matchedCountry.code : 'MM';

    let rId = regionId;
    if (!rId) {
      const firstReg = REGIONS.find((r) => r.countryName.toLowerCase() === cName.toLowerCase() || r.countryCode === cCode);
      rId = firstReg ? firstReg.id : `${cCode}-ALL`;
    }

    setSelectedCountry(cName);
    setSelectedRegionId(rId);
    setHasChosenLocation(true);
    localStorage.setItem('burmeal_country', cName);
    localStorage.setItem('burmeal_region_id', rId);
    setIsLocationModalOpen(false);
  };

  const openLocationModal = () => setIsLocationModalOpen(true);

  const closeLocationModal = () => {
    // Only allow dismissing without confirmation if the user has already chosen a location once
    if (hasChosenLocation || hasInitialDeepLink()) {
      setIsLocationModalOpen(false);
    }
  };

  // Derive region display name and flag
  const currentRegion = REGIONS.find((r) => r.id === selectedRegionId);
  const selectedRegionName = currentRegion ? currentRegion.name : selectedCountry || 'Select Region';
  const selectedFlag = currentRegion ? currentRegion.flag : '🇲🇲';

  return (
    <LocationContext.Provider
      value={{
        selectedCountry: selectedCountry || 'Myanmar',
        selectedRegionId: selectedRegionId || 'MM-ALL',
        selectedRegionName,
        selectedFlag,
        hasChosenLocation,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        setLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
