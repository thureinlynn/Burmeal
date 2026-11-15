import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import { applyOneTimeClientReset } from './utils/resetHelpers.ts';
import './index.css';

// Register service worker for standalone PWA installation & offline caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

// Lock viewport pinch-zoom on mobile Safari/iOS outside interactive map containers
if (typeof document !== 'undefined') {
  const preventViewportPinchZoom = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.('.leaflet-container')) return;
    event.preventDefault();
  };
  document.addEventListener('gesturestart', preventViewportPinchZoom, { passive: false });
  document.addEventListener('gesturechange', preventViewportPinchZoom, { passive: false });
}

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
