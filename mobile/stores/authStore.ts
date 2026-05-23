import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  profileReady: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: User | null) => void;
  clearProfile: () => void;
  setLoading: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  profileReady: false,
  isLoading: false,
  isInitialized: false,
  setFirebaseUser: (user) => set({ firebaseUser: user, profileReady: false }),
  // setProfile con perfil real → profileReady: true
  // setProfile con null por fallo de API (usuario aún autenticado) → profileReady: true para no spinnear
  setProfile: (profile) => set({ profile, profileReady: true }),
  // clearProfile: usuario NO autenticado → profileReady: false para evitar flash de rol incorrecto
  clearProfile: () => set({ profile: null, profileReady: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  clear: () => set({ firebaseUser: null, profile: null, profileReady: false }),
}));
