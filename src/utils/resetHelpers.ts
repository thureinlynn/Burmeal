export const APP_RESET_EPOCH = '2026-11-14-fresh-start-v1';
export const RESET_EPOCH_STORAGE_KEY = 'burmeal_reset_epoch';

export const BURMEAL_STORAGE_KEYS = [
  'burmeal_token',
  'burmeal_shop_id',
  'burmeal_user_data',
  'burmeal_delta_v3',
  'burmeal_country',
  'burmeal_region_id',
  'burmeal_pref_halal',
  'burmeal_pref_veg',
  'burmeal_pref_notify',
  'burmeal_lang',
  'burmeal_theme',
  'burmeal_cookie_consent',
  'burmeal_pwa_first_prompt_seen',
] as const;

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface ClientResetResult {
  didReset: boolean;
  epoch: string;
}

/**
 * Clears all persisted BurMeal browser state once per APP_RESET_EPOCH so
 * existing browsers start with a clean signed-out & fresh onboarding state.
 */
export function applyOneTimeClientReset(storage: StorageLike | null | undefined): ClientResetResult {
  if (!storage) {
    return { didReset: false, epoch: APP_RESET_EPOCH };
  }

  try {
    const appliedEpoch = storage.getItem(RESET_EPOCH_STORAGE_KEY);
    if (appliedEpoch === APP_RESET_EPOCH) {
      return { didReset: false, epoch: APP_RESET_EPOCH };
    }

    for (const key of BURMEAL_STORAGE_KEYS) {
      storage.removeItem(key);
    }
    storage.setItem(RESET_EPOCH_STORAGE_KEY, APP_RESET_EPOCH);
    return { didReset: true, epoch: APP_RESET_EPOCH };
  } catch {
    return { didReset: false, epoch: APP_RESET_EPOCH };
  }
}
