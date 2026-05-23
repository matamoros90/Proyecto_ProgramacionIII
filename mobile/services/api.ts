import axios from 'axios';
import { auth } from './firebase.config';

import Constants from 'expo-constants';

// Obtener IP del host de Expo para conectar al backend local
function getDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri; // "ip:port" en LAN, "tunnel.exp.direct:443" en tunnel
  if (hostUri) {
    const host = hostUri.split(':')[0];
    // Si es una IP local (ej: 192.168.1.13) usarla; si es un dominio de tunnel (ej: xxx.exp.direct) ignorarla
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return host;
  }
  return '192.168.1.13'; // IP local fallback
}

const BASE_URL = __DEV__
  ? `http://${getDevHost()}:3000/api`
  : 'https://api.zonapcbuilder.com/api';

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
