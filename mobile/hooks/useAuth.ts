import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export function useAuth() {
  const { firebaseUser, profile, isLoading, isInitialized, setFirebaseUser, setProfile, setInitialized } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const res = await api.get('/auth/profile');
          setProfile(res.data);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setInitialized(true);
    });
    return unsubscribe;
  }, []);

  return {
    user: firebaseUser,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!firebaseUser,
    isAdmin: profile?.role === 'admin',
  };
}
