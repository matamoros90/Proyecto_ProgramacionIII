import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import '../services/firebase.config';

export default function RootLayout() {
  useAuth(); // Inicializa listener de auth

  return (
    <>
      <StatusBar style="light" backgroundColor="#0A0A0F" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="builder" />
        <Stack.Screen name="order" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}
