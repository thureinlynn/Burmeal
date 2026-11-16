import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  getInstallInstructions,
  getInstallReadinessInfo,
  shouldShowFirstTimeInstallPopup,
  shouldShowInstallAlert,
} from '../utils/pwaHelpers';

interface PWAInstallBannerProps {
  isBlockedByOtherModal?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isBlockedByOtherModal = false,
}) => {
  const {
    isInstallable,
    isInstalled,
    isDismissed,
    hasSeenFirstTimePrompt,
    platform,
    install,
    dismiss,
    acknowledgeFirstTimePrompt,
  } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const showTopAlert = shouldShowInstallAlert({ isInstalled, isDismissed });
  const showFirstTimePopup = shouldShowFirstTimeInstallPopup({
    isInstalled,
    isDismissed,
    hasSeenFirstTimePrompt,
    isBlockedByOtherModal: isBlockedByOtherModal || showGuideModal,
  });

  if (!showTopAlert && !showFirstTimePopup && !showGuideModal) {
    return null;
  }

  const handleInstallClick = async () => {
    const result = await install();
    if (result === 'unavailable') {
      acknowledgeFirstTimePrompt();
      setShowGuideModal(true);
    }
  };

  const readiness = getInstallReadinessInfo({ isInstallable, platform });
  const guide = getInstallInstructions(platform);

  return (
    <>
      {showTopAlert && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3">
          <div
            role="alert"
            data-testid="pwa-install-alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 px-3.5 py-2.5 shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_seoyymseoyymseoy_d7564f40.png"
                alt="BurMeal App Icon"
                className="w-9 h-9 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-white dark:bg-stone-900 p-1 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex flex-wrap items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{readiness.headline}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {readiness.badgeText}
                  </span>
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug mt-0.5">
                  {readiness.description}
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
                <span>{readiness.ctaLabel}</span>
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
      )}

      {/* First-Time User Ready-to-Install Device Alert Popup */}
      {showFirstTimePopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-first-time-title"
          data-testid="pwa-first-time-popup"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_seoyymseoyymseoy_d7564f40.png"
                  alt="BurMeal App"
                  className="w-11 h-11 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-stone-800 p-1.5 shrink-0 object-contain"
                />
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{readiness.badgeText}</span>
                  </span>
                  <h3
                    id="pwa-first-time-title"
                    className="text-base font-extrabold font-display text-stone-900 dark:text-stone-100 mt-0.5"
                  >
                    Install BurMeal App
                  </h3>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close first-time install prompt"
                onClick={acknowledgeFirstTimePrompt}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {readiness.description}
            </p>

            <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Opens full-screen with no browser address bar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>One-tap access directly from your device Home Screen</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Cached menus stay viewable even on slow connections</span>
              </li>
            </ul>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                data-testid="pwa-first-time-later-button"
                onClick={acknowledgeFirstTimePrompt}
                className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                type="button"
                data-testid="pwa-first-time-install-button"
                onClick={handleInstallClick}
                className="flex-[1.5] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{readiness.ctaLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                  src="/assets/aistudio/Gemini_Generated_Image_seoyymseoyymseoy_d7564f40.png"
                  alt="BurMeal App"
                  className="w-10 h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-1 shrink-0 object-contain"
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
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
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
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-amber-600 dark:bg-stone-800 dark:text-stone-100 dark:border dark:border-stone-700 dark:hover:bg-amber-600 dark:hover:border-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
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
