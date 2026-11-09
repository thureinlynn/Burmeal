import React, { createContext, useContext, useState, useEffect } from 'react';
import { COUNTRIES, CountryOption } from '../utils/countries';

export interface RegionOption {
  id: string; // e.g. "MM-YGN", "MM-MDY", "TH-BKK", "ALL"
  countryCode: string; // "MM", "TH", etc.
  countryName: string;
  name: string; // e.g. "Yangon Region", "Bangkok", "All Regions"
  flag: string;
}

export const REGIONS: RegionOption[] = [
  // 1. Myanmar
  { id: 'MM-ALL', countryCode: 'MM', countryName: 'Myanmar', name: 'All Myanmar', flag: '🇲🇲' },
  { id: 'MM-YGN', countryCode: 'MM', countryName: 'Myanmar', name: 'Yangon Region', flag: '🇲🇲' },
  { id: 'MM-MDY', countryCode: 'MM', countryName: 'Myanmar', name: 'Mandalay Region', flag: '🇲🇲' },
  { id: 'MM-SHN', countryCode: 'MM', countryName: 'Myanmar', name: 'Shan State (Taunggyi & Inle)', flag: '🇲🇲' },
  { id: 'MM-BGO', countryCode: 'MM', countryName: 'Myanmar', name: 'Bago Region', flag: '🇲🇲' },
  { id: 'MM-AYY', countryCode: 'MM', countryName: 'Myanmar', name: 'Ayeyarwady Region (Pathein)', flag: '🇲🇲' },
  { id: 'MM-MON', countryCode: 'MM', countryName: 'Myanmar', name: 'Mon State (Mawlamyine)', flag: '🇲🇲' },
  { id: 'MM-KRN', countryCode: 'MM', countryName: 'Myanmar', name: 'Kayin State (Hpa-an)', flag: '🇲🇲' },

  // 2. Thailand
  { id: 'TH-ALL', countryCode: 'TH', countryName: 'Thailand', name: 'All Thailand', flag: '🇹🇭' },
  { id: 'TH-BKK', countryCode: 'TH', countryName: 'Thailand', name: 'Bangkok Metropolitan (Pratunam & Silom)', flag: '🇹🇭' },
  { id: 'TH-CNX', countryCode: 'TH', countryName: 'Thailand', name: 'Chiang Mai (Nimman & Old City)', flag: '🇹🇭' },
  { id: 'TH-MSOT', countryCode: 'TH', countryName: 'Thailand', name: 'Mae Sot Border', flag: '🇹🇭' },
  { id: 'TH-PKT', countryCode: 'TH', countryName: 'Thailand', name: 'Phuket & Southern Thailand', flag: '🇹🇭' },

  // 3. Singapore
  { id: 'SG-ALL', countryCode: 'SG', countryName: 'Singapore', name: 'Central Singapore (Peninsula Plaza)', flag: '🇸🇬' },
  { id: 'SG-EST', countryCode: 'SG', countryName: 'Singapore', name: 'East Coast & Katong', flag: '🇸🇬' },
  { id: 'SG-WST', countryCode: 'SG', countryName: 'Singapore', name: 'Jurong & West Coast', flag: '🇸🇬' },
  { id: 'SG-NOR', countryCode: 'SG', countryName: 'Singapore', name: 'Woodlands & North', flag: '🇸🇬' },

  // 4. Malaysia
  { id: 'MY-ALL', countryCode: 'MY', countryName: 'Malaysia', name: 'All Malaysia', flag: '🇲🇾' },
  { id: 'MY-KL', countryCode: 'MY', countryName: 'Malaysia', name: 'Kuala Lumpur (Pudu & Chinatown)', flag: '🇲🇾' },
  { id: 'MY-SEL', countryCode: 'MY', countryName: 'Malaysia', name: 'Selangor (Petaling Jaya & Klang)', flag: '🇲🇾' },
  { id: 'MY-PEN', countryCode: 'MY', countryName: 'Malaysia', name: 'Penang & George Town', flag: '🇲🇾' },
  { id: 'MY-JB', countryCode: 'MY', countryName: 'Malaysia', name: 'Johor Bahru', flag: '🇲🇾' },

  // 5. United States (Major regions & metropolitan hubs)
  { id: 'US-ALL', countryCode: 'US', countryName: 'United States', name: 'All United States', flag: '🇺🇸' },
  { id: 'US-SF', countryCode: 'US', countryName: 'United States', name: 'San Francisco & Bay Area (Richmond, Fremont)', flag: '🇺🇸' },
  { id: 'US-LA', countryCode: 'US', countryName: 'United States', name: 'Los Angeles & SoCal (Alhambra, SGV)', flag: '🇺🇸' },
  { id: 'US-NYC', countryCode: 'US', countryName: 'United States', name: 'New York City (Queens / Elmhurst, Manhattan)', flag: '🇺🇸' },
  { id: 'US-TX', countryCode: 'US', countryName: 'United States', name: 'Texas (Houston, Dallas & Austin)', flag: '🇺🇸' },
  { id: 'US-DC', countryCode: 'US', countryName: 'United States', name: 'Washington DC & Virginia Metro', flag: '🇺🇸' },
  { id: 'US-FW', countryCode: 'US', countryName: 'United States', name: 'Indiana (Fort Wayne & Indianapolis)', flag: '🇺🇸' },
  { id: 'US-SEA', countryCode: 'US', countryName: 'United States', name: 'Seattle & Pacific Northwest', flag: '🇺🇸' },

  // 6. European Union (Major EU countries as regions)
  { id: 'EU-ALL', countryCode: 'EU', countryName: 'European Union', name: 'All European Union', flag: '🇪🇺' },
  { id: 'EU-DE', countryCode: 'EU', countryName: 'European Union', name: 'Germany (Berlin, Frankfurt & Munich)', flag: '🇩🇪' },
  { id: 'EU-FR', countryCode: 'EU', countryName: 'European Union', name: 'France (Paris & Lyon)', flag: '🇫🇷' },
  { id: 'EU-NL', countryCode: 'EU', countryName: 'European Union', name: 'Netherlands (Amsterdam & Rotterdam)', flag: '🇳🇱' },
  { id: 'EU-IT', countryCode: 'EU', countryName: 'European Union', name: 'Italy (Rome & Milan)', flag: '🇮🇹' },
  { id: 'EU-ES', countryCode: 'EU', countryName: 'European Union', name: 'Spain (Madrid & Barcelona)', flag: '🇪🇸' },
  { id: 'EU-SE', countryCode: 'EU', countryName: 'European Union', name: 'Sweden & Scandinavia', flag: '🇸🇪' },
  { id: 'EU-BE', countryCode: 'EU', countryName: 'European Union', name: 'Belgium & Brussels', flag: '🇧🇪' },

  // 7. United Kingdom (Major cities)
  { id: 'GB-ALL', countryCode: 'GB', countryName: 'United Kingdom', name: 'All United Kingdom', flag: '🇬🇧' },
  { id: 'GB-LDN', countryCode: 'GB', countryName: 'United Kingdom', name: 'Greater London (Soho, Camden, Brixton)', flag: '🇬🇧' },
  { id: 'GB-MAN', countryCode: 'GB', countryName: 'United Kingdom', name: 'Manchester & North West', flag: '🇬🇧' },
  { id: 'GB-BIR', countryCode: 'GB', countryName: 'United Kingdom', name: 'Birmingham & West Midlands', flag: '🇬🇧' },
  { id: 'GB-EDI', countryCode: 'GB', countryName: 'United Kingdom', name: 'Edinburgh & Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'GB-OXF', countryCode: 'GB', countryName: 'United Kingdom', name: 'Oxford & Cambridge', flag: '🇬🇧' },
  { id: 'GB-BRS', countryCode: 'GB', countryName: 'United Kingdom', name: 'Bristol & South West', flag: '🇬🇧' },

  // 8. Japan (Major cities)
  { id: 'JP-ALL', countryCode: 'JP', countryName: 'Japan', name: 'All Japan', flag: '🇯🇵' },
  { id: 'JP-TYO', countryCode: 'JP', countryName: 'Japan', name: 'Tokyo (Takadanobaba "Little Yangon" & Shinjuku)', flag: '🇯🇵' },
  { id: 'JP-YOK', countryCode: 'JP', countryName: 'Japan', name: 'Yokohama & Kanagawa', flag: '🇯🇵' },
  { id: 'JP-OSA', countryCode: 'JP', countryName: 'Japan', name: 'Osaka & Kansai', flag: '🇯🇵' },
  { id: 'JP-NGO', countryCode: 'JP', countryName: 'Japan', name: 'Nagoya & Aichi', flag: '🇯🇵' },
  { id: 'JP-KOB', countryCode: 'JP', countryName: 'Japan', name: 'Kobe & Kyoto', flag: '🇯🇵' },

  // 9. Australia (Major cities)
  { id: 'AU-ALL', countryCode: 'AU', countryName: 'Australia', name: 'All Australia', flag: '🇦🇺' },
  { id: 'AU-SYD', countryCode: 'AU', countryName: 'Australia', name: 'Sydney & NSW (Cabramatta, Parramatta)', flag: '🇦🇺' },
  { id: 'AU-MEL', countryCode: 'AU', countryName: 'Australia', name: 'Melbourne & Victoria (CBD, Richmond, Fitzroy)', flag: '🇦🇺' },
  { id: 'AU-BNE', countryCode: 'AU', countryName: 'Australia', name: 'Brisbane & Queensland', flag: '🇦🇺' },
  { id: 'AU-PER', countryCode: 'AU', countryName: 'Australia', name: 'Perth & Western Australia', flag: '🇦🇺' },
  { id: 'AU-ADL', countryCode: 'AU', countryName: 'Australia', name: 'Adelaide & South Australia', flag: '🇦🇺' },

  // 10. South Korea (Major cities & diaspora hubs)
  { id: 'KR-ALL', countryCode: 'KR', countryName: 'South Korea', name: 'All South Korea', flag: '🇰🇷' },
  { id: 'KR-SEL', countryCode: 'KR', countryName: 'South Korea', name: 'Seoul Metro (Hongdae, Itaewon, Gangnam)', flag: '🇰🇷' },
  { id: 'KR-INC', countryCode: 'KR', countryName: 'South Korea', name: 'Incheon & Bupyeong (Little Burma Hub)', flag: '🇰🇷' },
  { id: 'KR-ANS', countryCode: 'KR', countryName: 'South Korea', name: 'Ansan & Gyeonggi Multi-Cultural Hub', flag: '🇰🇷' },
  { id: 'KR-BUS', countryCode: 'KR', countryName: 'South Korea', name: 'Busan & South Coast', flag: '🇰🇷' },
  { id: 'KR-DAE', countryCode: 'KR', countryName: 'South Korea', name: 'Daegu & Central Korea', flag: '🇰🇷' },
  { id: 'KR-SUW', countryCode: 'KR', countryName: 'South Korea', name: 'Suwon & Southern Gyeonggi', flag: '🇰🇷' },
];

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
