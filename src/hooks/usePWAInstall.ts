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

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
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

  useEffect(() => {
    const checkStandalone = () => {
      const mql = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
      const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
      setIsInstalled(isStandaloneDisplayMode(mql, navStandalone));
    };

    checkStandalone();
    setPlatform(detectInstallPlatform(window.navigator.userAgent));

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = () => checkStandalone();
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
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

  const install = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return 'accepted';
    }
    return 'dismissed';
  };

  const dismiss = () => {
    setIsDismissed(true);
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
    platform,
    install,
    dismiss,
  };
}
