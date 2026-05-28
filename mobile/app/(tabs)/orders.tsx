import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyOrders } from '../../services/orders.service';
import type { Order } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ORDER_STATE_LABELS, formatPrice, formatRelativeDate } from '../../utils/formatters';

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

const STATE_ICONS: Record<string, string> = {
  pending: 'time',
  components_ready: 'checkbox',
  assembling: 'construct',
  software_install: 'desktop',
  testing: 'flask',
  ready: 'checkmark-circle',
  delivered: 'gift',
  cancelled: 'close-circle',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadOrders() {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  function renderOrder({ item }: { item: Order }) {
    const color = STATE_COLORS[item.state] ?? Colors.textMuted;
    const icon = STATE_ICONS[item.state] ?? 'cube';
    const totalComponents = Object.keys(item.build).length;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        <View style={styles.orderHeader}>
          <View style={[styles.stateIcon, { backgroundColor: `${color}22` }]}>
            <Ionicons name={icon as any} size={22} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>Orden #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={[styles.stateLabel, { color }]}>
              {ORDER_STATE_LABELS[item.state]}
            </Text>
          </View>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          {['pending', 'components_ready', 'assembling', 'software_install', 'testing', 'ready', 'delivered'].map(
            (state, idx, arr) => {
              const currentIdx = arr.indexOf(item.state);
              const active = idx <= currentIdx && item.state !== 'cancelled';
              return (
                <View
                  key={state}
                  style={[
                    styles.progressStep,
                    { backgroundColor: active ? color : Colors.border },
                    idx < arr.length - 1 && { marginRight: 3 },
                  ]}
                />
              );
            }
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderMeta}>{totalComponents} componentes</Text>
          <Text style={styles.orderMeta}>{formatRelativeDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.emptyText}>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <Text style={styles.title}>Mis Órdenes</Text>
        <Text style={styles.subtitle}>{orders.length} orden(es) encontrada(s)</Text>
      </LinearGradient>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No tienes órdenes aún</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/builder/budget')}
          >
            <Text style={styles.ctaBtnText}>Armar mi primera PC</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadOrders(); }}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
  ctaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  ctaBtnText: { color: '#000', fontWeight: '700', fontSize: FontSize.md },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stateIcon: { width: 44, height: 44, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  orderId: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  stateLabel: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 2 },
  price: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  progressContainer: { flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden' },
  progressStep: { flex: 1, borderRadius: 3 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  orderMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
});
