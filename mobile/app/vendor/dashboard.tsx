import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getVendorQuotes, sendVendorFollowup, markQuoteReady, verifyQuotePayment,
} from '../../services/orders.service';
import type { Quote, QuoteStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, CATEGORY_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const STATUS_COLOR: Record<QuoteStatus, string> = {
  draft:             Colors.textMuted,
  confirmed:         Colors.textMuted,
  in_review:         Colors.warning,
  ready:             Colors.accent,
  accepted:          Colors.info,
  payment_submitted: Colors.secondary,
  payment_verified:  Colors.success,
  rejected:          Colors.error,
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  draft:             'Borrador',
  confirmed:         'Confirmada',
  in_review:         'En revisión',
  ready:             'Lista',
  accepted:          'Aceptada',
  payment_submitted: 'Pago enviado',
  payment_verified:  'Pago verificado',
  rejected:          'Rechazada',
};

export default function VendorDashboard() {
  const { isVendor, isAuthenticated, profileReady, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);
  }
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getVendorQuotes();
      setQuotes(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!profileReady || !isAuthenticated) return;
    if (!isVendor) {
      Alert.alert('Sin acceso', 'Esta sección es solo para vendedores');
      router.replace('/(auth)/login' as any);
      return;
    }
    load();
  }, [isVendor, isAuthenticated, profileReady]);

  async function handleFollowup(quoteId: string) {
    setActionLoading(quoteId + '_followup');
    try {
      await sendVendorFollowup(quoteId);
      Alert.alert('✓ Seguimiento enviado', 'El cliente recibió una notificación push.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkReady(quoteId: string) {
    Alert.alert(
      'Marcar como lista',
      '¿La cotización está revisada y lista para que el cliente la acepte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, marcar lista',
          onPress: async () => {
            setActionLoading(quoteId + '_ready');
            try {
              const updated = await markQuoteReady(quoteId);
              setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: updated.status } : q));
              Alert.alert('✓ Cotización lista', 'El cliente recibió una notificación push para revisarla.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }

  async function handleVerifyPayment(quoteId: string) {
    Alert.alert(
      'Verificar pago',
      '¿Confirmas que el pago es correcto? Se creará la orden y el cliente será notificado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Verificar y aprobar',
          onPress: async () => {
            setActionLoading(quoteId + '_verify');
            try {
              await verifyQuotePayment(quoteId);
              setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'payment_verified' as QuoteStatus } : q));
              Alert.alert('🎉 Pago verificado', 'La orden fue creada en estado "Ensamblaje". El cliente fue notificado.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando cotizaciones...</Text>
      </View>
    );
  }

  const pending   = quotes.filter(q => q.status === 'in_review').length;
  const awaitPay  = quotes.filter(q => q.status === 'payment_submitted').length;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <Text style={styles.title}>Panel Vendedor</Text>
        <Text style={styles.subtitle}>Gestiona tus cotizaciones asignadas</Text>
      </LinearGradient>

      {/* Métricas rápidas */}
      <View style={styles.metrics}>
        <View style={[styles.metric, { borderColor: Colors.primary }]}>
          <Text style={styles.metricNum}>{quotes.length}</Text>
          <Text style={styles.metricLabel}>Total asignadas</Text>
        </View>
        <View style={[styles.metric, { borderColor: Colors.warning }]}>
          <Text style={[styles.metricNum, { color: Colors.warning }]}>{pending}</Text>
          <Text style={styles.metricLabel}>En revisión</Text>
        </View>
        <View style={[styles.metric, { borderColor: Colors.secondary }]}>
          <Text style={[styles.metricNum, { color: Colors.secondary }]}>{awaitPay}</Text>
          <Text style={styles.metricLabel}>Pago pendiente</Text>
        </View>
      </View>

      <View style={styles.body}>
        {quotes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No tienes cotizaciones asignadas</Text>
          </View>
        ) : (
          quotes.map(quote => {
            const color = STATUS_COLOR[quote.status] ?? Colors.textMuted;
            return (
              <View key={quote.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.quoteId}>#{quote.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.category}>{CATEGORY_LABELS[quote.category] ?? quote.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.price}>{formatPrice(quote.totalPrice)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: color }]}>
                      <Text style={[styles.statusText, { color }]}>{STATUS_LABEL[quote.status]}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.date}>Recibida: {formatDate(quote.createdAt)}</Text>

                {/* Botones según estado */}
                <View style={styles.actions}>
                  {quote.status === 'in_review' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: Colors.warning }]}
                        onPress={() => handleFollowup(quote.id)}
                        disabled={actionLoading === quote.id + '_followup'}
                      >
                        <Ionicons name="notifications-outline" size={16} color={Colors.warning} />
                        <Text style={[styles.actionText, { color: Colors.warning }]}>
                          {actionLoading === quote.id + '_followup' ? 'Enviando...' : 'Seguimiento'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: Colors.accent }]}
                        onPress={() => handleMarkReady(quote.id)}
                        disabled={actionLoading === quote.id + '_ready'}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color={Colors.accent} />
                        <Text style={[styles.actionText, { color: Colors.accent }]}>
                          {actionLoading === quote.id + '_ready' ? 'Marcando...' : 'Cotización lista'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {quote.status === 'payment_submitted' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.verifyBtn]}
                      onPress={() => handleVerifyPayment(quote.id)}
                      disabled={actionLoading === quote.id + '_verify'}
                    >
                      <LinearGradient
                        colors={[Colors.accent, Colors.accentDark]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.verifyGradient}
                      >
                        <Ionicons name="shield-checkmark-outline" size={16} color="#000" />
                        <Text style={styles.verifyText}>
                          {actionLoading === quote.id + '_verify' ? 'Verificando...' : 'Verificar pago'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {quote.status === 'payment_verified' && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.verifiedText}>Pago verificado — orden creada</Text>
                    </View>
                  )}

                  {(quote.status === 'ready' || quote.status === 'accepted') && (
                    <View style={styles.waitingBadge}>
                      <Ionicons name="time-outline" size={16} color={Colors.info} />
                      <Text style={styles.waitingText}>Esperando acción del cliente</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.primary },
  metrics: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm },
  metric: { flex: 1, backgroundColor: Colors.cardLight, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1 },
  metricNum: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textOnLight },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textOnLightMuted, textAlign: 'center' },
  body: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  emptyBox: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  quoteId: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  category: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  price: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm, borderWidth: 1 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  date: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  actionText: { fontSize: FontSize.sm, fontWeight: '600' },
  verifyBtn: { flex: 1, borderWidth: 0, padding: 0 },
  verifyGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: BorderRadius.sm, paddingVertical: 8, paddingHorizontal: Spacing.md },
  verifyText: { fontSize: FontSize.sm, fontWeight: '800', color: '#000' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '600' },
  waitingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  waitingText: { fontSize: FontSize.sm, color: Colors.info },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.error, marginTop: Spacing.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },
});
