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
