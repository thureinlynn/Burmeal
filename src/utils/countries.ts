// Helper data for supported countries with Unicode flags
export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export function getCountryFlag(countryName?: string): string {
  if (!countryName) return '🇲🇲';
  const found = COUNTRIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
  );
  return found ? found.flag : '📍';
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  placeholder: string;
  step: string;
  decimals: number;
}

export const COUNTRY_CURRENCIES: Record<string, CurrencyInfo> = {
  Myanmar: { code: 'MMK', symbol: 'Ks', name: 'Burmese Kyat', placeholder: '6500', step: '100', decimals: 0 },
  MM: { code: 'MMK', symbol: 'Ks', name: 'Burmese Kyat', placeholder: '6500', step: '100', decimals: 0 },
  Thailand: { code: 'THB', symbol: '฿', name: 'Thai Baht', placeholder: '150.00', step: '1', decimals: 2 },
  TH: { code: 'THB', symbol: '฿', name: 'Thai Baht', placeholder: '150.00', step: '1', decimals: 2 },
  Singapore: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', placeholder: '8.50', step: '0.10', decimals: 2 },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', placeholder: '8.50', step: '0.10', decimals: 2 },
  Malaysia: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', placeholder: '18.00', step: '0.50', decimals: 2 },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', placeholder: '18.00', step: '0.50', decimals: 2 },
  Japan: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', placeholder: '950', step: '50', decimals: 0 },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', placeholder: '950', step: '50', decimals: 0 },
  'United States': { code: 'USD', symbol: '$', name: 'US Dollar', placeholder: '9.50', step: '0.10', decimals: 2 },
  US: { code: 'USD', symbol: '$', name: 'US Dollar', placeholder: '9.50', step: '0.10', decimals: 2 },
  'European Union': { code: 'EUR', symbol: '€', name: 'Euro', placeholder: '8.50', step: '0.10', decimals: 2 },
  EU: { code: 'EUR', symbol: '€', name: 'Euro', placeholder: '8.50', step: '0.10', decimals: 2 },
  'United Kingdom': { code: 'GBP', symbol: '£', name: 'British Pound', placeholder: '7.50', step: '0.10', decimals: 2 },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound', placeholder: '7.50', step: '0.10', decimals: 2 },
  UK: { code: 'GBP', symbol: '£', name: 'British Pound', placeholder: '7.50', step: '0.10', decimals: 2 },
  'South Korea': { code: 'KRW', symbol: '₩', name: 'South Korean Won', placeholder: '9500', step: '500', decimals: 0 },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won', placeholder: '9500', step: '500', decimals: 0 },
  Australia: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', placeholder: '14.50', step: '0.50', decimals: 2 },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', placeholder: '14.50', step: '0.50', decimals: 2 },
};

export function getCurrencyForCountry(countryName?: string): CurrencyInfo {
  if (!countryName) return COUNTRY_CURRENCIES['Myanmar'];
  const trimmed = countryName.trim();
  if (COUNTRY_CURRENCIES[trimmed]) return COUNTRY_CURRENCIES[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_CURRENCIES)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) {
      return val;
    }
  }
  return { code: 'USD', symbol: '$', name: 'US Dollar', placeholder: '6.50', step: '0.10', decimals: 2 };
}

export interface RegionOption {
  id: string;
  countryCode: string;
  countryName: string;
  name: string;
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

