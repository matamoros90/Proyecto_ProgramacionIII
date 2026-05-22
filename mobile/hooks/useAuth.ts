import { useEffect } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export function useAuth() {
  const { firebaseUser, profile, isLoading, isInitialized, setProfile, clear } =
    useAuthStore();

  // Cargar perfil del backend cuando hay usuario autenticado
  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    api.get('/auth/profile')
      .then((res: any) => {
        if (!cancelled) setProfile(res.data ?? res);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => { cancelled = true; };
  }, [firebaseUser]);

  async function signOut() {
    clear();
    await firebaseSignOut(auth);
  }

  return {
    user: firebaseUser,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!firebaseUser,
    isAdmin: profile?.role === 'admin',
    isVendor: profile?.role === 'vendor',
    isVendorOrAdmin: profile?.role === 'vendor' || profile?.role === 'admin',
    signOut,
  };
}
