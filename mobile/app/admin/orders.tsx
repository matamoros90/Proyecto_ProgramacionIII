import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, ORDER_STATE_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

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

const NEXT_STATES: Record<string, string> = {
  pending: 'components_ready',
  components_ready: 'assembling',
  assembling: 'software_install',
  software_install: 'testing',
  testing: 'ready',
  ready: 'delivered',
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'assembling', label: 'Ensamblaje' },
  { key: 'ready', label: 'Listas' },
  { key: 'delivered', label: 'Entregadas' },
];

export default function AdminOrders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { router.back(); return; }
    loadOrders();
  }, [isAdmin]);

  function loadOrders() {
    setLoading(true);
    (api.get('/admin/orders') as any).then((res: any) => {
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setOrders(list);
    }).finally(() => setLoading(false));
  }

  async function advanceState(orderId: string, newState: string) {
    try {
      await api.patch(`/admin/orders/${orderId}/state`, { state: newState });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, state: newState } : o));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function cancelOrder(orderId: string) {
    Alert.alert('Cancelar orden', '¿Confirmas que deseas cancelar esta orden?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar orden', style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/admin/orders/${orderId}/state`, { state: 'cancelled' });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, state: 'cancelled' } : o));
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.state === filter);

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="list-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestionar Órdenes</Text>
        <Text style={styles.subtitle}>{orders.length} órdenes en total</Text>
      </LinearGradient>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterChip, filter === opt.key && styles.filterChipActive]}
            onPress={() => setFilter(opt.key)}
          >
            <Text style={[styles.filterText, filter === opt.key && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="list-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Sin órdenes en este estado</Text>
            </View>
          ) : (
            filtered.map(order => {
              const color = STATE_COLORS[order.state] ?? Colors.textMuted;
              const nextState = NEXT_STATES[order.state];
              const clientId = `CLI-${String(order.userId ?? '').slice(-6).toUpperCase()}`;

              return (
                <View key={order.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.orderId}>
                        #{String(order.id ?? '').slice(-6).toUpperCase()}
                      </Text>
                      <Text style={styles.clientId}>{clientId}</Text>
                    </View>
                    <View style={styles.rightHeader}>
                      <Text style={styles.price}>{formatPrice(order.totalPrice ?? 0)}</Text>
                      <Text style={[styles.state, { color }]}>
                        {ORDER_STATE_LABELS[order.state] ?? order.state}
                      </Text>
                    </View>
                  </View>

                  {order.createdAt && (
                    <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                  )}

                  <View style={styles.actions}>
                    {nextState && order.state !== 'cancelled' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: color }]}
                        onPress={() => advanceState(order.id, nextState)}
                      >
                        <Ionicons name="arrow-forward-circle-outline" size={16} color={color} />
                        <Text style={[styles.actionText, { color }]}>
                          → {ORDER_STATE_LABELS[nextState]}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {order.state !== 'delivered' && order.state !== 'cancelled' && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => cancelOrder(order.id)}
                      >
                        <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
                        <Text style={styles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.warning },
  filterScroll: { maxHeight: 52 },
  filterContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  filterText: { fontSize: FontSize.sm, color: Colors.textMuted },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },
  body: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  emptyBox: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  clientId: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  rightHeader: { alignItems: 'flex-end', gap: 2 },
  price: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  state: { fontSize: FontSize.sm, fontWeight: '600' },
  date: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  actionText: { fontSize: FontSize.sm, fontWeight: '600' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  cancelText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '600' },
});