  // 5. United States
  { id: 'US-ALL', countryCode: 'US', countryName: 'United States', name: 'All United States', flag: '🇺🇸' },
  { id: 'US-SF', countryCode: 'US', countryName: 'United States', name: 'San Francisco & Bay Area (Richmond, Fremont)', flag: '🇺🇸' },
  { id: 'US-LA', countryCode: 'US', countryName: 'United States', name: 'Los Angeles & SoCal (Alhambra, SGV)', flag: '🇺🇸' },
  { id: 'US-NYC', countryCode: 'US', countryName: 'United States', name: 'New York City (Queens / Elmhurst, Manhattan)', flag: '🇺🇸' },
  { id: 'US-TX', countryCode: 'US', countryName: 'United States', name: 'Texas (Houston, Dallas & Austin)', flag: '🇺🇸' },
  { id: 'US-DC', countryCode: 'US', countryName: 'United States', name: 'Washington DC & Virginia Metro', flag: '🇺🇸' },
  { id: 'US-FW', countryCode: 'US', countryName: 'United States', name: 'Indiana (Fort Wayne & Indianapolis)', flag: '🇺🇸' },
  { id: 'US-SEA', countryCode: 'US', countryName: 'United States', name: 'Seattle & Pacific Northwest', flag: '🇺🇸' },

  // 6. European Union
  { id: 'EU-ALL', countryCode: 'EU', countryName: 'European Union', name: 'All European Union', flag: '🇪🇺' },
  { id: 'EU-DE', countryCode: 'EU', countryName: 'European Union', name: 'Germany (Berlin, Frankfurt & Munich)', flag: '🇩🇪' },
  { id: 'EU-FR', countryCode: 'EU', countryName: 'European Union', name: 'France (Paris & Lyon)', flag: '🇫🇷' },
  { id: 'EU-NL', countryCode: 'EU', countryName: 'European Union', name: 'Netherlands (Amsterdam & Rotterdam)', flag: '🇳🇱' },
  { id: 'EU-IT', countryCode: 'EU', countryName: 'European Union', name: 'Italy (Rome & Milan)', flag: '🇮🇹' },
  { id: 'EU-ES', countryCode: 'EU', countryName: 'European Union', name: 'Spain (Madrid & Barcelona)', flag: '🇪🇸' },
  { id: 'EU-SE', countryCode: 'EU', countryName: 'European Union', name: 'Sweden & Scandinavia', flag: '🇸🇪' },
  { id: 'EU-BE', countryCode: 'EU', countryName: 'European Union', name: 'Belgium & Brussels', flag: '🇧🇪' },

