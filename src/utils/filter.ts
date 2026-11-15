import { MenuItem, MenuType, Shop } from '../types';
import { getCurrencyForCountry } from './countries';

export const REGION_PREFIX_TO_COUNTRY: Record<string, string> = {
  MM: 'Myanmar',
  TH: 'Thailand',
  SG: 'Singapore',
  MY: 'Malaysia',
  JP: 'Japan',
  US: 'United States',
  EU: 'European Union',
  GB: 'United Kingdom',
  KR: 'South Korea',
  AU: 'Australia',
};

export function getCountryFromRegionId(regionId?: string): string | undefined {
  if (!regionId) return undefined;
  const prefix = regionId.split('-')[0]?.toUpperCase();
  return REGION_PREFIX_TO_COUNTRY[prefix];
}

export function matchesRegionFilter(
  s: Pick<Shop, 'name' | 'country' | 'region' | 'city' | 'locationArea' | 'address'>,
  regionId?: string,
  country?: string
): boolean {
  let effectiveCountry = country;
  if (!effectiveCountry && regionId) {
    effectiveCountry = getCountryFromRegionId(regionId);
  }

  if (effectiveCountry) {
    if (!s.country) return false;
    const sc = s.country.trim().toLowerCase();
    const ec = effectiveCountry.trim().toLowerCase();
    if (ec === 'european union') {
      const euCountries = [
        'germany',
        'france',
        'netherlands',
        'italy',
        'spain',
        'sweden',
        'belgium',
        'european union',
        'europe',
      ];
      if (!euCountries.includes(sc)) return false;
    } else if (sc !== ec) {
      return false;
    }
  }

  if (regionId && !regionId.endsWith('-ALL')) {
    const r = regionId.toUpperCase();
    const text = `${s.name || ''} ${s.region || ''} ${s.city || ''} ${s.locationArea || ''} ${s.address || ''}`.toLowerCase();

    if (r === 'MM-YGN') return text.includes('yangon');
    if (r === 'MM-MDY') return text.includes('mandalay');
    if (r === 'MM-SHN') return text.includes('shan') || text.includes('taunggyi') || text.includes('inle') || text.includes('nyaungshwe');
    if (r === 'MM-BGO') return text.includes('bago') || text.includes('pyay');
    if (r === 'MM-AYY') return text.includes('ayeyarwady') || text.includes('pathein');
    if (r === 'MM-MON') return text.includes('mon') || text.includes('mawlamyine');
    if (r === 'MM-KRN') return text.includes('kayin') || text.includes('hpa-an') || text.includes('karen');

    if (r === 'TH-BKK') return text.includes('bangkok') || text.includes('pratunam') || text.includes('silom');
    if (r === 'TH-CNX') return text.includes('chiang mai') || text.includes('nimman');
    if (r === 'TH-MSOT') return text.includes('mae sot') || text.includes('border');

    if (r === 'US-SF') return text.includes('san francisco') || text.includes('oakland') || text.includes('fremont') || text.includes('berkeley') || text.includes('san jose') || text.includes('bay area');
    if (r === 'US-LA') return text.includes('los angeles') || text.includes('alhambra') || text.includes('silver lake') || text.includes('socal');
    if (r === 'US-NYC') return text.includes('new york') || text.includes('queens') || text.includes('elmhurst') || text.includes('manhattan') || text.includes('brooklyn');
    if (r === 'US-TX') return text.includes('texas') || text.includes('houston') || text.includes('dallas');
    if (r === 'US-DC') return text.includes('washington') || text.includes('virginia');
    if (r === 'US-FW') return text.includes('indiana') || text.includes('fort wayne') || text.includes('indianapolis');

    if (r === 'EU-DE') return text.includes('germany') || text.includes('berlin') || text.includes('munich') || text.includes('frankfurt');
    if (r === 'EU-FR') return text.includes('france') || text.includes('paris') || text.includes('lyon');
    if (r === 'EU-NL') return text.includes('netherlands') || text.includes('amsterdam') || text.includes('rotterdam');
    if (r === 'EU-IT') return text.includes('italy') || text.includes('rome') || text.includes('milan');
    if (r === 'EU-ES') return text.includes('spain') || text.includes('madrid') || text.includes('barcelona');

    if (r === 'GB-LDN') return text.includes('london') || text.includes('soho') || text.includes('shoreditch') || text.includes('camden') || text.includes('brixton');
    if (r === 'GB-MAN') return text.includes('manchester');
    if (r === 'GB-BIR') return text.includes('birmingham');
    if (r === 'GB-EDI') return text.includes('edinburgh') || text.includes('scotland');

    if (r === 'JP-TYO') return text.includes('tokyo') || text.includes('takadanobaba') || text.includes('shinjuku') || text.includes('ikebukuro') || text.includes('shibuya');
    if (r === 'JP-YOK') return text.includes('yokohama') || text.includes('kanagawa');
    if (r === 'JP-OSA') return text.includes('osaka');

    if (r === 'AU-SYD') return text.includes('sydney') || text.includes('cabramatta') || text.includes('marrickville') || text.includes('parramatta');
    if (r === 'AU-MEL') return text.includes('melbourne') || text.includes('richmond') || text.includes('fitzroy') || text.includes('footscray');

    if (r === 'KR-SEL') return text.includes('seoul') || text.includes('itaewon') || text.includes('hongdae') || text.includes('gangnam');
    if (r === 'KR-INC') return text.includes('incheon') || text.includes('bupyeong');
    if (r === 'KR-ANS') return text.includes('ansan');
    if (r === 'KR-BUS') return text.includes('busan');

    return true;
  }
  return true;
}

