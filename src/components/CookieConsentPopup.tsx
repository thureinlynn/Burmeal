import React, { useState } from 'react';
import { Cookie, Check, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import type { CookieConsentChoice } from '../utils/cookieConsentHelpers';

interface CookieConsentPopupProps {
  isOpen: boolean;
  onSelectConsent: (choice: CookieConsentChoice) => void;
}

export const CookieConsentPopup: React.FC<CookieConsentPopupProps> = ({
  isOpen,
  onSelectConsent,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [preferencesEnabled, setPreferencesEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      data-testid="cookie-consent-popup"
      className="fixed bottom-20 md:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-50 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-4 sm:p-5 space-y-3.5 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Cookie className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="cookie-consent-title"
            className="text-sm font-bold font-display text-stone-900 dark:text-stone-100"
          >
            Cookie Preferences
          </h2>
          <p
            id="cookie-consent-desc"
            className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed"
          >
            We use essential cookies to keep you signed in and remember your selected region, plus optional cookies to save theme and food discovery preferences.
          </p>
        </div>
      </div>

      {showOptions && (
        <div
          data-testid="cookie-options-panel"
          className="space-y-2 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 p-3 text-xs"
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-200/70 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Essential Cookies
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Always Active
            </span>
          </div>

          <label className="flex items-center justify-between gap-2 cursor-pointer py-0.5">
            <span className="text-stone-700 dark:text-stone-300 font-medium">
              Preferences (Language, Theme & Region)
            </span>
            <input
              type="checkbox"
              checked={preferencesEnabled}
              onChange={(e) => setPreferencesEnabled(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 cursor-pointer py-0.5">
            <span className="text-stone-700 dark:text-stone-300 font-medium">
              Experience & Discovery Insights
            </span>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <button
          type="button"
          data-testid="cookie-customize-toggle"
          aria-expanded={showOptions}
          onClick={() => setShowOptions((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showOptions ? 'Hide Options' : 'Options'}</span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            data-testid="cookie-essential-only"
            onClick={() => onSelectConsent('essential')}
            className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Essential Only
          </button>

          {showOptions ? (
            <button
              type="button"
              data-testid="cookie-save-preferences"
              onClick={() =>
                onSelectConsent({
                  preferences: preferencesEnabled,
                  analytics: analyticsEnabled,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          ) : (
            <button
              type="button"
              data-testid="cookie-accept-all"
              onClick={() => onSelectConsent('all')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Cookies</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