  // 7. United Kingdom
  { id: 'GB-ALL', countryCode: 'GB', countryName: 'United Kingdom', name: 'All United Kingdom', flag: '🇬🇧' },
  { id: 'GB-LDN', countryCode: 'GB', countryName: 'United Kingdom', name: 'Greater London (Soho, Camden, Brixton)', flag: '🇬🇧' },
  { id: 'GB-MAN', countryCode: 'GB', countryName: 'United Kingdom', name: 'Manchester & North West', flag: '🇬🇧' },
  { id: 'GB-BIR', countryCode: 'GB', countryName: 'United Kingdom', name: 'Birmingham & West Midlands', flag: '🇬🇧' },
  { id: 'GB-EDI', countryCode: 'GB', countryName: 'United Kingdom', name: 'Edinburgh & Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'GB-OXF', countryCode: 'GB', countryName: 'United Kingdom', name: 'Oxford & Cambridge', flag: '🇬🇧' },
  { id: 'GB-BRS', countryCode: 'GB', countryName: 'United Kingdom', name: 'Bristol & South West', flag: '🇬🇧' },

  // 8. Japan
  { id: 'JP-ALL', countryCode: 'JP', countryName: 'Japan', name: 'All Japan', flag: '🇯🇵' },
  { id: 'JP-TYO', countryCode: 'JP', countryName: 'Japan', name: 'Tokyo (Takadanobaba "Little Yangon" & Shinjuku)', flag: '🇯🇵' },
  { id: 'JP-YOK', countryCode: 'JP', countryName: 'Japan', name: 'Yokohama & Kanagawa', flag: '🇯🇵' },
  { id: 'JP-OSA', countryCode: 'JP', countryName: 'Japan', name: 'Osaka & Kansai', flag: '🇯🇵' },
  { id: 'JP-NGO', countryCode: 'JP', countryName: 'Japan', name: 'Nagoya & Aichi', flag: '🇯🇵' },
  { id: 'JP-KOB', countryCode: 'JP', countryName: 'Japan', name: 'Kobe & Kyoto', flag: '🇯🇵' },

  // 9. Australia
  { id: 'AU-ALL', countryCode: 'AU', countryName: 'Australia', name: 'All Australia', flag: '🇦🇺' },
  { id: 'AU-SYD', countryCode: 'AU', countryName: 'Australia', name: 'Sydney & NSW (Cabramatta, Parramatta)', flag: '🇦🇺' },
  { id: 'AU-MEL', countryCode: 'AU', countryName: 'Australia', name: 'Melbourne & Victoria (CBD, Richmond, Fitzroy)', flag: '🇦🇺' },
  { id: 'AU-BNE', countryCode: 'AU', countryName: 'Australia', name: 'Brisbane & Queensland', flag: '🇦🇺' },
  { id: 'AU-PER', countryCode: 'AU', countryName: 'Australia', name: 'Perth & Western Australia', flag: '🇦🇺' },
  { id: 'AU-ADL', countryCode: 'AU', countryName: 'Australia', name: 'Adelaide & South Australia', flag: '🇦🇺' },

  // 10. South Korea
  { id: 'KR-ALL', countryCode: 'KR', countryName: 'South Korea', name: 'All South Korea', flag: '🇰🇷' },
  { id: 'KR-SEL', countryCode: 'KR', countryName: 'South Korea', name: 'Seoul Metro (Hongdae, Itaewon, Gangnam)', flag: '🇰🇷' },
  { id: 'KR-INC', countryCode: 'KR', countryName: 'South Korea', name: 'Incheon & Bupyeong (Little Burma Hub)', flag: '🇰🇷' },
  { id: 'KR-ANS', countryCode: 'KR', countryName: 'South Korea', name: 'Ansan & Gyeonggi Multi-Cultural Hub', flag: '🇰🇷' },
  { id: 'KR-BUS', countryCode: 'KR', countryName: 'South Korea', name: 'Busan & South Coast', flag: '🇰🇷' },
  { id: 'KR-DAE', countryCode: 'KR', countryName: 'South Korea', name: 'Daegu & Central Korea', flag: '🇰🇷' },
  { id: 'KR-SUW', countryCode: 'KR', countryName: 'South Korea', name: 'Suwon & Southern Gyeonggi', flag: '🇰🇷' },
];

export function getRegionsForCountry(countryName?: string): RegionOption[] {
  const clean = (countryName || '').trim().toLowerCase();
  if (!clean) {
    return REGIONS.filter((r) => r.countryCode === 'MM');
  }
  const matched = REGIONS.filter(
    (r) =>
      r.countryName.toLowerCase() === clean ||
      r.countryCode.toLowerCase() === clean
  );
  return matched.length > 0 ? matched : REGIONS.filter((r) => r.countryCode === 'MM');
}

export function getDefaultRegionNameForCountry(countryName?: string): string {
  const options = getRegionsForCountry(countryName);
  const specific = options.find((r) => !(r.id.endsWith('-ALL') && r.name.startsWith('All ')));
  return specific ? specific.name : options[0]?.name || '';
}

export function matchRegionOptionName(countryName?: string, rawRegion?: string): string {
  const cleanRegion = (rawRegion || '').trim();
  if (!cleanRegion) return '';
  const options = getRegionsForCountry(countryName);
  const lower = cleanRegion.toLowerCase();

  const exact = options.find((r) => r.name.toLowerCase() === lower);
  if (exact) return exact.name;

  if (lower.length >= 3) {
    const partial = options.find((r) => {
      const optLower = r.name.toLowerCase();
      const baseName = r.name.split('(')[0].replace(/\s+Region$/i, '').trim().toLowerCase();
      return (
        optLower.includes(lower) ||
        (baseName.length >= 3 && lower.includes(baseName))
      );
    });
    if (partial) return partial.name;
  }

  return cleanRegion;
}

