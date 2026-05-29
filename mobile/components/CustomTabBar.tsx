/**
 * Tab bar custom — barra pill simple, adaptativa a dark/light theme.
 * El tab activo se resalta con color + label visible.
 */
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect, useRef } from 'react';

// Rutas que NO deben aparecer en la barra (rutas internas / dinámicas).
const HIDDEN_ROUTES = new Set(['builder']);

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index:   'home',
  quotes:  'document-text',
  orders:  'cube',
  aprende: 'school',
  learn:   'cart',
};

const LABELS: Record<string, string> = {
  index:   'Inicio',
  quotes:  'Cotizaciones',
  orders:  'Órdenes',
  aprende: 'Aprende',
  learn:   'Cesta',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Filtra rutas ocultas por nombre + por href: null (doble seguro)
  const visibleRoutes = state.routes.filter((r) => {
    if (HIDDEN_ROUTES.has(r.name)) return false;
    const opts = descriptors[r.key].options as any;
    return opts.href !== null;
  });

  const activeKey = state.routes[state.index]?.key;

  // Colores adaptativos
  const barBg        = isDark ? '#0D1320' : '#FFFFFF';
  const inactiveCol  = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.55)';
  const borderCol    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)';

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: colors.background, // ← acompaña el tema (oscuro/claro)
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: barBg,
            borderColor: borderCol,
            shadowColor: isDark ? '#000' : '#475569',
            shadowOpacity: isDark ? 0.40 : 0.12,
          },
        ]}
      >
        {visibleRoutes.map((route) => {
          const isFocused = route.key === activeKey;
          const iconName  = ICONS[route.name]  ?? 'ellipse-outline';
          const label     = LABELS[route.name] ?? route.name;

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              icon={iconName}
              label={label}
              primary={colors.primary}
              inactiveColor={inactiveCol}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Item individual ──────────────────────────────────────────────────────────
function TabItem({
  isFocused, icon, label, primary, inactiveColor, onPress,
}: {
  isFocused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(isFocused ? 1.05 : 1)).current;
  const indicator = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.05 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
      Animated.timing(indicator, {
        toValue: isFocused ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused]);

  const iconColor = isFocused ? primary : inactiveColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tab}
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
        {isFocused && (
          <Text style={[styles.label, { color: primary }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Animated.View>
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: primary,
            opacity: indicator,
            transform: [
              {
                scaleX: indicator.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 12,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  indicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
