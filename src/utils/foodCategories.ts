export const DEFAULT_FOOD_CATEGORY = 'Noodles & Broth';

export const FOOD_CATEGORIES: readonly string[] = [
  'Noodles & Broth',
  'Shan & Regional Noodles',
  'Burmese Curries & Stews',
  'Rice & Biryani',
  'Rice & Main Dishes',
  'Salads & Let-Thoke',
  'Salads & Snacks',
  'Street Food & Fritters',
  'Grilled, BBQ & Roasted',
  'Stir-Fry & Wok Dishes',
  'Breakfast Specials',
  'Soups & Hot Pot',
  'Pickles, Pastes & Sides',
  'Desserts & Traditional Sweets',
  'Tea, Coffee & Beverages',
];

export const FILTER_CATEGORIES: readonly string[] = ['ALL', ...FOOD_CATEGORIES];

export function getMenuItemCategoryOptions(currentCategory?: string | null): string[] {
  const trimmed = typeof currentCategory === 'string' ? currentCategory.trim() : '';
  if (!trimmed || FOOD_CATEGORIES.includes(trimmed)) {
    return [...FOOD_CATEGORIES];
  }
  return [trimmed, ...FOOD_CATEGORIES];
}
