import { useEffect, useState } from 'react';
import {
  detectInstallPlatform,
  InstallPlatform,
  isStandaloneDisplayMode,
} from '../utils/pwaHelpers';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_SESSION_KEY = 'burmeal_pwa_alert_dismissed';
const FIRST_PROMPT_SEEN_KEY = 'burmeal_pwa_first_prompt_seen';

declare global {
  interface Window {
    __burmealDeferredPrompt?: BeforeInstallPromptEvent | null;
    __burmealAppInstalled?: boolean;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.__burmealDeferredPrompt || null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.__burmealAppInstalled) return true;
    const mql = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
    const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
    return isStandaloneDisplayMode(mql, navStandalone);
  });
  const [platform, setPlatform] = useState<InstallPlatform>(() => {
    if (typeof navigator === 'undefined') return 'desktop';
    return detectInstallPlatform(navigator.userAgent);
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(DISMISS_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [hasSeenFirstTimePrompt, setHasSeenFirstTimePrompt] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(FIRST_PROMPT_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkStandalone = () => {
      if (window.__burmealAppInstalled) {
        setIsInstalled(true);
        return;
      }
      const mql = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
      const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
      setIsInstalled(isStandaloneDisplayMode(mql, navStandalone));
    };

    checkStandalone();
    setPlatform(detectInstallPlatform(window.navigator.userAgent));

    if (window.__burmealDeferredPrompt) {
      setDeferredPrompt(window.__burmealDeferredPrompt);
    }

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = () => checkStandalone();
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const bipEvent = e as BeforeInstallPromptEvent;
      window.__burmealDeferredPrompt = bipEvent;
      setDeferredPrompt(bipEvent);
    };

    const handleAppInstalled = () => {
      window.__burmealAppInstalled = true;
      window.__burmealDeferredPrompt = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        window.localStorage.setItem(FIRST_PROMPT_SEEN_KEY, '1');
        setHasSeenFirstTimePrompt(true);
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const acknowledgeFirstTimePrompt = () => {
    setHasSeenFirstTimePrompt(true);
    try {
      window.localStorage.setItem(FIRST_PROMPT_SEEN_KEY, '1');
    } catch {
      // Ignore storage failures
    }
  };

  const install = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = deferredPrompt || window.__burmealDeferredPrompt;
    if (!promptEvent) return 'unavailable';
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    acknowledgeFirstTimePrompt();
    if (outcome === 'accepted') {
      window.__burmealAppInstalled = true;
      window.__burmealDeferredPrompt = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
      return 'accepted';
    }
    return 'dismissed';
  };

  const dismiss = () => {
    setIsDismissed(true);
    acknowledgeFirstTimePrompt();
    try {
      window.sessionStorage.setItem(DISMISS_SESSION_KEY, '1');
    } catch {
      // Ignore storage failures in restricted contexts
    }
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isDismissed,
    hasSeenFirstTimePrompt,
    platform,
    install,
    dismiss,
    acknowledgeFirstTimePrompt,
  };
}
