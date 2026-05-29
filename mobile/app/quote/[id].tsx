import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getQuoteById } from '../../services/orders.service';
import type { Quote, QuoteStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, CATEGORY_LABELS, COMPONENT_LABELS } from '../../utils/formatters';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; icon: string }> = {
  draft:             { label: 'Borrador',             color: Colors.textMuted,   icon: 'document-outline' },
  confirmed:         { label: 'Confirmada',           color: Colors.primary,     icon: 'checkmark-circle-outline' },
  in_review:         { label: 'En revisión',          color: Colors.warning,     icon: 'time-outline' },
  ready:             { label: '¡Lista para aceptar!', color: Colors.accent,      icon: 'checkmark-done-circle-outline' },
  accepted:          { label: 'Aceptada',             color: Colors.info,        icon: 'thumbs-up-outline' },
  payment_submitted: { label: 'Pago enviado',         color: Colors.secondary,   icon: 'card-outline' },
  payment_verified:  { label: 'Pago verificado ✓',   color: Colors.success,     icon: 'shield-checkmark-outline' },
  rejected:          { label: 'Rechazada',            color: Colors.error,       icon: 'close-circle-outline' },
};

export default function QuoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getQuoteById(id)
      .then(setQuote)
      .catch(() => Alert.alert('Error', 'No se pudo cargar la cotización'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !quote) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando cotización...</Text>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.draft;
  const components = Object.entries(quote.build).filter(([, v]) => v != null);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Cotización</Text>
        <Text style={styles.quoteId}>#{quote.id.slice(-8).toUpperCase()}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Estado */}
        <View style={[styles.statusCard, { borderColor: cfg.color }]}>
          <Ionicons name={cfg.icon as any} size={28} color={cfg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            {quote.status === 'in_review' && (
              <Text style={styles.statusDesc}>
                {(quote as any).vendorName
                  ? `${(quote as any).vendorName} está revisando tu cotización.`
                  : 'Nuestro equipo está revisando tu cotización.'}
              </Text>
            )}
            {quote.status === 'ready' && (
              <Text style={styles.statusDesc}>Tu cotización está lista. Revisa los detalles y acepta para continuar.</Text>
            )}
            {quote.status === 'payment_submitted' && (
              <Text style={styles.statusDesc}>Tu comprobante de pago está siendo verificado. Te notificaremos pronto.</Text>
            )}
            {quote.status === 'payment_verified' && (
              <Text style={styles.statusDesc}>¡Pago aprobado! Tu PC ha entrado al proceso de ensamblaje.</Text>
            )}
          </View>
        </View>

        {/* Precio y categoría */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoría</Text>
            <Text style={styles.infoValue}>{CATEGORY_LABELS[quote.category] ?? quote.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={[styles.infoValue, { color: Colors.accent, fontSize: FontSize.xl }]}>
              {formatPrice(quote.totalPrice)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creada</Text>
            <Text style={styles.infoValue}>{formatDate(quote.createdAt)}</Text>
          </View>
          {quote.deliveryDepartment && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Entrega</Text>
              <Text style={styles.infoValue}>{quote.deliveryDepartment}</Text>
            </View>
          )}
          {quote.paymentMethod && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método de pago</Text>
              <Text style={styles.infoValue}>
                {quote.paymentMethod === 'card'
                  ? `Tarjeta •••• ${quote.paymentData?.last4 ?? '****'}`
                  : `Depósito — Ref: ${quote.paymentData?.bankRef ?? '—'}`}
              </Text>
            </View>
          )}
        </View>

        {/* Componentes */}
        <Text style={styles.sectionTitle}>Componentes ({components.length})</Text>
        {components.map(([type, comp]) => (
          <View key={type} style={styles.componentRow}>
            <Text style={styles.compType}>{COMPONENT_LABELS[type] ?? type}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.compName} numberOfLines={1}>
                {(comp as any).brand} {(comp as any).name}
              </Text>
            </View>
            <Text style={styles.compPrice}>{formatPrice((comp as any).price ?? 0)}</Text>
          </View>
        ))}

        {/* Acciones según estado */}
        {quote.status === 'ready' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push(`/quote/payment?quoteId=${quote.id}` as any)}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Ionicons name="card-outline" size={20} color="#000" />
              <Text style={styles.btnTextDark}>Proceder al pago</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {quote.status === 'accepted' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push(`/quote/payment?quoteId=${quote.id}&step=payment` as any)}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Ionicons name="card-outline" size={20} color="#fff" />
              <Text style={styles.btnTextLight}>Proceder al pago</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {quote.status === 'payment_verified' && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(tabs)/orders' as any)}
          >
            <Ionicons name="cube-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Ver mis órdenes</Text>
          </TouchableOpacity>
        )}
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
  quoteId: { fontSize: FontSize.sm, color: Colors.textMuted },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  statusLabel: { fontSize: FontSize.md, fontWeight: '700' },
  statusDesc: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compType: { width: 100, fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  compName: { fontSize: FontSize.sm, color: Colors.textPrimary },
  compPrice: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  primaryBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, gap: Spacing.sm },
  btnTextDark: { fontSize: FontSize.md, fontWeight: '800', color: '#000' },
  btnTextLight: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  secondaryBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
});
