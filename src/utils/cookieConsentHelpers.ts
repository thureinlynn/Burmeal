export const COOKIE_CONSENT_STORAGE_KEY = 'burmeal_cookie_consent';
export const COOKIE_CONSENT_COOKIE_NAME = 'burmeal_cookie_consent';
export const COOKIE_CONSENT_VERSION = 1;

export type CookieConsentStatus = 'accepted' | 'essential_only';

export interface CookieConsentPreferences {
  status: CookieConsentStatus;
  essential: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
  version: number;
}

export type CookieConsentChoice =
  | 'all'
  | 'essential'
  | {
      preferences: boolean;
      analytics: boolean;
    };

export interface CookieStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
}

export function buildCookieConsentPreferences(
  choice: CookieConsentChoice,
  nowIso: string = new Date().toISOString()
): CookieConsentPreferences {
  if (choice === 'all') {
    return {
      status: 'accepted',
      essential: true,
      preferences: true,
      analytics: true,
      updatedAt: nowIso,
      version: COOKIE_CONSENT_VERSION,
    };
  }

  if (choice === 'essential') {
    return {
      status: 'essential_only',
      essential: true,
      preferences: false,
      analytics: false,
      updatedAt: nowIso,
      version: COOKIE_CONSENT_VERSION,
    };
  }

  const hasOptional = Boolean(choice.preferences || choice.analytics);
  return {
    status: hasOptional ? 'accepted' : 'essential_only',
    essential: true,
    preferences: Boolean(choice.preferences),
    analytics: Boolean(choice.analytics),
    updatedAt: nowIso,
    version: COOKIE_CONSENT_VERSION,
  };
}

export function parseCookieConsent(raw: string | null | undefined): CookieConsentPreferences | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed.status !== 'accepted' && parsed.status !== 'essential_only')
    ) {
      return null;
    }
    return {
      status: parsed.status,
      essential: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      version: typeof parsed.version === 'number' ? parsed.version : COOKIE_CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

export function getStoredCookieConsent(
  storage: CookieStorageLike | null | undefined
): CookieConsentPreferences | null {
  if (!storage) return null;
  try {
    return parseCookieConsent(storage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function buildConsentCookieString(prefs: CookieConsentPreferences): string {
  const summary = prefs.status === 'accepted' ? 'all' : 'essential';
  return `${COOKIE_CONSENT_COOKIE_NAME}=${summary}; path=/; max-age=31536000; SameSite=Lax`;
}

export function saveCookieConsent(
  storage: CookieStorageLike | null | undefined,
  choice: CookieConsentChoice,
  docCookieSetter?: (cookieStr: string) => void
): CookieConsentPreferences {
  const prefs = buildCookieConsentPreferences(choice);
  if (storage) {
    try {
      storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota / privacy mode failures
    }
  }
  if (docCookieSetter) {
    try {
      docCookieSetter(buildConsentCookieString(prefs));
    } catch {
      // Ignore cookie write errors
    }
  }
  return prefs;
}

export function shouldShowCookiePopup(params: {
  consent: CookieConsentPreferences | null;
  isOnboardingBlocking: boolean;
}): boolean {
  return params.consent === null && !params.isOnboardingBlocking;
}
