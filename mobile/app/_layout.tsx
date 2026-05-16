import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.config';
import { useAuthStore } from '../stores/authStore';

export default function RootLayout() {
  const { isInitialized, firebaseUser, setFirebaseUser, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Listener de auth a nivel root
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setInitialized(true);
    });
    return unsubscribe;
  }, []);

  // Redirigir según estado de auth
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
      <StatusBar style="light" backgroundColor="#0A0A0F" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="builder/budget" />
        <Stack.Screen name="builder/custom" />
        <Stack.Screen name="order/[id]" />
      </Stack>
    </>
  );
}
