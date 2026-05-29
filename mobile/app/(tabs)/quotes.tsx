import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyQuotes, deleteMyQuote } from '../../services/orders.service';
import type { Quote, QuoteStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, CATEGORY_LABELS } from '../../utils/formatters';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string }> = {
  draft:             { label: 'Borrador',             color: Colors.textMuted },
  confirmed:         { label: 'Confirmada',           color: Colors.primary },
  in_review:         { label: 'En revisión',          color: Colors.warning },
  ready:             { label: '¡Lista!',               color: Colors.accent },
  accepted:          { label: 'Aceptada',             color: Colors.info },
  payment_submitted: { label: 'Pago enviado',         color: Colors.secondary },
  payment_verified:  { label: 'Pago verificado ✓',   color: Colors.success },
  rejected:          { label: 'Rechazada',            color: Colors.error },
};

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getMyQuotes();
      setQuotes(data);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleDelete(quote: Quote) {
    Alert.alert(
      'Eliminar cotización',
      `¿Seguro que deseas eliminar esta cotización por ${formatPrice(quote.totalPrice)}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const prev = quotes;
            setQuotes(p => p.filter(q => q.id !== quote.id));
            try {
              await deleteMyQuote(quote.id);
            } catch (err: any) {
              setQuotes(prev);
              Alert.alert('No se pudo eliminar', err.message ?? 'Inténtalo de nuevo');
            }
          },
        },
      ],
    );
  }

  function renderQuote({ item }: { item: Quote }) {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.draft;
    const canView = ['in_review', 'ready', 'accepted', 'payment_submitted', 'payment_verified'].includes(item.status);
    const canDelete = !['accepted', 'payment_submitted', 'payment_verified'].includes(item.status);
    const isReady = item.status === 'ready';
    const expired = new Date(item.expiresAt) < new Date();

    return (
      <TouchableOpacity
        style={[styles.quoteCard, isReady && styles.quoteCardHighlight]}
        onPress={() => canView && router.push(`/quote/${item.id}` as any)}
        activeOpacity={canView ? 0.7 : 1}
      >
        <View style={styles.quoteHeader}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${cfg.color}22` }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.quoteRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
        </View>

        <View style={styles.quoteRow}>
          <Text style={styles.meta}>Creada: {formatDate(item.createdAt)}</Text>
          {expired && item.status === 'draft' ? (
            <Text style={[styles.meta, { color: Colors.error }]}>Expirada</Text>
          ) : (
            <Text style={styles.meta}>{Object.keys(item.build).length} componentes</Text>
          )}
        </View>

        {item.status === 'in_review' && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={Colors.warning} />
            <Text style={[styles.infoText, { color: Colors.warning }]}>
              Nuestro equipo está revisando tu cotización
            </Text>
          </View>
        )}

        {item.status === 'ready' && (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push(`/quote/${item.id}` as any)}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Ionicons name="eye-outline" size={16} color="#000" />
              <Text style={styles.ctaBtnText}>Ver y aceptar cotización</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {item.status === 'payment_submitted' && (
          <View style={styles.infoRow}>
            <Ionicons name="hourglass-outline" size={14} color={Colors.secondary} />
            <Text style={[styles.infoText, { color: Colors.secondary }]}>
              Verificando tu comprobante de pago...
            </Text>
          </View>
        )}

        {item.status === 'payment_verified' && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={[styles.infoText, { color: Colors.success }]}>
              ¡Pago aprobado! Tu PC está en ensamblaje
            </Text>
          </View>
        )}

        {canView && item.status !== 'ready' && (
          <View style={styles.viewHint}>
            <Text style={styles.viewHintText}>Toca para ver detalles</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </View>
        )}

        {canDelete && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
            <Text style={styles.deleteText}>Eliminar cotización</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <Text style={styles.title}>Mis Cotizaciones</Text>
        <Text style={styles.subtitle}>{quotes.length} cotización(es)</Text>
      </LinearGradient>

      {quotes.length === 0 && !loading ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin cotizaciones todavía</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/builder/budget')}>
            <Text style={styles.newBtnText}>Generar mi primera cotización</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={i => i.id}
          renderItem={renderQuote}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
  newBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  newBtnText: { color: '#000', fontWeight: '700', fontSize: FontSize.md },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  quoteCardHighlight: { borderColor: Colors.accent, borderWidth: 2 },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryTag: { backgroundColor: Colors.primaryGlow, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  categoryText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600' },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: FontSize.xs, fontWeight: '600' },
  ctaBtn: { borderRadius: BorderRadius.sm, overflow: 'hidden' },
  ctaBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, gap: 6 },
  ctaBtnText: { color: '#000', fontWeight: '700', fontSize: FontSize.sm },
  viewHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  viewHintText: { fontSize: FontSize.xs, color: Colors.textMuted },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  deleteText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: '600' },
});
