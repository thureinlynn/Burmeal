export const DEFAULT_PLACEHOLDER_COVER = '/src/assets/images/burmeal_hero_spread_1793906769541.jpg';

export const GENERATED_FOOD_COVER_DESIGNS: readonly string[] = [
  '/src/assets/images/food_cover_spices_1794568119927.jpg',
  '/src/assets/images/food_cover_kitchen_1794568119889.jpg',
  '/src/assets/images/food_cover_noodles_1794568120548.jpg',
  '/src/assets/images/food_cover_wok_1794568120622.jpg',
  '/src/assets/images/food_cover_teahouse_1794568121014.jpg',
];

export function isDefaultCoverImage(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  return url.trim() === DEFAULT_PLACEHOLDER_COVER;
}

export function pickRandomFoodCoverDesign(
  excludeUrl?: string,
  randomFn: () => number = Math.random
): string {
  const candidates = excludeUrl
    ? GENERATED_FOOD_COVER_DESIGNS.filter((img) => img !== excludeUrl)
    : GENERATED_FOOD_COVER_DESIGNS;
  const pool = candidates.length > 0 ? candidates : GENERATED_FOOD_COVER_DESIGNS;
  const raw = randomFn();
  const clamped = Math.min(Math.max(Number.isFinite(raw) ? raw : 0, 0), 0.999999);
  const index = Math.floor(clamped * pool.length);
  return pool[index];
}

export function resolveCoverDesign(
  coverImage?: string | null,
  randomFn: () => number = Math.random
): string {
  if (!isDefaultCoverImage(coverImage)) {
    return (coverImage as string).trim();
  }
  return pickRandomFoodCoverDesign(undefined, randomFn);
}
