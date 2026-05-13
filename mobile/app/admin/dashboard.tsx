import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, ORDER_STATE_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

interface DashboardData {
  orders: { total: number; byState: Record<string, number> };
  quotes: { total: number };
  revenue: { total: number };
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

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Sin acceso', 'No tienes permisos de administrador');
      router.back();
      return;
    }
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/orders'),
    ]).then(([dash, ord]: any) => {
      setData(dash.data);
      setOrders(ord.data.slice(0, 10));
    }).finally(() => setLoading(false));
  }, [isAdmin]);

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
        <Ionicons name="settings-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando panel admin...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Panel Administrativo</Text>
        <Text style={styles.subtitle}>ZonaPc Builder — Control total</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Métricas */}
        {data && (
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { borderColor: Colors.primary }]}>
              <Ionicons name="cube" size={24} color={Colors.primary} />
              <Text style={styles.metricValue}>{data.orders.total}</Text>
              <Text style={styles.metricLabel}>Órdenes Totales</Text>
            </View>
            <View style={[styles.metricCard, { borderColor: Colors.accent }]}>
              <Ionicons name="cash" size={24} color={Colors.accent} />
              <Text style={styles.metricValue}>{formatPrice(data.revenue.total)}</Text>
              <Text style={styles.metricLabel}>Ingresos</Text>
            </View>
            <View style={[styles.metricCard, { borderColor: Colors.secondary }]}>
              <Ionicons name="document-text" size={24} color={Colors.secondary} />
              <Text style={styles.metricValue}>{data.quotes.total}</Text>
              <Text style={styles.metricLabel}>Cotizaciones</Text>
            </View>
            <View style={[styles.metricCard, { borderColor: Colors.warning }]}>
              <Ionicons name="time" size={24} color={Colors.warning} />
              <Text style={styles.metricValue}>{data.orders.byState?.assembling ?? 0}</Text>
              <Text style={styles.metricLabel}>En Ensamblaje</Text>
            </View>
          </View>
        )}

        {/* Órdenes recientes */}
        <Text style={styles.sectionTitle}>Órdenes Recientes</Text>
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
                  style={[styles.advanceBtn, { borderColor: color }]}
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

        {/* Navegación admin */}
        <Text style={styles.sectionTitle}>Gestión</Text>
        {[
          { label: 'Gestionar Inventario', icon: 'cube', route: '/admin/inventory' },
          { label: 'Ver Cotizaciones', icon: 'document-text', route: '/admin/quotes' },
          { label: 'Gestionar Órdenes', icon: 'list', route: '/admin/orders' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.navCard}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
            <Text style={styles.navLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.primary },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  metricValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  orderState: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 2 },
  orderPrice: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  advanceBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navLabel: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
});
