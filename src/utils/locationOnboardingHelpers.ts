import { parseShareTargetFromSearch } from './shareHelpers';

export type LocationOnboardingStep = 'intro' | 'select';

export function shouldForceRegionOnboarding(
  storedCountry: string | null | undefined,
  storedRegionId: string | null | undefined,
  search: string
): boolean {
  const target = parseShareTargetFromSearch(search);
  if (target.itemId || target.shopId) {
    return false;
  }
  const hasCountry = Boolean(storedCountry && storedCountry.trim().length > 0);
  const hasRegion = Boolean(storedRegionId && storedRegionId.trim().length > 0);
  return !(hasCountry && hasRegion);
}

export function canConfirmLocationSelection(country: string, regionId: string): boolean {
  return Boolean(country.trim().length > 0 && regionId.trim().length > 0);
}

export function getInitialOnboardingStep(hasChosenLocation: boolean): LocationOnboardingStep {
  return hasChosenLocation ? 'select' : 'intro';
}

export function getLocationSelectionStatus(
  activeCountry: string,
  activeRegionName: string | undefined,
  canConfirm: boolean
): string {
  if (!activeCountry.trim()) {
    return 'Select a country first, then pick your region.';
  }
  if (!canConfirm || !activeRegionName) {
    return `${activeCountry} selected — choose a region to continue.`;
  }
  return `${activeCountry} · ${activeRegionName}`;
}
