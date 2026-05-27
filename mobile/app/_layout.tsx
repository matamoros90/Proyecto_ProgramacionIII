import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

// Expo Go SDK 53+ eliminó notificaciones remotas.
// NO importamos expo-notifications estáticamente — se carga con require() solo en builds nativos.
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

SplashScreen.preventAutoHideAsync().catch(() => {});

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

  // Esconder el Splash Screen de forma segura cuando la autenticación esté inicializada
  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Carga del perfil centralizada aquí (UNA sola llamada por sesión)
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

  // Registro de token FCM y navegación al tocar notificaciones
  useEffect(() => {
    if (!firebaseUser || IS_EXPO_GO) return;
    let responseSub: { remove: () => void } | null = null;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const N = require('expo-notifications') as typeof import('expo-notifications');
        if (Platform.OS === 'android') {
          await N.setNotificationChannelAsync('default', {
            name: 'ZonaPc Builder',
            importance: N.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
          });
        }
        const { status } = await N.requestPermissionsAsync();
        if (status !== 'granted') return;
        const tokenData = await N.getDevicePushTokenAsync();
        if (tokenData?.data) {
          await api.post('/auth/fcm-token', { token: String(tokenData.data) });
        }

        // Al tocar una notificación → navega a la pantalla correspondiente
        responseSub = N.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as Record<string, string> | null;
          if (!data) return;
          if (data.type === 'new_quote_available') {
            router.push('/vendor/dashboard' as any);
          } else if (data.quoteId) {
            router.push(`/quote/${data.quoteId}` as any);
          }
        });
      } catch {
        // No-op: FCM registration es no-crítico
      }
    })();
    return () => { responseSub?.remove(); };
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
        <Stack.Screen name="builder/preset" />
        <Stack.Screen name="builder/[type]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="quote/[id]" />
        <Stack.Screen name="quote/payment" />
        <Stack.Screen name="admin/vendors" />
        <Stack.Screen name="vendor/dashboard" />
        <Stack.Screen name="profile" />
      </Stack>
    </>
  );
}
