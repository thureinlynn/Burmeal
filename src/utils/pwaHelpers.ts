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
