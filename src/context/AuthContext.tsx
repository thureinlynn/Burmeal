import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '../firebase';
import { firestoreService } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  shopId: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('burmeal_token'));
  const [shopId, setShopId] = useState<string | null>(localStorage.getItem('burmeal_shop_id'));
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiClient.getMe(token);
        if (data && data.user) {
          setUser(data.user);
          if (data.shopId) {
            setShopId(data.shopId);
            localStorage.setItem('burmeal_shop_id', data.shopId);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('burmeal_token');
          localStorage.removeItem('burmeal_shop_id');
          setToken(null);
          setUser(null);
          setShopId(null);
        }
      } catch (err) {
        console.error('Session load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email: string, password?: string) => {
    // 1. Try Firebase Email/Password Sign-In if password is provided
    if (password && password.length >= 6) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCred.user;
        let profile = await firestoreService.getUserProfile(fbUser.uid);
        if (!profile) {
          profile = {
            id: fbUser.uid,
            email: fbUser.email || email,
            name: fbUser.displayName || email.split('@')[0],
            role: 'CUSTOMER',
            avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
            createdAt: new Date().toISOString(),
          };
          await firestoreService.saveUserProfile(profile);
        }

        const ownedShop = await firestoreService.getShopByOwnerId(fbUser.uid);
        setUser(profile);
        const fbToken = await fbUser.getIdToken();
        setToken(fbToken);
        localStorage.setItem('burmeal_token', fbToken);
        if (ownedShop) {
          setShopId(ownedShop.id);
          localStorage.setItem('burmeal_shop_id', ownedShop.id);
        } else {
          setShopId(null);
          localStorage.removeItem('burmeal_shop_id');
        }
        return { success: true };
      } catch (fbErr: any) {
        // If not found in Firebase Auth or wrong password, continue to check local demo credentials
        console.warn('Firebase email login note:', fbErr?.code || fbErr?.message);
      }
    }

    // 2. Fallback to API Client / Demo credentials (for instant demo accounts)
    try {
      const res = await apiClient.login(email, password);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Login failed' };
      }

      setUser(res.user);
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('burmeal_token', res.token);
      }
      if (res.shopId) {
        setShopId(res.shopId);
        localStorage.setItem('burmeal_shop_id', res.shopId);
      } else {
        setShopId(null);
        localStorage.removeItem('burmeal_shop_id');
      }

      // Sync demo user to Firestore if not already there
      try {
        await firestoreService.saveUserProfile(res.user);
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (formData: any) => {
    // 1. If password provided, register directly in Firebase Authentication
    if (formData.password && formData.password.length >= 6) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = userCred.user;
        const newUser: User = {
          id: fbUser.uid,
          email: formData.email,
          name: formData.name || formData.email.split('@')[0],
          role: formData.role || 'CUSTOMER',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
          createdAt: new Date().toISOString(),
        };

        // Save profile in Firestore /users/{uid}
        await firestoreService.saveUserProfile(newUser);

        let newShopId: string | null = null;
        if (formData.role === 'SHOP_OWNER') {
          newShopId = `shop_${Date.now()}`;
          const newShop = {
            id: newShopId,
            ownerId: fbUser.uid,
            name: formData.shopName || `${newUser.name}'s Kitchen`,
            bio: 'Artisan home kitchen preparing authentic delicacies for direct contact and kitchen pick-up.',
            coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
            avatarImage: `https://api.dicebear.com/7.x/identicon/svg?seed=${newShopId}`,
            status: 'APPROVED' as const,
            cuisineType: formData.cuisineType || 'Traditional Burmese Cuisine',
            locationArea: formData.locationArea || 'Downtown',
            address: formData.address || '',
            city: formData.city || 'Yangon',
            region: formData.region || 'Yangon Region',
            country: formData.country || 'Myanmar',
            createdAt: new Date().toISOString(),
          };
          await firestoreService.createShop(newShop);
        }

        setUser(newUser);
        const fbToken = await fbUser.getIdToken();
        setToken(fbToken);
        localStorage.setItem('burmeal_token', fbToken);
        if (newShopId) {
          setShopId(newShopId);
          localStorage.setItem('burmeal_shop_id', newShopId);
        }
        return { success: true };
      } catch (fbErr: any) {
        console.warn('Firebase registration error:', fbErr);
        if (fbErr.code === 'auth/email-already-in-use') {
          return { success: false, error: 'This email is already in use. Please sign in instead.' };
        }
        if (fbErr.code === 'auth/weak-password') {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }
      }
    }

    // 2. Fallback to API Client registration
    try {
      const res = await apiClient.register(formData);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Registration failed' };
      }

      setUser(res.user);
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('burmeal_token', res.token);
      }
      if (res.shopId) {
        setShopId(res.shopId);
        localStorage.setItem('burmeal_shop_id', res.shopId);
      }

      // Sync to Firestore
      try {
        await firestoreService.saveUserProfile(res.user);
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during sign up' };
    }
  };

  // Customer Firebase Google Sign-In
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Ensure user profile in Firestore
      let profile = await firestoreService.getUserProfile(fbUser.uid);
      if (!profile) {
        profile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || 'Google Customer',
          role: 'CUSTOMER',
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
          createdAt: new Date().toISOString(),
        };
        await firestoreService.saveUserProfile(profile);
      }

      const res = await apiClient.firebaseLogin({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName,
        avatarUrl: fbUser.photoURL,
        provider: 'google.com',
      });

      setUser(profile);
      const fbToken = await fbUser.getIdToken();
      setToken(fbToken);
      localStorage.setItem('burmeal_token', fbToken);
      setShopId(null);
      return { success: true };
    } catch (err: any) {
      console.warn('Google popup error:', err);
      const code = err?.code || (err?.message?.includes('unauthorized-domain') ? 'auth/unauthorized-domain' : undefined);
      return {
        success: false,
        error: err.message || 'Google sign-in popup closed or cancelled',
        errorCode: code || 'auth/popup-error',
      };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
    setToken(null);
    setShopId(null);
    localStorage.removeItem('burmeal_token');
    localStorage.removeItem('burmeal_shop_id');
    localStorage.removeItem('burmeal_user_data');
  };

  const switchDemoRole = async (targetRole: 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN') => {
    let email = 'customer@burmeal.com';
    if (targetRole === 'SHOP_OWNER') email = 'mandalay@burmeal.com';
    if (targetRole === 'ADMIN') email = 'admin@burmeal.com';

    await login(email, 'burmeal123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        shopId,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
