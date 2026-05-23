import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.hideAsync().catch(() => {});

export default function RootLayout() {
  const {
    isInitialized, firebaseUser,
    setFirebaseUser, setInitialized,
    setProfile, clearProfile,
  } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Firebase auth state — callback síncrono para evitar problemas con NavigationContainer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setInitialized(true);
    });
    return unsubscribe;
  }, []);

  // Carga del perfil centralizada aquí (UNA sola llamada por sesión)
  // Así el hook useAuth no dispara llamadas duplicadas desde cada componente
  useEffect(() => {
    if (!firebaseUser) {
      clearProfile();
      return;
    }
    let cancelled = false;
    api.get('/auth/profile')
      .then((res: any) => { if (!cancelled) setProfile(res.data ?? res); })
      .catch(() => { if (!cancelled) setProfile(null); });
    return () => { cancelled = true; };
  }, [firebaseUser?.uid]);

  // Redirección según estado de autenticación
  useEffect(() => {
    if (!isInitialized) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!firebaseUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (firebaseUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isInitialized, firebaseUser, segments]);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#EFF6FF" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/revenue" />
        <Stack.Screen name="admin/deliveries" />
        <Stack.Screen name="admin/inventory" />
        <Stack.Screen name="admin/quotes" />
        <Stack.Screen name="admin/orders" />
        <Stack.Screen name="builder/budget" />
        <Stack.Screen name="builder/custom" />
        <Stack.Screen name="builder/[type]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="quote/[id]" />
        <Stack.Screen name="quote/payment" />
        <Stack.Screen name="vendor/dashboard" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
}
