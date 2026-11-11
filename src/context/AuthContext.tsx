import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '../firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  shopId: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (formData: any) => {
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
      const res = await apiClient.firebaseLogin({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName,
        avatarUrl: fbUser.photoURL,
        provider: 'google.com',
      });
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          setToken(res.token);
          localStorage.setItem('burmeal_token', res.token);
        }
        setShopId(null);
        return { success: true };
      }
      return { success: false, error: res.error || 'Google sign-in failed' };
    } catch (err: any) {
      console.warn('Google popup error:', err);
      return { success: false, error: err.message || 'Google sign-in popup closed or cancelled' };
    }
  };

  // Customer Firebase Facebook Sign-In
  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const fbUser = result.user;
      const res = await apiClient.firebaseLogin({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName,
        avatarUrl: fbUser.photoURL,
        provider: 'facebook.com',
      });
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          setToken(res.token);
          localStorage.setItem('burmeal_token', res.token);
        }
        setShopId(null);
        return { success: true };
      }
      return { success: false, error: res.error || 'Facebook sign-in failed' };
    } catch (err: any) {
      console.warn('Facebook popup error:', err);
      return { success: false, error: err.message || 'Facebook sign-in popup closed or cancelled' };
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
        loginWithFacebook,
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
