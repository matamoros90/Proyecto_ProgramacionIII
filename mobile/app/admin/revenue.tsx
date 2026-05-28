import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export default function AdminRevenue() {
  const { isAdmin } = useAuth();
  const [revenue, setRevenue] = useState({ total: 0, totalAll: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { router.back(); return; }
    (api.get('/admin/dashboard') as any).then((res: any) => {
      setRevenue({
        total: res.data?.revenue?.total ?? 0,
        totalAll: res.data?.revenue?.totalAll ?? 0,
      });
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  const pending = revenue.totalAll - revenue.total;

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="cash-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando ingresos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Ingresos</Text>
        <Text style={styles.subtitle}>Resumen financiero del negocio</Text>
      </LinearGradient>

      <View style={styles.body}>
        <View style={[styles.card, { borderColor: Colors.primary }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="cube-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={[styles.cardValue, { color: Colors.primary }]}>
            {formatPrice(revenue.totalAll)}
          </Text>
          <Text style={styles.cardLabel}>Monto Total de Órdenes</Text>
          <Text style={styles.cardDesc}>
            Suma de todas las órdenes activas y completadas (excluye canceladas)
          </Text>
        </View>

        <View style={[styles.card, { borderColor: Colors.accent }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="checkmark-circle-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={[styles.cardValue, { color: Colors.accent }]}>
            {formatPrice(revenue.total)}
          </Text>
          <Text style={styles.cardLabel}>Monto Existente (Cobrado)</Text>
          <Text style={styles.cardDesc}>
            Órdenes entregadas — dinero ya recibido de clientes
          </Text>
        </View>

        <View style={[styles.card, { borderColor: Colors.warning }]}>
          <View style={styles.cardIcon}>
            <Ionicons name="time-outline" size={32} color={Colors.warning} />
          </View>
          <Text style={[styles.cardValue, { color: Colors.warning }]}>
            {formatPrice(pending)}
          </Text>
          <Text style={styles.cardLabel}>Monto Pendiente</Text>
          <Text style={styles.cardDesc}>
            Órdenes en proceso — aún por cobrar
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Total Órdenes</Text>
            <Text style={[styles.summaryVal, { color: Colors.primary }]}>
              {formatPrice(revenue.totalAll)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>+ Cobrado</Text>
            <Text style={[styles.summaryVal, { color: Colors.accent }]}>
              {formatPrice(revenue.total)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={[styles.summaryKey, { color: Colors.textPrimary, fontWeight: '700' }]}>
              Resultado Total
            </Text>
            <Text style={[styles.summaryVal, { color: Colors.textPrimary, fontWeight: '800' }]}>
              {formatPrice(revenue.totalAll + revenue.total)}
            </Text>
          </View>
        </View>
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
  subtitle: { fontSize: FontSize.sm, color: Colors.accent },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary },
  cardLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  summaryKey: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSize.md, fontWeight: '600' },
});
