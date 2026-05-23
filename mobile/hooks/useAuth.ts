import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { useAuthStore } from '../stores/authStore';

// La carga del perfil está centralizada en _layout.tsx.
// Este hook solo lee el store — sin useEffect, sin llamadas API.
export function useAuth() {
  const { firebaseUser, profile, profileReady, isLoading, isInitialized, clear } =
    useAuthStore();

  async function signOut() {
    clear();
    await firebaseSignOut(auth);
  }

  return {
    user: firebaseUser,
    profile,
    profileReady,
    isLoading,
    isInitialized,
    isAuthenticated: !!firebaseUser,
    isAdmin: profile?.role === 'admin',
    isVendor: profile?.role === 'vendor',
    isVendorOrAdmin: profile?.role === 'vendor' || profile?.role === 'admin',
    signOut,
  };
}
