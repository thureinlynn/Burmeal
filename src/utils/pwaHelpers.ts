export type InstallPlatform = 'ios' | 'android' | 'desktop';

export function isStandaloneDisplayMode(
  matchMediaStandalone: boolean,
  navigatorStandalone?: boolean
): boolean {
  return Boolean(matchMediaStandalone || navigatorStandalone === true);
}

export function detectInstallPlatform(userAgent: string): InstallPlatform {
  const ua = (userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }
  return 'desktop';
}

export function shouldShowInstallAlert(params: {
  isInstalled: boolean;
  isDismissed: boolean;
}): boolean {
  return !params.isInstalled && !params.isDismissed;
}

export function shouldShowFirstTimeInstallPopup(params: {
  isInstalled: boolean;
  isDismissed: boolean;
  hasSeenFirstTimePrompt: boolean;
  isBlockedByOtherModal: boolean;
}): boolean {
  return (
    !params.isInstalled &&
    !params.isDismissed &&
    !params.hasSeenFirstTimePrompt &&
    !params.isBlockedByOtherModal
  );
}

export function getInstallReadinessInfo(params: {
  isInstallable: boolean;
  platform: InstallPlatform;
}): {
  badgeText: string;
  headline: string;
  description: string;
  ctaLabel: string;
  isNativeReady: boolean;
} {
  if (params.isInstallable) {
    return {
      badgeText: 'Ready to Install',
      headline: 'BurMeal App is Ready on Your Device',
      description:
        'Tap Install App for one-tap installation with full-screen mobile access and no browser address bar.',
      ctaLabel: 'Install App Now',
      isNativeReady: true,
    };
  }

  if (params.platform === 'ios') {
    return {
      badgeText: 'iOS Home Screen Ready',
      headline: 'Install BurMeal on iPhone / iPad',
      description:
        'Ready to add to your Home Screen for full-screen mobile access with no Safari address bar.',
      ctaLabel: 'Install on iPhone / iPad',
      isNativeReady: false,
    };
  }

  if (params.platform === 'android') {
    return {
      badgeText: 'Android App Ready',
      headline: 'Install BurMeal on Android',
      description:
        'Ready to install on your device for full-screen mobile access with no browser address bar.',
      ctaLabel: 'Install App',
      isNativeReady: false,
    };
  }

  return {
    badgeText: 'Ready to Install',
    headline: 'Install BurMeal on Your Device',
    description:
      'App is not installed yet — install to your device for full-screen access with no address bar.',
    ctaLabel: 'Install App',
    isNativeReady: false,
  };
}

export function getInstallInstructions(platform: InstallPlatform): {
  title: string;
  subtitle: string;
  steps: string[];
} {
  if (platform === 'ios') {
    return {
      title: 'Install BurMeal on iPhone / iPad',
      subtitle: 'Launch full-screen from your Home Screen with no Safari address bar.',
      steps: [
        'Tap the Share icon at the bottom of Safari.',
        'Scroll down and choose "Add to Home Screen".',
        'Tap "Add" in the top-right corner, then open BurMeal from your Home Screen.',
      ],
    };
  }

  if (platform === 'android') {
    return {
      title: 'Install BurMeal on Android',
      subtitle: 'Launch BurMeal as a standalone mobile app without the browser bar.',
      steps: [
        'Tap the browser menu (⋮) in the top-right corner of Chrome.',
        'Tap "Install app" or "Add to Home screen".',
        'Confirm by tapping "Install" to add BurMeal to your app drawer.',
      ],
    };
  }

  return {
    title: 'Install BurMeal App',
    subtitle: 'Run BurMeal in a standalone app window with no browser address bar.',
    steps: [
      'Click the Install icon on the right side of your browser address bar, or open the browser menu (⋮).',
      'Select "Install BurMeal" / "Install page as app".',
      'Confirm installation to launch BurMeal in its own standalone window.',
    ],
  };
}
