import React, { createContext, useContext, useState, useEffect } from 'react';
import { COUNTRIES, REGIONS, RegionOption } from '../utils/countries';

export type { RegionOption };
export { REGIONS };

interface LocationContextType {
  selectedCountry: string; // e.g. "Myanmar"
  selectedRegionId: string; // e.g. "MM-YGN" or "MM-ALL"
  selectedRegionName: string;
  selectedFlag: string;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setLocation: (countryName: string, regionId?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user has previously chosen a location
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('burmeal_country') || '';
  });

  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    return localStorage.getItem('burmeal_region_id') || '';
  });

  // Prompt onboarding modal if not set
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => {
    const hasChosen = localStorage.getItem('burmeal_country');
    return !hasChosen; // Force onboarding modal if no location chosen
  });

  const setLocation = (countryName: string, regionId?: string) => {
    const matchedCountry = COUNTRIES.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
    );
    const cName = matchedCountry ? matchedCountry.name : countryName;
    const cCode = matchedCountry ? matchedCountry.code : 'MM';

    let rId = regionId;
    if (!rId) {
      // Pick first matching region for this country
      const firstReg = REGIONS.find((r) => r.countryName.toLowerCase() === cName.toLowerCase() || r.countryCode === cCode);
      rId = firstReg ? firstReg.id : `${cCode}-ALL`;
    }

    setSelectedCountry(cName);
    setSelectedRegionId(rId);
    localStorage.setItem('burmeal_country', cName);
    localStorage.setItem('burmeal_region_id', rId);
    setIsLocationModalOpen(false);
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => {
    // If no country has been selected yet, default to Myanmar so user is never stuck
    if (!selectedCountry) {
      setLocation('Myanmar', 'MM-ALL');
    }
    setIsLocationModalOpen(false);
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
