/**
 * ThemeContext.tsx
 * Proveedor de tema dual (oscuro / claro) con persistencia en AsyncStorage.
 * Uso: envuelve el root en <ThemeProvider>, luego usa useTheme() en cualquier pantalla.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, LightTheme, ThemeColors } from '../constants/colors';

const THEME_KEY = '@zonapc_theme';

interface ThemeContextValue {
  colors:      ThemeColors;
  isDark:      boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors:      DarkTheme,
  isDark:      true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true); // oscuro por defecto

  // Cargar preferencia persistida
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(val => { if (val !== null) setIsDark(val === 'dark'); })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ colors: isDark ? DarkTheme : LightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook principal — úsalo en cualquier componente */
export const useTheme = () => useContext(ThemeContext);
