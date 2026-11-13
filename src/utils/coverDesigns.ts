export const DEFAULT_PLACEHOLDER_COVER = '/src/assets/images/burmeal_hero_spread_1793906769541.jpg';

export type SupportedCountryCode = 'MM' | 'TH' | 'SG' | 'MY' | 'JP' | 'US' | 'EU' | 'GB' | 'KR' | 'AU';

export const COUNTRY_COVER_DESIGNS: Record<SupportedCountryCode, string> = {
  MM: '/src/assets/images/country_cover_mm_1794569770146.jpg',
  TH: '/src/assets/images/country_cover_th_1794569770140.jpg',
  SG: '/src/assets/images/country_cover_sg_1794569771078.jpg',
  MY: '/src/assets/images/country_cover_my_1794569771214.jpg',
  JP: '/src/assets/images/country_cover_jp_1794569772155.jpg',
  US: '/src/assets/images/country_cover_us_1794569770931.jpg',
  EU: '/src/assets/images/country_cover_eu_1794569772778.jpg',
  GB: '/src/assets/images/country_cover_gb_1794569773653.jpg',
  KR: '/src/assets/images/country_cover_kr_1794569773040.jpg',
  AU: '/src/assets/images/country_cover_au_1794569773335.jpg',
};

const COUNTRY_NAME_TO_CODE: Array<[RegExp, SupportedCountryCode]> = [
  [/^(mm|myanmar|burma)$/i, 'MM'],
  [/^(th|thailand)$/i, 'TH'],
  [/^(sg|singapore)$/i, 'SG'],
  [/^(my|malaysia)$/i, 'MY'],
  [/^(jp|japan)$/i, 'JP'],
  [/^(us|usa|united states|united states of america)$/i, 'US'],
  [/^(eu|europe|european union|germany|france|netherlands|italy|spain|sweden|belgium)$/i, 'EU'],
  [/^(gb|uk|united kingdom|great britain|england|scotland)$/i, 'GB'],
  [/^(kr|korea|south korea|republic of korea)$/i, 'KR'],
  [/^(au|australia)$/i, 'AU'],
];

const REGION_HINT_TO_CODE: Array<[RegExp, SupportedCountryCode]> = [
  [/^(mm-|yangon|mandalay|shan|bago|ayeyarwady|mon|kayin)/i, 'MM'],
  [/^(th-|bangkok|chiang mai|mae sot)/i, 'TH'],
  [/^(sg-|singapore)/i, 'SG'],
  [/^(my-|kuala lumpur|penang|johor)/i, 'MY'],
  [/^(jp-|tokyo|osaka|kyoto|takadanobaba)/i, 'JP'],
  [/^(us-|san francisco|los angeles|new york|bay area|california)/i, 'US'],
  [/^(eu-|berlin|paris|amsterdam|europe|germany|france|netherlands)/i, 'EU'],
  [/^(gb-|uk-|london|manchester)/i, 'GB'],
  [/^(kr-|seoul|incheon|busan)/i, 'KR'],
  [/^(au-|sydney|melbourne|perth|brisbane)/i, 'AU'],
];

export function resolveCountryCode(country?: string | null, region?: string | null): SupportedCountryCode {
  const cleanCountry = country?.trim() || '';
  if (cleanCountry) {
    for (const [pattern, code] of COUNTRY_NAME_TO_CODE) {
      if (pattern.test(cleanCountry)) return code;
    }
    for (const [pattern, code] of REGION_HINT_TO_CODE) {
      if (pattern.test(cleanCountry)) return code;
    }
  }

  const cleanRegion = region?.trim() || '';
  if (cleanRegion) {
    for (const [pattern, code] of REGION_HINT_TO_CODE) {
      if (pattern.test(cleanRegion)) return code;
    }
  }

  return 'MM';
}

export function getCountryCoverDesign(country?: string | null, region?: string | null): string {
  const code = resolveCountryCode(country, region);
  return COUNTRY_COVER_DESIGNS[code];
}

export function isDefaultCoverImage(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  return (
    trimmed === DEFAULT_PLACEHOLDER_COVER ||
    trimmed.includes('/src/assets/images/food_cover_')
  );
}

export function resolveCoverDesign(
  coverImage?: string | null,
  country?: string | null,
  region?: string | null
): string {
  if (!isDefaultCoverImage(coverImage)) {
    return (coverImage as string).trim();
  }
  return getCountryCoverDesign(country, region);
}
