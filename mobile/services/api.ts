import axios from 'axios';
import { auth } from './firebase.config';
import Constants from 'expo-constants';

const RAILWAY_URL = 'https://zonapc-backend-production.up.railway.app/api';

function resolveBackendUrl(): string {
  // 1. Variable de entorno seteada por start-dev.sh (tunnel de cloudflared)
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  // 2. LAN — detecta IP local cuando el celular está en la misma red
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return `http://${host}:3000/api`;
    }
  }
  // 3. Fallback → Railway producción
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
