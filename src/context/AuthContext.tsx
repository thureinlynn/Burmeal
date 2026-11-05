import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  shopId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.shopId) {
            setShopId(data.shopId);
            localStorage.setItem('burmeal_shop_id', data.shopId);
          }
        } else {
          // Token expired
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

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('burmeal_token', data.token);
      if (data.shopId) {
        setShopId(data.shopId);
        localStorage.setItem('burmeal_shop_id', data.shopId);
      } else {
        setShopId(null);
        localStorage.removeItem('burmeal_shop_id');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network connection error' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('burmeal_token', data.token);
      if (data.shopId) {
        setShopId(data.shopId);
        localStorage.setItem('burmeal_shop_id', data.shopId);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during sign up' };
    }
  };

  const logout = async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    setShopId(null);
    localStorage.removeItem('burmeal_token');
    localStorage.removeItem('burmeal_shop_id');
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
