import { MenuItem, MenuType } from '../types';
import { getCurrencyForCountry } from './countries';

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
