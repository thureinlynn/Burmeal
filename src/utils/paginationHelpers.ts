import { MenuType } from '../types';

export const PAGE_LIMITS = {
  DAILY_SPECIAL: 10,
  WEEKLY_AND_MASTER: 14,
  SHOPS: 10,
  SAVED_ITEMS: 10,
  FOLLOWED_SHOPS: 10,
} as const;

export function getPageSizeForMenuType(menuType?: MenuType | string | null): number {
  if (menuType === 'SPECIAL') {
    return PAGE_LIMITS.DAILY_SPECIAL;
  }
  return PAGE_LIMITS.WEEKLY_AND_MASTER;
}

export function getInitialVisibleLimit(initialSize: number, totalCount: number): number {
  const safeInitial = Math.max(0, Math.floor(initialSize));
  const safeTotal = Math.max(0, Math.floor(totalCount));
  return Math.min(safeInitial, safeTotal);
}

export function getNextVisibleLimit(
  currentLimit: number,
  totalCount: number,
  incrementSize: number
): number {
  const safeCurrent = Math.max(0, Math.floor(currentLimit));
  const safeTotal = Math.max(0, Math.floor(totalCount));
  const safeIncrement = Math.max(1, Math.floor(incrementSize));
  return Math.min(safeTotal, safeCurrent + safeIncrement);
}

export function slicePaginatedItems<T>(items: readonly T[], visibleLimit: number): T[] {
  const safeLimit = Math.max(0, Math.floor(visibleLimit));
  return items.slice(0, safeLimit);
}

export function hasRemainingItems(visibleLimit: number, totalCount: number): boolean {
  const safeTotal = Math.max(0, Math.floor(totalCount));
  const safeLimit = Math.max(0, Math.floor(visibleLimit));
  return Math.min(safeLimit, safeTotal) < safeTotal;
}

export function isNearBottomForLoadMore(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
  thresholdPx: number = 280
): boolean {
  if (documentHeight <= 0 || viewportHeight <= 0) return false;
  return scrollY + viewportHeight >= documentHeight - thresholdPx;
}
