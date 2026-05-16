import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export function useAuth() {
  const { firebaseUser, profile, isLoading, isInitialized, setProfile } =
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

  return {
    user: firebaseUser,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!firebaseUser,
    isAdmin: profile?.role === 'admin',
  };
}
