import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, ORDER_STATE_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const STATE_COLORS: Record<string, string> = {
  ready: Colors.accent,
  delivered: Colors.success,
};

export default function AdminDeliveries() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { router.back(); return; }
    (api.get('/admin/orders') as any).then((res: any) => {
      const list: any[] = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setOrders(list.filter(o => ['ready', 'delivered'].includes(o.state)));
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  function openMap(address?: string) {
    const query = address
      ? encodeURIComponent(address)
      : 'Ciudad+de+Guatemala';
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando entregas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Entregas</Text>
        <Text style={styles.subtitle}>{orders.length} órdenes listas o entregadas</Text>
      </LinearGradient>

      {/* Encabezado de tabla */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, { width: 32 }]}>#</Text>
        <Text style={[styles.colHeader, { flex: 1 }]}>Cliente</Text>
        <Text style={[styles.colHeader, { width: 90 }]}>Monto</Text>
        <Text style={[styles.colHeader, { width: 90 }]}>Fecha</Text>
        <Text style={[styles.colHeader, { width: 60 }]}>Mapa</Text>
      </View>

      <View style={styles.body}>
        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No hay entregas pendientes</Text>
          </View>
        ) : (
          orders.map((order, index) => {
            const color = STATE_COLORS[order.state] ?? Colors.textMuted;
            const clientId = `CLI-${String(order.userId ?? '').slice(-6).toUpperCase()}`;
            const address = order.deliveryAddress;

            return (
              <View key={order.id} style={styles.row}>
                <Text style={[styles.colNum, { width: 32 }]}>{index + 1}</Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.colClient}>{clientId}</Text>
                  <Text style={[styles.colState, { color }]}>
                    {ORDER_STATE_LABELS[order.state]}
                  </Text>
                </View>

                <View style={{ width: 90 }}>
                  <Text style={styles.colAmount}>{formatPrice(order.totalPrice ?? 0)}</Text>
                </View>

                <View style={{ width: 90 }}>
                  <Text style={styles.colDate}>
                    {order.createdAt ? formatDate(order.createdAt) : '—'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.mapBtn, { width: 60 }]}
                  onPress={() => openMap(address)}
                >
                  <Ionicons name="map-outline" size={20} color={Colors.primary} />
                  {!address && (
                    <Text style={styles.mapNote}>N/A</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.noteBox}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.noteText}>
          Las direcciones se registran al crear la orden. Si no hay dirección, el mapa abre Guatemala Ciudad.
        </Text>
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
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  colHeader: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  body: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  emptyBox: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  colNum: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '700' },
  colClient: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  colState: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
  colAmount: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textPrimary },
  colDate: { fontSize: FontSize.xs, color: Colors.textSecondary, flexWrap: 'wrap' },
  mapBtn: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  mapNote: { fontSize: 9, color: Colors.textMuted },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
});