export interface FeedFilterParams {
  query?: string;
  menuType?: MenuType | 'ALL';
  category?: string;
  isVegetarian?: boolean;
  isHalal?: boolean;
  shopId?: string;
}

export function filterMenuItems(items: MenuItem[], params: FeedFilterParams): MenuItem[] {
  return items.filter((item) => {
    // Search query check
    if (params.query && params.query.trim() !== '') {
      const q = params.query.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchShop = (item.shopName || '').toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchShop && !matchCat) {
        return false;
      }
    }

    // Menu type filter
    if (params.menuType && params.menuType !== 'ALL') {
      if (item.menuType !== params.menuType) {
        return false;
      }
    }

    // Category filter
    if (params.category && params.category !== 'ALL') {
      if (item.category.toLowerCase() !== params.category.toLowerCase()) {
        return false;
      }
    }

    // Vegetarian filter
    if (params.isVegetarian) {
      if (!item.isVegetarian) {
        return false;
      }
    }

    // Halal filter
    if (params.isHalal) {
      if (!item.isHalal) {
        return false;
      }
    }

    // Shop ID filter
    if (params.shopId) {
      if (item.shopId !== params.shopId) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Construct safe direct contact deep links
 */
export function buildContactLinks(contact: {
  whatsappPhone?: string;
  viberPhone?: string;
  lineId?: string;
  facebookUrl?: string;
  phoneNumber?: string;
  itemTitle?: string;
  shopName?: string;
}) {
  const message = contact.itemTitle 
    ? encodeURIComponent(`Hello! I saw "${contact.itemTitle}" on BurMeal and would like to order/inquire.`)
    : encodeURIComponent(`Hello! I saw ${contact.shopName || 'your shop'} on BurMeal and would like to check your menu.`);

  // WhatsApp
  let whatsappUrl: string | null = null;
  if (contact.whatsappPhone) {
    const cleanNumber = contact.whatsappPhone.replace(/[^0-9]/g, '');
    whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
  }

  // Viber
  let viberUrl: string | null = null;
  if (contact.viberPhone) {
    const cleanViber = contact.viberPhone.replace(/[^0-9]/g, '');
    viberUrl = `viber://chat?number=%2B${cleanViber}`;
  }

  // Line
  let lineUrl: string | null = null;
  if (contact.lineId) {
    if (contact.lineId.startsWith('http')) {
      lineUrl = contact.lineId;
    } else {
      lineUrl = `https://line.me/R/ti/p/~${contact.lineId.replace('@', '')}`;
    }
  }

  // Facebook
  let fbUrl: string | null = null;
  if (contact.facebookUrl) {
    fbUrl = contact.facebookUrl.startsWith('http') 
      ? contact.facebookUrl 
      : `https://${contact.facebookUrl}`;
  }

  // Phone Call
  let telUrl: string | null = null;
  if (contact.phoneNumber) {
    telUrl = `tel:${contact.phoneNumber.replace(/[^0-9+]/g, '')}`;
  }

  return {
    whatsappUrl,
    viberUrl,
    lineUrl,
    fbUrl,
    telUrl,
  };
}

/**
 * Format price in local currency format relative to country or region
 */
export function formatPrice(amount: number, countryOrRegion?: string): string {
  const currency = getCurrencyForCountry(countryOrRegion);
  const num = typeof amount === 'number' ? amount : parseFloat(amount as any) || 0;

  if (currency.code === 'MMK') {
    const val = num < 50 ? Math.round(num * 1000) : Math.round(num);
    return `${val.toLocaleString()} Ks`;
  }
  if (currency.code === 'JPY') {
    const val = num < 50 ? Math.round(num * 130) : Math.round(num);
    return `¥${val.toLocaleString()}`;
  }
  if (currency.code === 'KRW') {
    const val = num < 50 ? Math.round(num * 1300) : Math.round(num);
    return `₩${val.toLocaleString()}`;
  }
  if (currency.code === 'THB') {
    const val = num < 20 ? num * 25 : num;
    return `฿${val.toFixed(2)}`;
  }
  if (currency.code === 'SGD') {
    return `S$${num.toFixed(2)}`;
  }
  if (currency.code === 'MYR') {
    const val = num < 10 ? num * 3 : num;
    return `RM ${val.toFixed(2)}`;
  }
  if (currency.code === 'GBP') {
    return `£${num.toFixed(2)}`;
  }
  if (currency.code === 'EUR') {
    return `€${num.toFixed(2)}`;
  }
  if (currency.code === 'AUD') {
    const val = num < 10 ? num * 1.5 : num;
    return `A$${val.toFixed(2)}`;
  }
  return `$${num.toFixed(2)}`;
}
