import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Image,
  Animated, ActivityIndicator, StatusBar, Platform, UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, ORDER_STATE_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

// Habilitar animaciones nativas de diseño en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DashboardData {
  orders: { total: number; byState: Record<string, number> };
  quotes: { total: number };
  revenue: { total: number; totalAll: number };
}

const STATE_COLORS: Record<string, string> = {
  pending: Colors.warning,
  components_ready: Colors.info,
  assembling: Colors.secondary,
  software_install: Colors.secondary,
  testing: Colors.warning,
  ready: Colors.accent,
  delivered: Colors.success,
  cancelled: Colors.error,
};

// Enlaces de imágenes temáticas premium para métricas
const METRIC_IMAGES = {
  orders: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',       // Cajas, logística, almacén
  revenue: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',      // Gráficos de ganancias, laptop
  quotes: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',       // Planificación, blueprints, lápiz y hojas
  assembling: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',   // Chip, placa base, soldadura de microcontrolador
};

// Enlaces de imágenes temáticas premium para banners de gestión
const NAV_IMAGES = {
  personal: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',     // Gestión de personal / equipo de trabajo
  inventory: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600',    // Inventario, estantería de productos
  quotes: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600',       // Tablero de cotizaciones, notas ágiles
  orders: 'https://images.unsplash.com/photo-1512756290469-ec0602047974?w=600',       // Ensamblaje en estación de trabajo hardware
  deliveries: 'https://images.unsplash.com/photo-1549194388-f61be84a6e9e?w=600',   // Vehículo en tránsito / entrega de paquetes
};

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated, profileReady, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Valor animado para la posición del scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);
  }

  useEffect(() => {
    if (!profileReady || !isAuthenticated) return;
    if (!isAdmin) {
      Alert.alert('Sin acceso', 'No tienes permisos de administrador');
      router.replace('/(auth)/login' as any);
      return;
    }
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/orders'),
    ]).then(([dash, ord]: any) => {
      setData(dash.data);
      setOrders(ord.data.slice(0, 10));
    }).catch((err: any) => {
      Alert.alert('Error', err?.message ?? 'No se pudo cargar el panel');
    }).finally(() => setLoading(false));
  }, [isAdmin, isAuthenticated, profileReady]);

  async function updateState(orderId: string, newState: string) {
    try {
      await api.patch(`/admin/orders/${orderId}/state`, { state: newState });
      const updated = orders.map(o => o.id === orderId ? { ...o, state: newState } : o);
      setOrders(updated);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando panel administrativo...</Text>
      </View>
    );
  }

  // Animación del header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Cabecera del Panel */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
            <Text style={styles.title}>Panel Administrativo</Text>
            <Text style={styles.subtitle}>ZonaPc Builder — Control total</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.body}>
          {/* Métricas con diseño de imágenes de fondo y bordes brillantes */}
          {data && (
            <View style={styles.metricsGrid}>
              
              {/* Card 1: Órdenes Totales */}
              <View style={[styles.metricCard, { borderColor: `${Colors.primary}aa` }]}>
                <Image source={{ uri: METRIC_IMAGES.orders }} style={styles.cardBg} />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />
                <View style={styles.metricContent}>
                  <View style={[styles.metricIconBox, { backgroundColor: `${Colors.primary}25` }]}>
                    <Ionicons name="cube" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.metricValue}>{data.orders.total}</Text>
                  <Text style={styles.metricLabel}>Órdenes Totales</Text>
                </View>
              </View>

              {/* Card 2: Ingresos */}
              <TouchableOpacity
                style={[styles.metricCard, { borderColor: `${Colors.accent}aa` }]}
                onPress={() => router.push('/admin/revenue' as any)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: METRIC_IMAGES.revenue }} style={styles.cardBg} />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />
                <View style={styles.metricContent}>
                  <View style={[styles.metricIconBox, { backgroundColor: `${Colors.accent}25` }]}>
                    <Ionicons name="cash" size={20} color={Colors.accent} />
                  </View>
                  <Text style={styles.metricValue}>{formatPrice(data.revenue.total)}</Text>
                  <Text style={styles.metricLabel}>Ingresos</Text>
                  <Ionicons name="chevron-forward-circle" size={14} color={Colors.accent} style={styles.cardChevron} />
                </View>
              </TouchableOpacity>

              {/* Card 3: Cotizaciones */}
              <View style={[styles.metricCard, { borderColor: `${Colors.secondary}aa` }]}>
                <Image source={{ uri: METRIC_IMAGES.quotes }} style={styles.cardBg} />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />
                <View style={styles.metricContent}>
                  <View style={[styles.metricIconBox, { backgroundColor: `${Colors.secondary}25` }]}>
                    <Ionicons name="document-text" size={20} color={Colors.secondary} />
                  </View>
                  <Text style={styles.metricValue}>{data.quotes.total}</Text>
                  <Text style={styles.metricLabel}>Cotizaciones</Text>
                </View>
              </View>

              {/* Card 4: En Ensamblaje */}
              <View style={[styles.metricCard, { borderColor: `${Colors.warning}aa` }]}>
                <Image source={{ uri: METRIC_IMAGES.assembling }} style={styles.cardBg} />
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />
                <View style={styles.metricContent}>
                  <View style={[styles.metricIconBox, { backgroundColor: `${Colors.warning}25` }]}>
                    <Ionicons name="hardware-chip-outline" size={20} color={Colors.warning} />
                  </View>
                  <Text style={styles.metricValue}>{data.orders.byState?.assembling ?? 0}</Text>
                  <Text style={styles.metricLabel}>En Ensamblaje</Text>
                </View>
              </View>

            </View>
          )}

          {/* Sección de Gestión con Banners de Imágenes Parallax-Look */}
          <View style={styles.dividerRow}>
            <Text style={styles.sectionTitle}>Gestión de Operaciones</Text>
            <View style={styles.subLine} />
          </View>

          {[
            { label: 'Gestión de Personal', icon: 'people-outline', route: '/admin/vendors', image: NAV_IMAGES.personal, color: Colors.primary },
            { label: 'Gestionar Inventario', icon: 'cube-outline', route: '/admin/inventory', image: NAV_IMAGES.inventory, color: Colors.accent },
            { label: 'Ver Cotizaciones', icon: 'document-text-outline', route: '/admin/quotes', image: NAV_IMAGES.quotes, color: Colors.secondary },
            { label: 'Gestionar Órdenes', icon: 'list-outline', route: '/admin/orders', image: NAV_IMAGES.orders, color: Colors.warning },
            { label: 'Entregas', icon: 'car-outline', route: '/admin/deliveries', image: NAV_IMAGES.deliveries, color: Colors.success },
          ].map((item, index) => {
            const cardInputRange = [-1, 0, 180 * index, 180 * (index + 1.2)];
            
            // Animación de deslizamiento hacia arriba y desvanecimiento
            const opacity = scrollY.interpolate({
              inputRange: cardInputRange,
              outputRange: [1, 1, 1, 0],
              extrapolate: 'clamp'
            });

            const translateY = scrollY.interpolate({
              inputRange: cardInputRange,
              outputRange: [0, 0, 0, -25],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View
                key={item.label}
                style={[
                  styles.animatedNavContainer,
                  { opacity, transform: [{ translateY }] }
                ]}
              >
                <TouchableOpacity
                  style={[styles.navCard, { borderColor: `${item.color}44` }]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.image }} style={styles.navCardBg} resizeMode="cover" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    start={{ x: 0, y: 0.2 }}
                    end={{ x: 0.9, y: 0.8 }}
                    style={styles.navCardGradient}
                  />
                  
                  <View style={styles.navCardBody}>
                    <View style={[styles.navIconWrapper, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={22} color="#fff" />
                    </View>
                    <Text style={styles.navLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.navChevron} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Órdenes recientes */}
          <View style={styles.dividerRow}>
            <Text style={styles.sectionTitle}>Órdenes Recientes</Text>
            <View style={styles.subLine} />
          </View>

          {orders.map((order) => {
            const color = STATE_COLORS[order.state] ?? Colors.textMuted;
            const NEXT_STATES: Record<string, string> = {
              pending: 'components_ready',
              components_ready: 'assembling',
              assembling: 'software_install',
              software_install: 'testing',
              testing: 'ready',
              ready: 'delivered',
            };
            const nextState = NEXT_STATES[order.state];

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={[styles.orderState, { color }]}>
                      {ORDER_STATE_LABELS[order.state]}
                    </Text>
                  </View>
                  <Text style={styles.orderPrice}>{formatPrice(order.totalPrice)}</Text>
                </View>

                {nextState && (
                  <TouchableOpacity
                    style={[styles.advanceBtn, { borderColor: color, backgroundColor: `${color}06` }]}
                    onPress={() => updateState(order.id, nextState)}
                  >
                    <Ionicons name="arrow-forward-circle" size={16} color={color} />
                    <Text style={[styles.advanceBtnText, { color }]}>
                      Avanzar a: {ORDER_STATE_LABELS[nextState]}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Botón de logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl * 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '600',
  },

  // Cabecera
  header: {
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  body: {
    paddingHorizontal: 12, // Alineación al ras de la pantalla futurista
    gap: Spacing.md,
  },

  // Grilla de métricas premium
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    width: '48.5%',
    height: 125,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  metricContent: {
    ...StyleSheet.absoluteFillObject,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricValue: {
    fontSize: FontSize.md + 2,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metricLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardChevron: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Separador de secciones con estilo neón sutil
  dividerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subLine: {
    height: 3,
    width: 45,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },

  // Tarjetas de navegación premium tipo banners
  animatedNavContainer: {
    width: '100%',
    marginVertical: 4,
  },
  navCard: {
    height: 90,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  navCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  navCardBody: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  navIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  navLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navChevron: {
    alignSelf: 'center',
  },

  // Órdenes Recientes
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderState: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  orderPrice: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    height: 38,
  },
  advanceBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // Botón cerrar sesión
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.error,
  },
});
