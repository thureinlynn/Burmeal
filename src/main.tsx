import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import { applyOneTimeClientReset } from './utils/resetHelpers.ts';
import './index.css';

// Run one-time clean-start reset if new reset epoch has not been applied yet
const resetResult = applyOneTimeClientReset(window.localStorage);
if (resetResult.didReset) {
  (window as any).__BURMEAL_PENDING_FIREBASE_SIGNOUT__ = true;
}

// Two-Tier Google Maps Platform quota & auth failure listener
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  origConsoleError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <LanguageProvider>
      <LocationProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LocationProvider>
    </LanguageProvider>
  </ThemeProvider>
);
