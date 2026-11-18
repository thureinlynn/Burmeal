import { MenuItem, MenuType } from '../types';

export const MENU_ITEM_MAX_PER_TYPE = 6;
export const LIMITED_MENU_TYPES = ['WEEKLY', 'PERMANENT'] as const;
export type LimitedMenuType = (typeof LIMITED_MENU_TYPES)[number];

export interface MenuItemLimitValidationResult {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  remaining: number;
  error?: string;
}

export interface MenuSlotSummary {
  weeklyCount: number;
  regularCount: number;
  maxPerType: number;
  isWeeklyFull: boolean;
  isRegularFull: boolean;
  areBothFull: boolean;
}

export function isLimitedMenuType(menuType: unknown): menuType is LimitedMenuType {
  return menuType === 'WEEKLY' || menuType === 'PERMANENT';
}

export function getMenuTypeDisplayLabel(menuType: MenuType): string {
  if (menuType === 'WEEKLY') return 'Weekly';
  if (menuType === 'PERMANENT') return 'Regular Menu';
  if (menuType === 'SPECIAL') return 'Daily Special';
  return 'All Menu';
}

export function countMenuItemsByType(
  items: Array<Pick<MenuItem, 'id' | 'menuType'>>,
  targetMenuType: MenuType,
  excludeItemId?: string | null
): number {
  return items.reduce((count, item) => {
    if (!item) return count;
    if (excludeItemId && item.id === excludeItemId) return count;
    return item.menuType === targetMenuType ? count + 1 : count;
  }, 0);
}

export function validateMenuItemLimit(
  items: Array<Pick<MenuItem, 'id' | 'menuType'>>,
  targetMenuType: MenuType,
  excludeItemId?: string | null
): MenuItemLimitValidationResult {
  if (!isLimitedMenuType(targetMenuType)) {
    return {
      allowed: true,
      currentCount: 0,
      maxLimit: MENU_ITEM_MAX_PER_TYPE,
      remaining: MENU_ITEM_MAX_PER_TYPE,
    };
  }

  const currentCount = countMenuItemsByType(items, targetMenuType, excludeItemId);
  const allowed = currentCount < MENU_ITEM_MAX_PER_TYPE;
  const remaining = Math.max(0, MENU_ITEM_MAX_PER_TYPE - currentCount);

  if (!allowed) {
    const label = getMenuTypeDisplayLabel(targetMenuType);
    return {
      allowed: false,
      currentCount,
      maxLimit: MENU_ITEM_MAX_PER_TYPE,
      remaining: 0,
      error: `${label} is limited to ${MENU_ITEM_MAX_PER_TYPE} items per shop (${currentCount}/${MENU_ITEM_MAX_PER_TYPE}). Delete or move an existing ${label} item first.`,
    };
  }

  return {
    allowed: true,
    currentCount,
    maxLimit: MENU_ITEM_MAX_PER_TYPE,
    remaining,
  };
}

export function canSaveMenuItemForType(
  items: Array<Pick<MenuItem, 'id' | 'menuType'>>,
  targetMenuType: MenuType,
  excludeItemId?: string | null
): boolean {
  return validateMenuItemLimit(items, targetMenuType, excludeItemId).allowed;
}

export function getRemainingSlotsForMenuType(
  items: Array<Pick<MenuItem, 'id' | 'menuType'>>,
  targetMenuType: MenuType
): number {
  return validateMenuItemLimit(items, targetMenuType).remaining;
}

export function getMenuSlotSummary(
  items: Array<Pick<MenuItem, 'id' | 'menuType'>>
): MenuSlotSummary {
  const weeklyCount = countMenuItemsByType(items, 'WEEKLY');
  const regularCount = countMenuItemsByType(items, 'PERMANENT');
  const isWeeklyFull = weeklyCount >= MENU_ITEM_MAX_PER_TYPE;
  const isRegularFull = regularCount >= MENU_ITEM_MAX_PER_TYPE;

  return {
    weeklyCount,
    regularCount,
    maxPerType: MENU_ITEM_MAX_PER_TYPE,
    isWeeklyFull,
    isRegularFull,
    areBothFull: isWeeklyFull && isRegularFull,
  };
}
