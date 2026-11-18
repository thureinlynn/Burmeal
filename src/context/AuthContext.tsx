import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Shop } from '../types';
import { apiClient } from '../services/apiClient';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from '../firebase';
import { firestoreService } from '../services/firestoreService';
import {
  resolveEffectiveUserRole,
  hydrateFirebaseUserProfile,
  buildNewShopForOwner,
  classifyFirebaseLoginError,
} from '../utils/authHelpers';

interface AuthContextType {
  user: User | null;
  token: string | null;
  shopId: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password?: string,
    expectedRole?: 'CUSTOMER' | 'SHOP_OWNER'
  ) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  loginWithGoogle: (
    expectedRole?: 'CUSTOMER' | 'SHOP_OWNER'
  ) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  syncBackendSession: (
    userOverride?: User | null,
    shopOverride?: Shop | null
  ) => Promise<{ token?: string; shopId?: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistLocalSession(user: User, token: string, shopId?: string | null) {
  localStorage.setItem('burmeal_token', token);
  localStorage.setItem('burmeal_user_data', JSON.stringify(user));
  if (shopId) {
    localStorage.setItem('burmeal_shop_id', shopId);
  } else {
    localStorage.removeItem('burmeal_shop_id');
  }
}

function clearLocalSession() {
  localStorage.removeItem('burmeal_token');
  localStorage.removeItem('burmeal_shop_id');
  localStorage.removeItem('burmeal_user_data');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('burmeal_token'));
  const [shopId, setShopId] = useState<string | null>(localStorage.getItem('burmeal_shop_id'));
  const [isLoading, setIsLoading] = useState(true);

  // Prevents onAuthStateChanged from racing ahead while register/login is writing Firestore docs
  const isAuthActionInProgressRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    const initAuth = async () => {
      if ((window as any).__BURMEAL_PENDING_FIREBASE_SIGNOUT__) {
        delete (window as any).__BURMEAL_PENDING_FIREBASE_SIGNOUT__;
        clearLocalSession();
        try {
          await firebaseSignOut(auth);
        } catch {}
      }

      if (!isMounted) return;

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted || isAuthActionInProgressRef.current) {
          return;
        }

        if (fbUser) {
          try {
            const authEmail =
              fbUser.email ||
              fbUser.providerData?.find((p) => p?.email)?.email ||
              '';

            let profile = await firestoreService.getUserProfile(fbUser.uid);
            if ((!profile || !(profile.email || '').trim()) && authEmail) {
              const byEmail = await firestoreService.getUserByEmail(authEmail);
              if (byEmail) {
                profile = { ...(profile || {}), ...byEmail, id: fbUser.uid };
              }
            }

            let ownedShop = await firestoreService.getShopByOwnerId(fbUser.uid);
            if (!ownedShop && authEmail) {
              ownedShop = await firestoreService.getShopByOwnerEmail(authEmail);
            }
            if (!ownedShop && profile?.email) {
              ownedShop = await firestoreService.getShopByOwnerEmail(profile.email);
            }

            // Fallback to cached user data for matching UID if Firestore read failed transiently
            if (!profile) {
              try {
                const cachedRaw = localStorage.getItem('burmeal_user_data');
                if (cachedRaw) {
                  const cached = JSON.parse(cachedRaw) as User;
                  if (cached?.id === fbUser.uid && (cached.email || '').trim()) {
                    profile = cached;
                  }
                }
              } catch {}
            }

            const hydrated = hydrateFirebaseUserProfile(fbUser, profile, ownedShop);
            const hydratedUser = hydrated.user;

            if (hydrated.needsFirestoreSync) {
              await firestoreService.saveUserProfile(hydratedUser).catch(() => {});
            }
            if (ownedShop && ownedShop.ownerId !== fbUser.uid) {
              await firestoreService
                .updateShop(ownedShop.id, {
                  ownerId: fbUser.uid,
                  ownerEmail: hydratedUser.email || ownedShop.ownerEmail,
                })
                .catch(() => {});
              ownedShop = {
                ...ownedShop,
                ownerId: fbUser.uid,
                ownerEmail: hydratedUser.email || ownedShop.ownerEmail,
              };
            }

            let effectiveToken = await fbUser.getIdToken();
            const syncRes = await apiClient.syncFirebaseAccount(hydratedUser, ownedShop);
            if (syncRes.token) {
              effectiveToken = syncRes.token;
            }

            const effectiveShopId = hydrated.shopId || syncRes.shopId || null;

            if (!isMounted) return;
            persistLocalSession(hydratedUser, effectiveToken, effectiveShopId);
            setUser(hydratedUser);
            setShopId(effectiveShopId);
            setToken(effectiveToken);
          } catch (err) {
            console.error('Firebase session restore error:', err);
          } finally {
            if (isMounted) setIsLoading(false);
          }
          return;
        }

        // No Firebase user: check if a backend/SQLite `tok_` session exists
        const storedToken = localStorage.getItem('burmeal_token');
        if (storedToken && storedToken.startsWith('tok_')) {
          try {
            const data = await apiClient.getMe(storedToken);
            if (isMounted && data && data.user) {
              let resolvedShopId = data.shopId || null;
              let resolvedUser = data.user;
              if (resolvedUser.role === 'SHOP_OWNER' && !resolvedShopId) {
                const ownedShop =
                  (await firestoreService.getShopByOwnerId(resolvedUser.id)) ||
                  (resolvedUser.email ? await firestoreService.getShopByOwnerEmail(resolvedUser.email) : null);
                if (ownedShop) resolvedShopId = ownedShop.id;
              }
              persistLocalSession(resolvedUser, storedToken, resolvedShopId);
              setUser(resolvedUser);
              setShopId(resolvedShopId);
              setToken(storedToken);
            } else if (isMounted) {
              clearLocalSession();
              setToken(null);
              setUser(null);
              setShopId(null);
            }
          } catch (err) {
            console.error('Session load error:', err);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        } else {
          clearLocalSession();
          if (isMounted) {
            setToken(null);
            setUser(null);
            setShopId(null);
            setIsLoading(false);
          }
        }
      });
    };

    initAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password?: string,
    expectedRole?: 'CUSTOMER' | 'SHOP_OWNER'
  ) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    isAuthActionInProgressRef.current = true;
    try {
      // 1. Try Firebase Email/Password Sign-In
      if (password.length >= 6) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const fbUser = userCred.user;

          let profile = await firestoreService.getUserProfile(fbUser.uid);
          if (!profile || !(profile.email || '').trim()) {
            const byEmail = await firestoreService.getUserByEmail(fbUser.email || cleanEmail);
            if (byEmail) {
              profile = { ...(profile || {}), ...byEmail, id: fbUser.uid };
            }
          }

          let ownedShop = await firestoreService.getShopByOwnerId(fbUser.uid);
          if (!ownedShop) {
            ownedShop = await firestoreService.getShopByOwnerEmail(fbUser.email || cleanEmail);
          }
          if (!ownedShop && profile?.id && profile.id !== fbUser.uid) {
            ownedShop = await firestoreService.getShopByOwnerId(profile.id);
          }

          const hydrated = hydrateFirebaseUserProfile(fbUser, profile, ownedShop, expectedRole);
          if (hydrated.error) {
            await firebaseSignOut(auth).catch(() => {});
            clearLocalSession();
            return { success: false, error: hydrated.error };
          }

          const finalUser = hydrated.user;
          await firestoreService.saveUserProfile(finalUser);
          if (ownedShop && ownedShop.ownerId !== fbUser.uid) {
            await firestoreService.updateShop(ownedShop.id, {
              ownerId: fbUser.uid,
              ownerEmail: finalUser.email || ownedShop.ownerEmail,
            });
            ownedShop = {
              ...ownedShop,
              ownerId: fbUser.uid,
              ownerEmail: finalUser.email || ownedShop.ownerEmail,
            };
          }

          let effectiveToken = await fbUser.getIdToken();
          const syncRes = await apiClient.syncFirebaseAccount(finalUser, ownedShop);
          if (syncRes.token) {
            effectiveToken = syncRes.token;
          }

          const effectiveShopId = hydrated.shopId || syncRes.shopId || null;
          persistLocalSession(finalUser, effectiveToken, effectiveShopId);
          setUser(finalUser);
          setShopId(effectiveShopId);
          setToken(effectiveToken);
          return { success: true };
        } catch (fbErr: any) {
          const handling = classifyFirebaseLoginError(fbErr?.code);
          if (!handling.shouldFallbackToBackend) {
            return { success: false, error: handling.userError || 'Failed to sign in.' };
          }
          // Fall through silently to backend SQLite auth for seeded/legacy accounts
        }
      }

      // 2. Try Backend SQLite Auth (for seeded / legacy accounts)
      const res = await apiClient.login(cleanEmail, password);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Invalid email or password.' };
      }

      let loggedInUser = res.user;
      let resolvedShopId = res.shopId || null;

      // Also check Firestore in case a Shop exists for this user
      let ownedShop: Shop | null = null;
      if (loggedInUser.role === 'SHOP_OWNER' || expectedRole === 'SHOP_OWNER') {
        ownedShop =
          (await firestoreService.getShopByOwnerId(loggedInUser.id)) ||
          (await firestoreService.getShopByOwnerEmail(cleanEmail));
        if (ownedShop) {
          loggedInUser = { ...loggedInUser, role: 'SHOP_OWNER' };
          resolvedShopId = ownedShop.id;
        }
      }

      if (expectedRole === 'SHOP_OWNER' && loggedInUser.role !== 'SHOP_OWNER') {
        clearLocalSession();
        return {
          success: false,
          error:
            'This email is registered as a Customer account, not a Shop Owner. Please sign up as a Shop Owner or switch to Customer login.',
        };
      }

      const effectiveToken = res.token || 'tok_' + loggedInUser.id;
      persistLocalSession(loggedInUser, effectiveToken, resolvedShopId);
      setUser(loggedInUser);
      setShopId(resolvedShopId);
      setToken(effectiveToken);

      try {
        await firestoreService.saveUserProfile(loggedInUser);
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error during login' };
    } finally {
      isAuthActionInProgressRef.current = false;
    }
  };

  const register = async (formData: any) => {
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const password = formData.password || '';
    const assignedRole = formData.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER';

    if (!cleanEmail || !formData.name?.trim()) {
      return { success: false, error: 'Full name and email are required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    isAuthActionInProgressRef.current = true;
    try {
      // 1. Register directly in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCred.user;

      try {
        await updateProfile(fbUser, { displayName: formData.name.trim() });
      } catch {}

      const newUser: User = {
        id: fbUser.uid,
        email: cleanEmail,
        name: formData.name.trim(),
        role: assignedRole,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fbUser.uid)}`,
        createdAt: new Date().toISOString(),
      };

      // Save profile in Firestore /users/{uid}, /accounts/{uid}, /user_accounts/{uid}
      await firestoreService.saveUserProfile(newUser);

      let newShop: Shop | null = null;
      if (assignedRole === 'SHOP_OWNER') {
        newShop = buildNewShopForOwner(fbUser.uid, cleanEmail, formData);
        await firestoreService.createShop(newShop);
      }

      let effectiveToken = await fbUser.getIdToken();
      const syncRes = await apiClient.syncFirebaseAccount(newUser, newShop);
      if (syncRes.token) {
        effectiveToken = syncRes.token;
      }

      const effectiveShopId = newShop?.id || syncRes.shopId || null;
      persistLocalSession(newUser, effectiveToken, effectiveShopId);
      setUser(newUser);
      setShopId(effectiveShopId);
      setToken(effectiveToken);

      return { success: true };
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/email-already-in-use') {
        return { success: false, error: 'This email is already in use. Please sign in instead.' };
      }
      if (fbErr.code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      if (fbErr.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      // Only fall back to API registration if Firebase Auth failed due to non-credential issues (e.g. operation-not-allowed)
      try {
        const res = await apiClient.register({ ...formData, email: cleanEmail, role: assignedRole });
        if (!res.success || !res.user) {
          return { success: false, error: res.error || fbErr.message || 'Registration failed' };
        }

        const effectiveToken = res.token || 'tok_' + res.user.id;
        persistLocalSession(res.user, effectiveToken, res.shopId || null);
        setUser(res.user);
        setShopId(res.shopId || null);
        setToken(effectiveToken);

        try {
          await firestoreService.saveUserProfile(res.user);
          if (res.shopId && res.user.role === 'SHOP_OWNER') {
            const createdShop = await apiClient.getShop(res.shopId, effectiveToken);
            if (createdShop) {
              await firestoreService.createShop(createdShop).catch(() => {});
            }
          }
        } catch {}

        return { success: true };
      } catch {
        return { success: false, error: fbErr.message || 'Registration failed' };
      }
    } finally {
      isAuthActionInProgressRef.current = false;
    }
  };

  // Firebase Google Sign-In (Customer or verified Shop Owner)
  const loginWithGoogle = async (expectedRole?: 'CUSTOMER' | 'SHOP_OWNER') => {
    isAuthActionInProgressRef.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const authEmail =
        fbUser.email ||
        fbUser.providerData?.find((p) => p?.email)?.email ||
        '';

      let profile = await firestoreService.getUserProfile(fbUser.uid);
      if ((!profile || !(profile.email || '').trim()) && authEmail) {
        const byEmail = await firestoreService.getUserByEmail(authEmail);
        if (byEmail) {
          profile = { ...(profile || {}), ...byEmail, id: fbUser.uid };
        }
      }

      let ownedShop = await firestoreService.getShopByOwnerId(fbUser.uid);
      if (!ownedShop && authEmail) {
        ownedShop = await firestoreService.getShopByOwnerEmail(authEmail);
      }
      if (!ownedShop && profile?.email) {
        ownedShop = await firestoreService.getShopByOwnerEmail(profile.email);
      }

      const hydrated = hydrateFirebaseUserProfile(fbUser, profile, ownedShop, expectedRole);
      if (hydrated.error) {
        await firebaseSignOut(auth).catch(() => {});
        clearLocalSession();
        return { success: false, error: hydrated.error };
      }

      const finalProfile = hydrated.user;
      await firestoreService.saveUserProfile(finalProfile);

      if (ownedShop && ownedShop.ownerId !== fbUser.uid) {
        await firestoreService
          .updateShop(ownedShop.id, {
            ownerId: fbUser.uid,
            ownerEmail: finalProfile.email || ownedShop.ownerEmail,
          })
          .catch(() => {});
        ownedShop = {
          ...ownedShop,
          ownerId: fbUser.uid,
          ownerEmail: finalProfile.email || ownedShop.ownerEmail,
        };
      }

      let effectiveToken = await fbUser.getIdToken();
      const syncRes = await apiClient.syncFirebaseAccount(finalProfile, ownedShop);
      if (syncRes.token) {
        effectiveToken = syncRes.token;
      }

      const effectiveShopId = hydrated.shopId || syncRes.shopId || null;
      persistLocalSession(finalProfile, effectiveToken, effectiveShopId);
      setUser(finalProfile);
      setShopId(effectiveShopId);
      setToken(effectiveToken);
      return { success: true };
    } catch (err: any) {
      console.warn('Google popup error:', err);
      const code = err?.code || (err?.message?.includes('unauthorized-domain') ? 'auth/unauthorized-domain' : undefined);
      return {
        success: false,
        error: err.message || 'Google sign-in popup closed or cancelled',
        errorCode: code || 'auth/popup-error',
      };
    } finally {
      isAuthActionInProgressRef.current = false;
    }
  };

  const logout = async () => {
    const currentToken = localStorage.getItem('burmeal_token');
    isAuthActionInProgressRef.current = true;
    clearLocalSession();
    setUser(null);
    setToken(null);
    setShopId(null);
    try {
      await firebaseSignOut(auth);
    } catch {}
    if (currentToken && currentToken.startsWith('tok_')) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch {}
    }
    isAuthActionInProgressRef.current = false;
  };

  const syncBackendSession = async (
    userOverride?: User | null,
    shopOverride?: Shop | null
  ): Promise<{ token?: string; shopId?: string | null }> => {
    const targetUser = userOverride || user;
    if (!targetUser) return {};
    try {
      const syncRes = await apiClient.syncFirebaseAccount(targetUser, shopOverride);
      const nextToken = syncRes.token || token || '';
      const nextShopId = syncRes.shopId ?? shopOverride?.id ?? shopId ?? null;
      if (nextToken) {
        persistLocalSession(targetUser, nextToken, nextShopId);
        setToken(nextToken);
      }
      if (nextShopId !== undefined) {
        setShopId(nextShopId);
      }
      return { token: nextToken || undefined, shopId: nextShopId };
    } catch {
      return { shopId: shopOverride?.id ?? shopId ?? null };
    }
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
        syncBackendSession,
        logout,
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
