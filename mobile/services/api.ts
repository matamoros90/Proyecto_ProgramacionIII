import axios from 'axios';
import { auth } from './firebase.config';
import Constants from 'expo-constants';

const RAILWAY_URL = 'https://zonapc-backend-production.up.railway.app/api';

function resolveBackendUrl(): string {
  // Detecta la IP local automáticamente cuando el dispositivo está en la misma red WiFi
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return `http://${host}:3000/api`;
    }
  }
  // Fuera de LAN (tunnel u otro) → Railway
  return RAILWAY_URL;
}

const BASE_URL = resolveBackendUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

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
