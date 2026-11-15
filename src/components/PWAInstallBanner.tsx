import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getInstallInstructions, shouldShowInstallAlert } from '../utils/pwaHelpers';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, isDismissed, platform, install, dismiss } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (!shouldShowInstallAlert({ isInstalled, isDismissed })) {
    return null;
  }

  const handleInstallClick = async () => {
    const result = await install();
    if (result === 'unavailable') {
      setShowGuideModal(true);
    }
  };

  const guide = getInstallInstructions(platform);

  return (
    <>
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3">
        <div
          role="alert"
          data-testid="pwa-install-alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 px-3.5 py-2.5 shadow-2xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="BurMeal App Icon"
              className="w-9 h-9 rounded-xl border border-amber-200 dark:border-amber-800 bg-white shrink-0 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Install BurMeal App</span>
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                App is not installed yet — install to your home screen for full-screen mobile access with no address bar.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              data-testid="pwa-install-button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install alert"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="pwa-install-guide-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pwa-192x192.png"
                  alt="BurMeal App"
                  className="w-10 h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {guide.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {guide.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close install instructions"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-2 text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/70 rounded-xl p-3.5 border border-stone-200/70 dark:border-stone-700/60">
              {guide.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-amber-600 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-500 dark:hover:text-white text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached content shown.</span>
    </div>
  );
};
