import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyQuotes, confirmQuote, createOrder } from '../../services/orders.service';
import type { Quote } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, CATEGORY_LABELS } from '../../utils/formatters';

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getMyQuotes();
      setQuotes(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleConfirmAndOrder(quote: Quote) {
    Alert.alert(
      'Confirmar Cotización',
      `¿Deseas confirmar y crear la orden de ensamblaje por ${formatPrice(quote.totalPrice)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              let confirmed = quote;
              if (quote.status === 'draft') {
                confirmed = await confirmQuote(quote.id);
              }
              const order = await createOrder(confirmed.id);
              Alert.alert('¡Orden Creada!', 'Tu orden de ensamblaje fue creada exitosamente.', [
                { text: 'Ver Orden', onPress: () => router.push(`/order/${order.id}` as any) },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  }

  function renderQuote({ item }: { item: Quote }) {
    const isConfirmed = item.status === 'confirmed';
    const expired = new Date(item.expiresAt) < new Date();

    return (
      <View style={styles.quoteCard}>
        <View style={styles.quoteHeader}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isConfirmed ? `${Colors.success}22` : `${Colors.warning}22` }]}>
            <Text style={[styles.statusText, { color: isConfirmed ? Colors.success : Colors.warning }]}>
              {isConfirmed ? 'Confirmada' : 'Borrador'}
            </Text>
          </View>
        </View>

        <View style={styles.quoteRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
        </View>

        <View style={styles.quoteRow}>
          <Text style={styles.meta}>Creada: {formatDate(item.createdAt)}</Text>
          {expired ? (
            <Text style={[styles.meta, { color: Colors.error }]}>Expirada</Text>
          ) : (
            <Text style={styles.meta}>Vence: {formatDate(item.expiresAt)}</Text>
          )}
        </View>

        <Text style={styles.componentsCount}>
          {Object.keys(item.build).length} componentes seleccionados
        </Text>

        {!isConfirmed && !expired && (
          <TouchableOpacity style={styles.orderBtn} onPress={() => handleConfirmAndOrder(item)}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.orderBtnGradient}
            >
              <Ionicons name="construct" size={18} color="#fff" />
              <Text style={styles.orderBtnText}>Ordenar Ensamblaje</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <Text style={styles.title}>Mis Cotizaciones</Text>
        <Text style={styles.subtitle}>{quotes.length} cotización(es)</Text>
      </LinearGradient>

      {quotes.length === 0 && !loading ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin cotizaciones todavía</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/builder/budget')}>
            <Text style={styles.ctaBtnText}>Generar mi primera cotización</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(i) => i.id}
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
  ctaBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  ctaBtnText: { color: '#000', fontWeight: '700', fontSize: FontSize.md },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryTag: { backgroundColor: Colors.primaryGlow, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  categoryText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600' },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  componentsCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  orderBtn: { borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.xs },
  orderBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, gap: Spacing.sm },
  orderBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
