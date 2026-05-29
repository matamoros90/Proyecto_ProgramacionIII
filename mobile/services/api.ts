import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase.config';
import Constants from 'expo-constants';

const STORAGE_KEY = '@zonapc/backend_url';
const RAILWAY_URL = 'https://zonapc-backend-production.up.railway.app/api';

function resolveDefaultBackendUrl(): string {
  // 1. Variable de entorno seteada en build time (start-dev.sh la inyecta)
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  // 2. LAN — IP local cuando el celular y la Mac están en la misma red WiFi
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return `http://${host}:3000/api`;
    }
  }
  // 3. Fallback final
  return RAILWAY_URL;
}

export const DEFAULT_BACKEND_URL = resolveDefaultBackendUrl();

// URL en memoria — se hidrata desde AsyncStorage al iniciar la app
let currentBackendUrl = DEFAULT_BACKEND_URL;

export async function loadBackendUrlFromStorage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) currentBackendUrl = saved.trim();
  } catch {
    // ignorar — usa default
  }
}

export function getBackendUrl(): string {
  return currentBackendUrl;
}

export async function setBackendUrl(url: string): Promise<void> {
  const clean = url.trim().replace(/\/+$/, '');
  currentBackendUrl = clean || DEFAULT_BACKEND_URL;
  if (clean) await AsyncStorage.setItem(STORAGE_KEY, clean);
  else await AsyncStorage.removeItem(STORAGE_KEY);
}

const api = axios.create({
  baseURL: currentBackendUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  // Sobrescribe la URL en cada request — permite cambios sin reiniciar la app
  config.baseURL = currentBackendUrl;
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Error de conexión';
    return Promise.reject(new Error(message));
  }
);

export default api;
