import axios from 'axios';
import { auth } from './firebase.config';
import Constants from 'expo-constants';

// ─── URL del backend ────────────────────────────────────────────────────────
//
// PRODUCCIÓN: URL de Railway (se usa cuando __DEV__ === false o en Expo Go
// cuando el backend local no está disponible)
//
// ¡IMPORTANTE! Cuando hagas deploy en Railway, reemplaza esta URL con la tuya:
const RAILWAY_URL = 'https://regarding-carter-graphs-always.trycloudflare.com/api';
//
// DESARROLLO LOCAL: detecta la IP de la máquina que corre el backend.
// Solo funciona si el compañero también está corriendo el backend localmente
// y en la misma red WiFi.
//
function getLocalBackendUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    // Solo usar si es una IP local (LAN), no un dominio de tunnel
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return `http://${host}:3000/api`;
    }
  }
  // En tunnel o sin IP local → usar Railway
  return RAILWAY_URL;
}

const BASE_URL = __DEV__ ? getLocalBackendUrl() : RAILWAY_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta token Firebase automáticamente en cada request
api.interceptors.request.use(async (config) => {
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
