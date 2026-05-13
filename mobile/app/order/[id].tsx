import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOrder } from '../../services/orders.service';
import type { Order, StateHistoryEntry } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ORDER_STATE_LABELS, formatPrice, formatDate, COMPONENT_LABELS } from '../../utils/formatters';

const STATE_FLOW = [
  'pending', 'components_ready', 'assembling',
  'software_install', 'testing', 'ready', 'delivered',
];

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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getOrder(id).then(setOrder).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>{loading ? 'Cargando...' : 'Orden no encontrada'}</Text>
      </View>
    );
  }

  const currentIdx = STATE_FLOW.indexOf(order.state);
  const stateColor = STATE_COLORS[order.state] ?? Colors.textMuted;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.orderId}>Orden #{order.id.slice(-8).toUpperCase()}</Text>
        <Text style={[styles.stateLabel, { color: stateColor }]}>
          {ORDER_STATE_LABELS[order.state]}
        </Text>
        <Text style={styles.totalPrice}>{formatPrice(order.totalPrice)}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Barra de progreso detallada */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Progreso del Ensamblaje</Text>
          {STATE_FLOW.map((state, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const pending = idx > currentIdx;
            const color = active ? stateColor : done ? Colors.success : Colors.border;

            return (
              <View key={state} style={styles.progressRow}>
                <View style={styles.progressLine}>
                  <View style={[styles.progressDot, { backgroundColor: color, borderColor: color }]}>
                    {done && <Ionicons name="checkmark" size={12} color="#000" />}
                    {active && <View style={styles.activePulse} />}
                  </View>
                  {idx < STATE_FLOW.length - 1 && (
                    <View style={[styles.progressConnector, { backgroundColor: done ? Colors.success : Colors.border }]} />
                  )}
                </View>
                <View style={styles.progressInfo}>
                  <Text style={[
                    styles.progressLabel,
                    active && { color: stateColor, fontWeight: '700' },
                    done && { color: Colors.success },
                    pending && { color: Colors.textMuted },
                  ]}>
                    {ORDER_STATE_LABELS[state]}
                  </Text>
                  {order.stateHistory?.find(h => h.state === state) && (
                    <Text style={styles.progressTime}>
                      {formatDate(order.stateHistory.find(h => h.state === state)!.timestamp)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Componentes del build */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Componentes</Text>
          {Object.entries(order.build).map(([type, component]) => (
            component && (
              <View key={type} style={styles.componentRow}>
                <Text style={styles.componentType}>{COMPONENT_LABELS[type] ?? type}</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.componentName} numberOfLines={1}>{component.name}</Text>
                  <Text style={styles.componentPrice}>{formatPrice(component.price)}</Text>
                </View>
              </View>
            )
          ))}
          <View style={styles.divider} />
          <View style={styles.componentRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.totalPrice)}</Text>
          </View>
        </View>

        {/* Historial de estados */}
        {order.stateHistory?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Historial</Text>
            {order.stateHistory.map((entry: StateHistoryEntry, idx: number) => (
              <View key={idx} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: STATE_COLORS[entry.state] ?? Colors.textMuted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyState}>{ORDER_STATE_LABELS[entry.state]}</Text>
                  {entry.note && <Text style={styles.historyNote}>{entry.note}</Text>}
                  <Text style={styles.historyTime}>{formatDate(entry.timestamp)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  header: { paddingTop: 56, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  orderId: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', letterSpacing: 1 },
  stateLabel: { fontSize: FontSize.lg, fontWeight: '700', marginTop: 4 },
  totalPrice: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  progressCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  progressRow: { flexDirection: 'row', gap: Spacing.sm, minHeight: 56 },
  progressLine: { alignItems: 'center', width: 24 },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'currentColor' },
  progressConnector: { width: 2, flex: 1, marginVertical: 2 },
  progressInfo: { flex: 1, paddingBottom: Spacing.sm },
  progressLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  progressTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  componentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  componentType: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },
  componentName: { fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'right', maxWidth: '60%' },
  componentPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border },
  totalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  historyRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  historyState: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  historyNote: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  historyTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
