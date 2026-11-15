const LEGACY_MOCK_SHOP_IDS = new Set([
  'shop_01',
  'shop_02',
  'shop_03',
  'shop_04',
  'shop_05',
]);

const LEGACY_MOCK_ITEM_IDS = new Set([
  'item_10',
  'item_11',
  'item_12',
  'item_13',
]);

const LEGACY_MOCK_USER_IDS = new Set([
  'usr_admin_01',
  'usr_cust_01',
  'usr_owner_01',
  'usr_owner_02',
  'usr_owner_03',
  'usr_owner_04',
  'usr_owner_05',
]);

export function isSeededMockShopId(id?: string | null): boolean {
  if (!id) return false;
  return LEGACY_MOCK_SHOP_IDS.has(id) || /^shop_r\d+_\d+$/.test(id);
}

export function isSeededMockItemId(id?: string | null): boolean {
  if (!id) return false;
  return LEGACY_MOCK_ITEM_IDS.has(id) || /^item_shop_(0[1-5]|r\d+_\d+)_\d+$/.test(id);
}

export function isSeededMockUserId(id?: string | null): boolean {
  if (!id) return false;
  return LEGACY_MOCK_USER_IDS.has(id) || /^usr_owner_r\d+_\d+$/.test(id);
}

export function filterOutSeededMockShops<T extends { id?: string | null }>(shops: T[]): T[] {
  return shops.filter((s) => !isSeededMockShopId(s?.id));
}

export function filterOutSeededMockMenuItems<
  T extends { id?: string | null; shopId?: string | null }
>(items: T[]): T[] {
  return items.filter(
    (item) => !isSeededMockItemId(item?.id) && !isSeededMockShopId(item?.shopId)
  );
}
