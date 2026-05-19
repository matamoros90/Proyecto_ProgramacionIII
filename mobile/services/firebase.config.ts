import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC94P-D60FiA82EE_hdlisxatlTiYBL8mY',
  authDomain: 'zonapc-builder.firebaseapp.com',
  projectId: 'zonapc-builder',
  storageBucket: 'zonapc-builder.firebasestorage.app',
  messagingSenderId: '219197871882',
  appId: '1:219197871882:android:ce080c4d9415b6a2f74cf3',
};

// Inicializar Firebase App (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth con persistencia AsyncStorage para React Native
// getAuth() reutiliza si ya fue inicializado (hot reload)
// eslint-disable-next-line prefer-const
let auth: ReturnType<typeof getAuth>; // initialized below
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
