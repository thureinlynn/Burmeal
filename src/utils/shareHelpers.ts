export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export function buildShareUrl(
  currentHref: string,
  target: { type: 'item' | 'shop'; id: string }
): string {
  const cleanId = (target.id || '').trim();
  try {
    const parsed = new URL(currentHref);
    parsed.searchParams.delete('item');
    parsed.searchParams.delete('shop');
    if (cleanId) {
      parsed.searchParams.set(target.type, cleanId);
    }
    return parsed.toString();
  } catch {
    const base = (currentHref || '/').split('?')[0].split('#')[0] || '/';
    return cleanId ? `${base}?${target.type}=${encodeURIComponent(cleanId)}` : base;
  }
}

export function parseShareTargetFromSearch(search: string): {
  itemId?: string;
  shopId?: string;
} {
  if (!search) return {};
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const itemId = params.get('item')?.trim() || undefined;
  const shopId = params.get('shop')?.trim() || undefined;
  return { itemId, shopId };
}

export function buildItemSharePayload(
  item: { id: string; title: string; shopName?: string },
  currentHref: string
): SharePayload {
  const url = buildShareUrl(currentHref, { type: 'item', id: item.id });
  const title = item.shopName ? `${item.title} — ${item.shopName} | BurMeal` : `${item.title} | BurMeal`;
  const text = item.shopName
    ? `Check out "${item.title}" from ${item.shopName} on BurMeal!`
    : `Check out "${item.title}" on BurMeal!`;
  return { title, text, url };
}

export function buildShopSharePayload(
  shop: { id: string; name: string; city?: string; country?: string },
  currentHref: string
): SharePayload {
  const url = buildShareUrl(currentHref, { type: 'shop', id: shop.id });
  const place = [shop.city, shop.country].filter(Boolean).join(', ');
  const title = `${shop.name} | BurMeal`;
  const text = place
    ? `Discover ${shop.name} (${place}) on BurMeal!`
    : `Discover ${shop.name} on BurMeal!`;
  return { title, text, url };
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function executeShare(
  payload: SharePayload,
  deps?: {
    share?: (data: SharePayload) => Promise<void>;
    writeText?: (text: string) => Promise<void>;
    execCopyFallback?: (text: string) => boolean;
  }
): Promise<ShareOutcome> {
  const shareFn =
    deps?.share ??
    (typeof navigator !== 'undefined' && typeof navigator.share === 'function'
      ? (data: SharePayload) => navigator.share(data)
      : undefined);

  if (shareFn) {
    try {
      await shareFn(payload);
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return 'cancelled';
      }
      // Fall through to clipboard copy when Web Share fails or is unsupported in iframe
    }
  }

  const writeTextFn =
    deps?.writeText ??
    (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function'
      ? (text: string) => navigator.clipboard.writeText(text)
      : undefined);

  if (writeTextFn) {
    try {
      await writeTextFn(payload.url);
      return 'copied';
    } catch {
      // Fall through to execCommand fallback
    }
  }

  if (deps?.execCopyFallback) {
    return deps.execCopyFallback(payload.url) ? 'copied' : 'failed';
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = payload.url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok ? 'copied' : 'failed';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
