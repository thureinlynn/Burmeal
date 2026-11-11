import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  Bell,
  ShieldCheck,
  Leaf,
  DollarSign,
  Info,
  Check,
  Store,
  LogOut,
  User,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Platform setting states
  const [prioritizeHalal, setPrioritizeHalal] = useState(() => {
    return localStorage.getItem('burmeal_pref_halal') === 'true';
  });
  const [prioritizeVeg, setPrioritizeVeg] = useState(() => {
    return localStorage.getItem('burmeal_pref_veg') === 'true';
  });
  const [notifyDaily, setNotifyDaily] = useState(() => {
    return localStorage.getItem('burmeal_pref_notify') !== 'false';
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleToggleHalal = () => {
    const val = !prioritizeHalal;
    setPrioritizeHalal(val);
    localStorage.setItem('burmeal_pref_halal', String(val));
    triggerFeedback();
  };

  const handleToggleVeg = () => {
    const val = !prioritizeVeg;
    setPrioritizeVeg(val);
    localStorage.setItem('burmeal_pref_veg', String(val));
    triggerFeedback();
  };

  const handleToggleNotify = () => {
    const val = !notifyDaily;
    setNotifyDaily(val);
    localStorage.setItem('burmeal_pref_notify', String(val));
    triggerFeedback();
  };

  const triggerFeedback = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <span>{t.settingsTitle}</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {t.settingsDesc}
        </p>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* 1. Appearance / Theme */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{t.appearanceTheme}</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
              theme === 'light'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{t.lightMode}</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>{t.darkMode}</span>
          </button>
        </div>
      </div>

      {/* 2. Language Selection */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{t.languageSelection}</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => {
              setLang('en');
              triggerFeedback();
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
              lang === 'en'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/20'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'
            }`}
          >
            <span className="text-sm">🇺🇸</span>
            <span>{t.english}</span>
            {lang === 'en' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ml-1" />}
          </button>
          <button
            onClick={() => {
              setLang('my');
              triggerFeedback();
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
              lang === 'my'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-500/20'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'
            }`}
          >
            <span className="text-sm">🇲🇲</span>
            <span>{t.burmese}</span>
            {lang === 'my' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ml-1" />}
          </button>
        </div>
      </div>

      {/* 3. Food Dietary Preferences */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>{t.dietaryPreferences}</span>
        </h2>
        <div className="space-y-2.5 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium text-stone-800 dark:text-stone-200">{t.showHalalBadge}</span>
            </div>
            <input
              type="checkbox"
              checked={prioritizeHalal}
              onChange={handleToggleHalal}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-stone-800 dark:text-stone-200">{t.showVegBadge}</span>
            </div>
            <input
              type="checkbox"
              checked={prioritizeVeg}
              onChange={handleToggleVeg}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* 4. Notifications & Fresh Alerts */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          <span>{t.notifications}</span>
        </h2>
        <label className="flex items-center justify-between p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 cursor-pointer">
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">{t.dailySpecialAlerts}</span>
          <input
            type="checkbox"
            checked={notifyDaily}
            onChange={handleToggleNotify}
            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
          />
        </label>
      </div>

      {/* 5. Account & Session Status (if logged in) */}
      {user && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {user.role === 'SHOP_OWNER' ? (
              <Store className="w-4 h-4 text-amber-600" />
            ) : (
              <User className="w-4 h-4 text-amber-600" />
            )}
            <span>
              {user.role === 'SHOP_OWNER' ? 'Shop Owner Account' : 'Customer Account'}
            </span>
          </h2>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{user.name}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-700 dark:hover:text-rose-300 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>
      )}
      {/* App Info Footer */}
      <div className="text-center text-xs text-stone-400 dark:text-stone-500 pt-2 flex items-center justify-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        <span>{t.appVersion} · Food Discovery & Direct Ordering</span>
      </div>
    </div>
  );
};
