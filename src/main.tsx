import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import './index.css';

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
