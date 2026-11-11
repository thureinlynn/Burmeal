import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COUNTRIES, getCountryFlag } from '../utils/countries';
import {
  X,
  Lock,
  Mail,
  User,
  Store,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'CUSTOMER' | 'SHOP_OWNER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'CUSTOMER',
}) => {
  const { login, register, loginWithGoogle, switchDemoRole } = useAuth();
  const { t } = useLanguage();

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>(defaultRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [cuisineType, setCuisineType] = useState('Traditional Burmese Cuisine');
  const [locationArea, setLocationArea] = useState('Downtown Heritage District');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Yangon');
  const [region, setRegion] = useState('Yangon Region');
  const [country, setCountry] = useState('Myanmar');

  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    code?: string;
    message: string;
  } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorDetails(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await register({
          email,
          password,
          name,
          role,
          shopName,
          cuisineType,
          locationArea,
          address,
          city,
          region,
          country,
        });
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to register account');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to sign in');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dual Mode Role Picker at the Top */}
        <div className="mb-4">
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => {
                setRole('CUSTOMER');
                setError(null);
                setErrorDetails(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'CUSTOMER'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {t.loginAsCustomer}
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('SHOP_OWNER');
                setError(null);
                setErrorDetails(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'SHOP_OWNER'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {t.loginAsShop}
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 mb-1">
          {isSignUp ? t.signUp : t.signIn}
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
          {role === 'CUSTOMER'
            ? 'Browse menus, follow shops, and bookmark dishes with ease.'
            : 'Access your dedicated Shop Dashboard to manage daily/weekly specials.'}
        </p>

        {/* Diagnostic Error Panel or Standard Error */}
        {errorDetails?.code === 'auth/unauthorized-domain' ? (
          <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-stone-900 dark:text-stone-100 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Firebase Domain Authorization Required
                </h4>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                  Firebase Authentication requires your current preview origin to be added to the Authorized Domains list before Google popups are permitted.
                </p>
              </div>
            </div>

            {/* Current Hostname with Copy Button */}
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Host to authorize</span>
                <code className="text-[11px] font-mono font-semibold text-stone-800 dark:text-stone-200 truncate block">
                  {typeof window !== 'undefined' ? window.location.hostname : 'preview domain'}
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.hostname);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2500);
                  }
                }}
                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 rounded-md text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDomain ? 'Copied!' : 'Copy Host'}</span>
              </button>
            </div>

            {/* Action Buttons: Open Console Settings & Quick Demo Customer Fallback */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <a
                href="https://console.firebase.google.com/project/burmeal-48966/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Add in Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  setErrorDetails(null);
                  await switchDemoRole('CUSTOMER');
                  onClose();
                }}
                className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Demo Customer Login</span>
              </button>
            </div>
          </div>
        ) : errorDetails ? (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorDetails.message}</p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        ) : null}

        {/* Social Authentication: Google for User (Customer) Only */}
        {role === 'CUSTOMER' && (
          <div className="space-y-2 mb-4">
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setErrorDetails(null);
                setLoading(true);
                const res = await loginWithGoogle();
                setLoading(false);
                if (res.success) {
                  onClose();
                } else {
                  const errText = (res.error || '').toLowerCase();
                  const code = res.errorCode || '';
                  if (
                    code === 'auth/unauthorized-domain' ||
                    errText.includes('unauthorized-domain') ||
                    errText.includes('authorized domain')
                  ) {
                    setErrorDetails({
                      code: 'auth/unauthorized-domain',
                      message: res.error || 'Domain not authorized in Firebase Console',
                    });
                    setError(null);
                  } else if (
                    code === 'auth/popup-blocked' ||
                    errText.includes('popup-blocked')
                  ) {
                    setErrorDetails({
                      code: 'auth/popup-blocked',
                      message: 'Pop-up window was blocked by your browser. Please allow pop-ups for this site.',
                    });
                    setError(null);
                  } else if (
                    code === 'auth/operation-not-allowed' ||
                    errText.includes('operation-not-allowed')
                  ) {
                    setErrorDetails({
                      code: 'auth/operation-not-allowed',
                      message: 'Google sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.',
                    });
                    setError(null);
                  } else {
                    setError(res.error || 'Google sign-in failed');
                    setErrorDetails(null);
                  }
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-750 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-stone-200 dark:border-stone-800"></div>
              <span className="shrink mx-3 text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                or with email
              </span>
              <div className="grow border-t border-stone-200 dark:border-stone-800"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Daw Khin Sandar"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {role === 'SHOP_OWNER' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      {t.shopName}
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Mandalay Teahouse"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t.cuisineCategory}
                      </label>
                      <input
                        type="text"
                        value={cuisineType}
                        onChange={(e) => setCuisineType(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t.country}
                      </label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full pl-2 pr-6 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100 appearance-none font-medium"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name} className="dark:bg-stone-800">
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
                          {getCountryFlag(country)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      {t.address}
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. No. 42, Bogyoke Aung San Road"
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t.city}
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Yangon"
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t.region}
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g. Yangon Region"
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:border-amber-600 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800/60">
                    {t.pendingApprovalMsg}
                  </p>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">{t.email}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">{t.password}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs mt-2 disabled:opacity-50"
          >
            {loading ? '...' : isSignUp ? t.signUp : t.signIn}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setErrorDetails(null);
            }}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            {isSignUp ? t.alreadyAccount : t.dontHaveAccount}
          </button>
        </div>
      </div>
    </div>
  );
};
